import EventEmitter from './Utils/EventEmitter.js'
import { gsap } from 'gsap'
import * as THREE from 'three'
import Experience from './Experience.js'

export default class Loading extends EventEmitter {
  constructor() {
    super()

    this.experience = new Experience()
    this.resources = this.experience.resources
    this.sceneOrtho = this.experience.sceneOrtho
    this.userInputs = this.experience.userInputs
    this.canvas = this.experience.canvas

    this.visualProgress = 0
    this.targetProgress = 0
  }

  setMicMessage() {
    const model = this.resources.items.gKeyModel.scene
    this.micMessage = model.getObjectByName('micMessage')
    this.micMessage.scale.set(150, 150, 150)
    this.micMessage.position.set(0, 130, -3)

    this.micMessage.material = new THREE.MeshBasicMaterial({
      map: this.micMessage.material.map,
      transparent: true,
      opacity: 0,
    })
    this.micMessage.visible = false
    this.sceneOrtho.add(this.micMessage)
  }

  showMicMessage() {
    this.micMessage.visible = true
    gsap.to(this.micMessage.material, {
      opacity: 1,
      duration: 0.5,
      onComplete: () => {
        //Check microphone permission
        this.canvas.addEventListener('click', () => this.startXP(), {
          once: true,
        })
      },
    })
  }

  startXP() {
    this.userInputs.init()
    this.hidePermissionUI()
    this.trigger('finished')
  }

  hidePermissionUI() {
    gsap.to(this.micMessage.material, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        this.micMessage.visible = false
      },
    })

    if (!this.experience.sizes.isPortrait)
      gsap.to(this.overlayMaterial.uniforms.uAlpha, {
        value: 0,
        delay: 0.3,
        duration: 0.8,
        ease: 'power2.out',
      })
  }

  setOverlay() {
    const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
    this.overlayMaterial = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uAlpha: { value: 1 },
      },
      vertexShader: `
                void main()
                {
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
      fragmentShader: `
                uniform float uAlpha;

                void main()
                {
                    gl_FragColor = vec4(0.25, 0.25, 0.25 , uAlpha);
                }
            `,
    })
    const overlay = new THREE.Mesh(
      overlayGeometry,
      this.overlayMaterial
    )
    overlay.name = 'overlay'
    overlay.scale.set(800, 600, 1)
    overlay.position.set(0, 0, -10)
    this.sceneOrtho.add(overlay)
  }

  setGKey() {
    const model = this.resources.items.gKeyModel.scene
    this.gKey = model.getObjectByName('Gkey')

    this.gKey.material = new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 },
      },
      vertexShader: `
                varying vec2 vUv;
                void main() {
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    vUv = uv;
                }
            `,
      fragmentShader: `
                uniform float uProgress;
                varying vec2 vUv;
                void main() {
                    // Gkey color
                    vec3 color = vec3(1.0, 1.0, 1.0);
                    
                    // Alpha
                    float alpha = step(1.0 - uProgress, vUv.y);
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
      transparent: true,
    })
    this.gKey.scale.set(40, 40, 40)
    this.gKey.position.set(0, 0, -5)
    this.sceneOrtho.add(this.gKey)
  }

  finishGKey() {
    gsap.to(this, {
      targetProgress: 1,
      duration: 1,
      ease: 'power2.out',
      onComplete: () => {
        gsap.delayedCall(0.2, () => {
          if (this.gKey && this.gKey.material) {
            gsap.to(this.gKey.material.uniforms.uProgress, {
              value: -0.15,
              duration: 0.7,
              ease: 'power2.in',
              onComplete: () => {
                this.sceneOrtho.remove(this.gKey)
                this.showMicMessage()
              },
            })
          }
        })
      },
    })
  }

  update() {
    if (this.gKey) {
      this.visualProgress +=
        (this.targetProgress - this.visualProgress) * 0.5
      this.gKey.material.uniforms.uProgress.value =
        this.visualProgress
    }
  }
}
