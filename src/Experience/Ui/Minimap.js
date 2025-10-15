import * as THREE from 'three'
import gsap from 'gsap'
import Experience from "../Experience"

export default class Minimap {
    constructor() {
        this.experience = new Experience()
        this.camera = this.experience.camera
        this.sceneOrtho = this.experience.sceneOrtho
        this.resources = this.experience.resources
        this.model = this.resources.items.stageModel.scene
        this.game = this.experience.game

        this.MINIMAP_START_C2 = -(54) + 1.8
        this.MINIMAP_OCTAVE = 54
        this.MINIMAP_KEY = 54/12
        this.elevenKeys = this.MINIMAP_OCTAVE - this.MINIMAP_KEY

        this.setMinimap()
        this.setTimelineButton()
    }

    setMinimap() {
        // Group Elements
        this.minimapGroup = new THREE.Group()

        // Group animated InOut
        this.minimapOffset = new THREE.Group()

        // Button +
        this.plusButton = this.model.getObjectByName("buttonPlus")
        this.plusButton.scale.set(300, 300, 300)
        this.plusButton.position.y = 12
        this.plusButton.position.x = 240
        this.minimapOffset.add(this.plusButton)

        // Button -
        this.minusButton = this.model.getObjectByName("buttonMinus")
        this.minusButton.scale.set(300, 300, 300)
        this.minusButton.position.y = 12
        this.minusButton.position.x = -240
        this.minimapOffset.add(this.minusButton)

        //Minimap
        this.minimap = this.model.getObjectByName("minimap")
        this.minimap.scale.set(200, 200, 200)
        this.minimapOffset.add(this.minimap)

        // Minimap Highlight
        this.minimapHighlight = this.model.getObjectByName("minimapHighlight")
        this.minimapHighlight.scale.set(205, 200, 200)
        this.minimapHighlight.position.x = this.MINIMAP_START_C2
        this.minimapOffset.add(this.minimapHighlight)
        this.setMinimapPosition()

        this.minimapGroup.add(this.minimapOffset)
        this.sceneOrtho.add(this.minimapGroup)
    }

    setMinimapPosition () {
        this.minimapGroup.position.set(
            0,
            -this.experience.sizes.height * .5 + 30,
            -50
        )
    }

    setTimelineButton() {
               // Minimap
        this.minimapIn = gsap.timeline({ paused: true })
            .fromTo(this.minimapOffset.position, { y: -100}, { duration: .5, y: 0, ease: "power2.inOut", }, "<")

    }

    resize () {
        this.setMinimapPosition()
    }

    update () {
        const octaveOffset = (this.game.baseOctaveNote - 36) / 12

        // Octave initial position
        const currentOctaveStartX = this.MINIMAP_START_C2 + (octaveOffset * this.MINIMAP_OCTAVE)

        // Apply offset drag
        const dragX = this.camera.dragOffset.x

        // Only on 11 keys
        const highlightX = THREE.MathUtils.mapLinear(
            dragX,
            0,
            this.camera.DRAG_LIMIT_X,
            currentOctaveStartX, 
            currentOctaveStartX + this.elevenKeys
        )
        this.minimapHighlight.position.x = highlightX
    }
}