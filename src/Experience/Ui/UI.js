import * as THREE from 'three'
import gsap from 'gsap'
import Experience from '../Experience'
import { INTERVALS } from '../intervals'
import Minimap from './Minimap'

export default class UI {
  constructor() {
    //Setup
    this.experience = new Experience()
    this.camerasGroup = this.experience.camera.camerasGroup
    this.sceneOrtho = this.experience.sceneOrtho
    this.resources = this.experience.resources
    this.camera = this.experience.camera
    this.time = this.experience.time
    this.canvas = this.experience.canvas
    this.debug = this.experience.debug
    this.sizes = this.experience.sizes
    this.game = this.experience.game

    this.model = this.resources.items.stageModel.scene

    this.minimap = new Minimap()

    this.pianoKeys = []
    for (let i = 1; i <= 24; i++) {
      const keyMesh = this.model.getObjectByName(`note${i}`)
      if (keyMesh) {
        this.pianoKeys.push(keyMesh)
      }
    }

    this.isTutorialPlaying = false
    this.textTimeline = null

    //Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder('ui').open()
    }

    this.setOrientationMessage()

    this.setFullscreenButton()
    this.setBackButton()
    this.setIntervalsButton()
    this.setDiskIntervals()
    this.setGameTextes()

    //tuto
    this.setTutoTitle()
    this.setTutoTexte()
    this.setLineArrow()
    this.setCurveArrow()

