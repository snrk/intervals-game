import * as THREE from 'three'
import Experience from '../Experience'
import gsap from 'gsap'

export default class Stage {
  constructor() {
    this.experience = new Experience()
    this.debug = this.experience.debug
    this.world = this.experience.world
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    // this.ringPosition = this.experience.ringPosition
    this.keyWidth = 0

    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder('Keyboard').close()
    }

    // Setup
    this.resource = this.resources.items.stageModel

    this.experience.on('octaveChanged', (noteChange) => {
      this.onOctaveChanged(noteChange)
    })

    this.setModel()
    this.setBalls()
    this.setRing()
    this.getKeyWidth()
    this.setKeyboard()
  }

  setBalls() {
    this.ballBaseTemplate = this.model.getObjectByName('BallBase')
    this.ballIntervalTemplate =
      this.model.getObjectByName('ballInterval')
  }
  animBallBase(xPosition, duration) {
    this.ballBaseTemplate.position.x = xPosition
    this.ballBaseIn = gsap
      .timeline({ paused: true })
      .fromTo(
        this.ballBaseTemplate.position,
        { z: -20 },
        { duration: duration, z: 5 },
        '<'
      )
    this.ballBaseIn.play()
  }
  animBallInterval(xPosition, duration) {
    this.ballIntervalTemplate.position.x = xPosition
    this.ballIntervalIn = gsap
      .timeline({ paused: true })
      .fromTo(
        this.ballIntervalTemplate.position,
        { z: -20 },
        { duration: duration, z: 5 },
        '<'
      )
    this.ballIntervalIn.play()
  }

  midiToPositionX(midiNote) {
    const noteDifference =
      midiNote - this.experience.game.baseOctaveNote - 24
    return noteDifference * this.keyWidth + this.keyWidth * 0.5
  }

  onOctaveChanged(noteChange) {
    const shiftX = noteChange * this.keyWidth
    this.experience.ringPosition += shiftX
  }

  setModel() {
    this.model = this.resource.scene
    this.model.scale.set(10, 10, 10)

    this.sceneGroup = this.experience.sceneGroup
    this.sceneGroup.name = 'sceneGroup'
    this.sceneGroup.add(this.model)
    this.sceneGroup.position.set(0, 0, 0)
    this.scene.add(this.sceneGroup)

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
      }
    })

    // Debug
    if (this.debug.active) {
      this.debugFolder
        .add(this.sceneGroup.position, 'x')
        .name('scenePosX')
        .min(-1000)
        .max(1000)
        .step(1)
    }
  }

  setRing() {
    this.model = this.resource.scene
    this.ringPlayer = this.model.getObjectByName('PlayerRing')
    this.ringPlayer.position.x = this.experience.ringPosition
  }

  setKeyboard() {
    this.raycastKeyboard = this.model.getObjectByName('raycastCube')

    this.raycastKeyboard.castShadow = false
    this.raycastKeyboard.receiveShadow = false
    this.raycastKeyboard.noEnvUpdate = true

    // raycastCube Animation
    this.raycastKeyboardIn = gsap
      .timeline({ paused: true })
      .fromTo(
        this.raycastKeyboard.position,
        { y: -10 },
        { duration: 0.2, y: 0.14534, ease: 'power2.inOut' },
        '<'
      )
  }

  getKeyWidth() {
    const firstKey = this.model.getObjectByName('note1')
    const lastKey = this.model.getObjectByName('note24')

    if (firstKey && lastKey) {
      const firstKeyPosition = new THREE.Vector3()
      firstKey.getWorldPosition(firstKeyPosition)

      const lastKeyPosition = new THREE.Vector3()
      lastKey.getWorldPosition(lastKeyPosition)

      const totalSpan = lastKeyPosition.x - firstKeyPosition.x
      this.keyWidth = totalSpan / 23 / 10
      this.experience.KEY_WIDTH = this.keyWidth
    }
  }

  update() {
    this.ringPlayer.position.x = THREE.MathUtils.lerp(
      this.ringPlayer.position.x,
      this.experience.ringPosition,
      0.1
    )
  }
}