    this.setTimelinesButton()
  }

  getKeyPositionX(keyIndex) {
    if (keyIndex >= 0 && keyIndex < this.pianoKeys.length) {
      const keyMesh = this.pianoKeys[keyIndex]
      return keyMesh.position.x
    }
  }

  /**
   *  Tutorial
   */
  checkIfTutorialSeen() {
    return localStorage.getItem('tutorialSeen') === 'true'
  }
  markTutorialAsSeen() {
    localStorage.setItem('tutorialSeen', 'true')
  }
  resetTutorial() {
    localStorage.removeItem('tutorialSeen')
  }
  /**
   * Tutorial Textes
   */

  // Title tuto
  setTutoTitle() {
    this.tutoTitle = this.model.getObjectByName('tutoTitle')
    this.tutoTitle.scale.set(0, 0, 0)
    this.sceneOrtho.add(this.tutoTitle)

    // Set texture
    this.tutoTitle.material.map.repeat.x = 1
    this.tutoTitle.material.map.repeat.y = 0.1
    this.tutoTitle.material.map.offset.y = 0.4

    this.setTutoTitlePosition()

    // if (this.debug.active) {
    //     this.debugFolder.add(this.tutoTitle.material.map.repeat, 'x').name('tutTitleRepeatX').min(-1).max(1).step(0.001)
    //     this.debugFolder.add(this.tutoTitle.material.map.repeat, 'y').name('tutTitleRepeatY').min(-1).max(1).step(0.001)
    //     this.debugFolder.add(this.tutoTitle.material.map.offset, 'y').name('tutTitleOffsetY').min(-1).max(1).step(0.001)
    // }
  }
  setTutoTitlePosition() {
    this.tutoTitle.position.set(0, this.sizes.height * 0.1, -50)
  }

  // Texte tuto
  setTutoTexte() {
    this.tutoTexte = this.model.getObjectByName('tutoText')
    this.tutoTexte.scale.set(0, 0, 0)
    this.sceneOrtho.add(this.tutoTexte)
    this.setTutoTextePosition()
  }
  setTutoTextePosition() {
    this.tutoTexte.position.set(0, 0, -50)
  }

  // Line arrow tuto
  setLineArrow() {
    this.lineArrow = this.model.getObjectByName('straightArrow')
    this.lineArrow.material = this.lineArrow.material.clone()
    this.lineArrow.material.emissive.set('#f73737')

    this.lineArrow.scale.set(0, 0, 0)
    this.lineArrow.rotation.y = -Math.PI * 0.25
    this.minimap.minimapOffset.add(this.lineArrow)

    this.setLineArrowPosition()
    // if (this.debug.active) {
    //     this.debugFolder.add(this.lineArrow.position, 'x').name('lineArrowPX').min(-100).max(100).step(0.001)
    //     this.debugFolder.add(this.lineArrow.position, 'y').name('lineArrowPY').min(-100).max(100).step(0.001)
    // }
  }
  setLineArrowPosition() {
    this.lineArrow.position.set(0, 120, 0)
  }

  // Line arrow tuto
  setCurveArrow() {
    this.curveArrowPlus = this.model.getObjectByName('curvedArrow')
    this.curveArrowPlus.material =
      this.curveArrowPlus.material.clone()
    this.curveArrowPlus.material.emissive.set('#f73737')

    this.curveArrowPlus.scale.set(0, 0, 0)
    this.curveArrowMinus = this.curveArrowPlus.clone()
    this.curveArrowPlus.rotation.y = 2.18
    this.minimap.plusButton.add(this.curveArrowPlus)

    //Clone and naming - & +
    this.curveArrowMinus.scale.x *= -1
    this.curveArrowMinus.rotation.y = -2.18
    this.minimap.minusButton.add(this.curveArrowMinus)

    this.setCurveArrowPosition()

    // if (this.debug.active) {
    //     this.debugFolder.add(this.curveArrowPlus.position, 'x').name('+curveArrowPX').min(-3).max(3).step(0.001)
    //     this.debugFolder.add(this.curveArrowPlus.position, 'y').name('+curveArrowPY').min(-3).max(3).step(0.001)
    //     this.debugFolder.add(this.curveArrowPlus.rotation, 'y').name('+curveArrowRY').min(-Math.PI).max(Math.PI).step(0.001)
    //     this.debugFolder.add(this.curveArrowMinus.position, 'x').name('-curveArrowPX').min(-3).max(3).step(0.001)
    //     this.debugFolder.add(this.curveArrowMinus.position, 'y').name('-curveArrowPY').min(-3).max(3).step(0.001)
    //     this.debugFolder.add(this.curveArrowMinus.rotation, 'y').name('-curveArrowRY').min(-Math.PI).max(Math.PI).step(0.001)
    // }
  }
  setCurveArrowPosition() {
    this.curveArrowPlus.position.set(-0.16, 0.16, 0)
    this.curveArrowMinus.position.set(0.16, 0.16, 0)
  }

  startTutorialAnimation() {
    const tl = gsap.timeline({
      onComplete: () => {
        this.isTutorialPlaying = false
        this.markTutorialAsSeen()
        // Remove Elements
        // this.sceneOrtho.remove(this.curveArrowMinus)
      },
    })

    // Toturial Timeline
    tl.to(
      this.tutoTitle.scale,
      {
        delay: 0.5,
        duration: 0.5,
        x: 200,
        y: 200,
        z: 200,
        ease: 'power1.inOut',
      },
      'start'
    )
      .fromTo(
        this.tutoTexte.scale,
        { x: 0, y: 0, z: 0 },
        {
          duration: 0.5,
          x: 200,
          y: 200,
          z: 200,
          ease: 'power1.inOut',
        },
        'start+=1.5'
      )
      .fromTo(
        this.lineArrow.scale,
        { x: 0, y: 0, z: 0 },
        {
          duration: 0.5,
          x: 200,
          y: 200,
          z: 200,
          ease: 'power1.inOut',
        },
        'start+=1.9'
      )
      .fromTo(
        this.curveArrowMinus.scale,
        { x: 0, y: 0, z: 0 },
        {
          duration: 0.5,
          x: 0.66,
          y: 0.66,
          z: 0.66,
          ease: 'power1.inOut',
        },
        'start+=2'
      )
      .fromTo(
        this.curveArrowPlus.scale,
        { x: 0, y: 0, z: 0 },
        {
          duration: 0.5,
          x: -0.66,
          y: 0.66,
          z: 0.66,
          ease: 'power1.inOut',
        },
        'start+=2'
      )
      .to(
        [
          this.lineArrow.scale,
          this.curveArrowPlus.scale,
          this.curveArrowMinus.scale,
          this.tutoTexte.scale,
        ],
        {
          duration: 0.3,
          x: 0,
          y: 0,
          z: 0,
          ease: 'power2.in',
        },
        'start+=5'
      )
      .to(
        this.tutoTitle.material.map.offset,
        {
          duration: 0.4,
          y: 0.5,
          ease: 'power1.out',
        },
        'start+=5.2'
      )
      .add(() => {
        this.intervalsDiskIn.play()
      }, 'start+=5.1')
      .to(
        this.tutoTitle.scale,
        {
          duration: 0.3,
          x: 0,
          y: 0,
          z: 0,
          ease: 'power1.in',
        },
        'start+=8'
      )
  }

  /**
   * Game Textes
   */
  setGameTextes() {
    this.gameTextes = this.model.getObjectByName('textesGame')
    this.gameTextes.scale.set(0, 0, 0)
    this.sceneOrtho.add(this.gameTextes)
    this.setGameTextesPosition()
  }

  setGameTextesPosition() {
    this.gameTextes.position.set(0, -100, -50)
  }

  /**
   * UI Textes
   */
  showText(text) {
    if (this.textTimeline) {
      this.textTimeline.kill()
    }

    // Set texture
    this.gameTextes.material.map.repeat.x = 0.97
    this.gameTextes.material.map.repeat.y = 0.2
    this.gameTextes.material.map.offset.x = 1.015
    this.gameTextes.material.map.offset.y = 0.01

    if (text === 'listen') {
      this.gameTextes.material.map.offset.y = 0.01
    } else if (text === 'sing') {
      this.gameTextes.material.map.offset.y = 0.2
    } else if (text === 'perfect') {
      this.gameTextes.material.map.offset.y = 0.4
    } else if (text === 'good') {
      this.gameTextes.material.map.offset.y = 0.6
    } else if (text === 'miss') {
      this.gameTextes.material.map.offset.y = 0.8
    }

    this.textTimeline = gsap.timeline()
    this.textTimeline
      // In
      .to(this.gameTextes.scale, {
        duration: 0.3,
        x: 200,
        y: 200,
        z: 200,
        ease: 'back.out',
      })
      // Out
      .to(
        this.gameTextes.scale,
        { duration: 0.3, x: 0, y: 0, z: 0, ease: 'back.in' },
        '+=.4'
      )

    // if (this.debug.active) {
    //     this.debugFolder.add(this.gameTextes.material.map.repeat, 'x').name('gameTextRepeatX').min(-1).max(1.1).step(0.001)
    //     this.debugFolder.add(this.gameTextes.material.map.repeat, 'y').name('gameTextRepeatY').min(-1).max(1).step(0.001)
    //     this.debugFolder.add(this.gameTextes.material.map.offset, 'x').name('gameTextOffsetX').min(-1).max(1.1).step(0.001)
    //     this.debugFolder.add(this.gameTextes.material.map.offset, 'y').name('gameTextOffsetY').min(-1).max(1.1).step(0.001)
    // }
  }

  /**
   * Back button
   */
  setBackButton() {
    this.backButton = this.model.getObjectByName('buttonBack')
    this.backButton.scale.set(0, 0, 0)
    this.sceneOrtho.add(this.backButton)
    this.setBackButtonPosition()
  }
  setBackButtonPosition() {
    this.backButton.position.set(
      this.experience.sizes.width * 0.5 - 150,
      this.experience.sizes.height * 0.5 - 50,
      -50
    )
  }
  playBackButton() {
    const raycaster = this.experience.world.ray
    this.backButtonIn.eventCallback('onReverseComplete', () => {
      raycaster.far = 100
    })
    this.backButtonHover.reverse()
    this.backButtonIn.reverse()
    this.experience.game.goToMenu()
  }

  exitSettingState() {
    this.intervalsDiskIn.reverse()
    this.minimap.minimapIn.reverse()
    this.backButtonIn.reverse()
  }
  enterMenuState() {
    this.intervalsIn.play()
  }

  /**
   * Key pressed animation
   */
  moveKey(keyIndex) {
    const keyMesh = this.pianoKeys[keyIndex]
    this.experience.trigger('notePressed', [keyMesh.position.x])
    if (keyMesh) {
      gsap.killTweensOf(keyMesh.rotation)
      gsap.fromTo(
        keyMesh.rotation,
        { x: 0 },
        {
          x: 0.07,
          duration: 0.2,
          ease: 'power2.inOut',
          yoyo: true,
          repeat: 1,
        }
      )
    }
  }

  /**
   * Orientation Plane Info
   */
  setOrientationMessage() {
    this.landscapeMessage = this.model.getObjectByName(
      'landscapeMessage'
    )
    this.landscapeMessage.material = new THREE.MeshBasicMaterial({
      map: this.landscapeMessage.material.map,
      transparent: true,
      opacity: 0,
    })
    this.landscapeMessage.visible = false
    this.landscapeMessage.scale.set(150, 150, 150)
    this.landscapeMessage.position.set(0, 130, -3)
    this.sceneOrtho.add(this.landscapeMessage)
  }

  /**
   * Interval Game Button
   */
  setIntervalsButton() {
    this.intervalsButton =
      this.model.getObjectByName('buttonIntervals')
    this.intervalsButton.scale.set(300, 300, 300)

    this.intervalsButonGroup = new THREE.Group()
    this.intervalsButonGroup.add(this.intervalsButton)

    this.sceneOrtho.add(this.intervalsButonGroup)
    this.setIntervalsButtonPosition()
  }

  setIntervalsButtonPosition() {
    this.intervalsButonGroup.position.set(0, 0, -50)
  }

  playIntervals() {
    this.intervalsHover.kill()
    this.intervalsIn.reverse()
    // Tutorial
    if (!this.checkIfTutorialSeen()) {
      this.isTutorialPlaying = true
      this.startTutorialAnimation()
    }
    this.experience.trigger('setting')
  }

  /**
   * Interval Disk Buttons
   */
  setDiskIntervals() {
    this.scaleFactor = Math.min(this.sizes.width / 400, 1.0)

    this.intervalGroup = new THREE.Group()
    INTERVALS.forEach((interval) => {
      const meshName = `button-${interval.name}`
      const mesh = this.model.getObjectByName(meshName)
      const diskScale = 300 * this.scaleFactor
      const diskScaleHover = diskScale * 1.2
      if (mesh) {
        mesh.scale.set(diskScale, diskScale, diskScale)
        mesh.userData.interval = interval
        mesh.hoverTimeline = gsap
          .timeline({ paused: true })
          .fromTo(
            mesh.scale,
            { x: diskScale, y: diskScale, z: diskScale },
            {
              duration: 0.2,
              x: diskScaleHover,
              y: diskScaleHover,
              z: diskScaleHover,
              ease: 'power2.inOut',
            }
          )
        this.intervalGroup.add(mesh)
      }
    })
    this.sceneOrtho.add(this.intervalGroup)
    this.setDiskIntervalsPosition()
  }
  setDiskIntervalsPosition() {
    this.scaleFactor = Math.min(this.sizes.width / 900, 1.0)

    const spacing = 70 * this.scaleFactor
    const count = this.intervalGroup.children.length
    const totalWidth = (count - 1) * spacing
    const startX = -totalWidth / 2

    this.intervalGroup.children.forEach((disk, index) => {
      disk.position.x = startX + index * spacing
    })

    this.intervalGroup.position.set(0, 0, -50)
  }

  playDiskIntervals(clickedObject) {
    const intervalData = clickedObject.userData.interval
    if (intervalData) {
      this.experience.trigger('demo', [intervalData])
    }
    clickedObject.hoverTimeline.reverse()
    this.intervalsDiskIn.reverse()
    this.minimap.minimapIn.reverse()
  }

  /**
   * Fullscreen Button
   */
  setFullscreenButton() {
    this.fullscreenButton = this.model.getObjectByName(
      'button-fullscreen'
    )
    this.fullscreenButton.scale.set(0, 0, 0)
    this.sceneOrtho.add(this.fullscreenButton)
    this.setFullscreenButtonPosition()
  }

  setFullscreenButtonPosition() {
    this.fullscreenButton.position.set(
      this.experience.sizes.width * 0.5 - 50,
      this.experience.sizes.height * 0.5 - 50,
      -50
    )
  }

  /**
   * Timeline
   */
  setTimelinesButton() {
    /**
     * Hover
     */

    // Back Button
    this.backButtonHover = gsap
      .timeline({ paused: true })
      .fromTo(
        this.backButton.scale,
        { x: 300, y: 300, z: 300 },
        {
          duration: 0.5,
          x: 350,
          y: 350,
          z: 350,
          ease: 'power2.inOut',
        },
        '<'
      )

    // Fullscreen
    this.fullscreenHover = gsap
      .timeline({ paused: true })
      .fromTo(
        this.fullscreenButton.scale,
        { x: 300, y: 300, z: 300 },
        {
          duration: 0.2,
          x: 350,
          y: 350,
          z: 350,
          ease: 'power2.inOut',
        },
        '<'
      )

    // Play Intervals
    this.intervalsHover = gsap
      .timeline({ paused: true })
      .fromTo(
        this.intervalsButonGroup.scale,
        { x: 1, y: 1, z: 1 },
        {
          duration: 0.2,
          x: 1.1,
          y: 1.1,
          z: 1.1,
          ease: 'power2.inOut',
        },
        '<'
      )
    // .fromTo(this.intervalsButton.rotation, { x: 0,}, { duration: .5, x: Math.PI, ease: "power2.inOut", }, "<")

    /**
     * Flip
     */
    // Fullscreen
    this.fullscreenClick = gsap
      .timeline({ paused: true })
      .fromTo(
        this.fullscreenButton.rotation,
        { x: 0 },
        { duration: 0.5, x: Math.PI, ease: 'power2.inOut' },
        '<'
      )

    /**
     * Scale IN & OUT
     */

    // Back Button
    this.backButtonIn = gsap
      .timeline({ paused: true })
      .fromTo(
        this.backButton.scale,
        { x: 0, y: 0, z: 0 },
        {
          duration: 0.5,
          x: 300,
          y: 300,
          z: 300,
          ease: 'power2.inOut',
        },
        '<'
      )

    // Fullscreen
    this.fullscreenIn = gsap
      .timeline({ paused: true })
      .fromTo(
        this.fullscreenButton.scale,
        { x: 0, y: 0, z: 0 },
        {
          duration: 0.5,
          x: 300,
          y: 300,
          z: 300,
          ease: 'power2.inOut',
        },
        '<'
      )

    // Play Intervals
    this.intervalsIn = gsap
      .timeline({ paused: true })
      .fromTo(
        this.intervalsButton.scale,
        { x: 0, y: 0, z: 0 },
        {
          delay: 0.4,
          duration: 0.5,
          x: 300,
          y: 300,
          z: 300,
          ease: 'power2.inOut',
        },
        '<'
      )

    // Disk Intervals
    this.intervalsDiskIn = gsap
      .timeline({ paused: true })
      .fromTo(
        this.intervalGroup.scale,
        { x: 0, y: 0, z: 0 },
        {
          delay: 0.1,
          duration: 0.9,
          x: 1,
          y: 1,
          z: 1,
          ease: 'power2.inOut',
        },
        '<'
      )
  }

  resize() {
    this.setFullscreenButtonPosition()
    this.setBackButtonPosition()
    this.setIntervalsButtonPosition()
    this.setDiskIntervalsPosition()

    if (this.minimap) this.minimap.resize()

    this.setGameTextesPosition()
    this.setTutoTitlePosition()
    this.setTutoTextePosition()
    this.setLineArrowPosition()
    this.setCurveArrowPosition()
  }

  update() {
    if (this.minimap) this.minimap.update()
  }
}
