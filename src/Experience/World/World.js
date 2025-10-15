import * as THREE from "three"
import Experience from '../Experience'
import Environment from "./Environment"
import Stage from "./Stage"
import UI from "../Ui/UI"
import Tones from "../Tones"

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.sceneOrtho = this.experience.sceneOrtho
        this.resources = this.experience.resources
        this.canvas = this.experience.canvas
        this.camerasGroup = this.experience.camera.camerasGroup
        this.loading = this.experience.loading
        this.tones = this.experience.tones
        this.sizes = this.experience.sizes

        this.stage = null
        this.isDragging = false
        this.dragStartX = 0

        // Loader overlay
        this.loading.setOverlay()

        this.mouse = new THREE.Vector2()
    
        this.resources.on('loaderReady', () => {
            this.loading.setGKey()
            this.loading.setMicMessage() 
        })

        this.resources.on('ready', () => {
            //Loader GKey out
            this.loading.finishGKey()
        })

        this.loading.on("finished", () => {
            this.stage = new Stage()
            this.environment = new Environment()
            this.tones = new Tones()
            this.ui = new UI()
            this.setListeners()
            this.sizes.checkOrientation()

            this.ui.fullscreenIn.play()
            this.ui.intervalsIn.play()


            //Raycaster
            this.ray = new THREE.Raycaster()
            this.intersects = null
            this.currentIntersect = null
            this.objectsForTestingOrtho = [
                this.ui.fullscreenButton, 
                this.ui.intervalsButton, 
                ...this.ui.intervalGroup.children,
                this.ui.minimap.plusButton, 
                this.ui.minimap.minusButton,
                this.ui.backButton,
            ]
            this.objectsForTestingPersp = [this.stage.raycastKeyboard]
            this.clickedObject = null
        })
    }

    mouseRecording (_event) {
        this.mouse.x = _event.clientX / this.experience.sizes.width * 2 - 1
        this.mouse.y = -(_event.clientY / this.experience.sizes.height) * 2 + 1
    }

    setListeners () {
        window.addEventListener('pointerdown', (_event) => {
            this.onPointerDown(_event)
        })
        window.addEventListener('pointermove', (_event) => {
            this.onPointerMove(_event)
        })
        window.addEventListener('pointerup', (_event) => {
            this.onPointerUp(_event)
        })
        window.addEventListener('pointerleave', (_event) => {

        })
    }

    onPointerDown(_event) {
        this.mouseRecording(_event)
        
        // Raycast Orthographic
        this.ray.setFromCamera(this.mouse, this.experience.camera.instanceOrtho)
        const intersectsUI = this.ray.intersectObjects(this.objectsForTestingOrtho)

        if (intersectsUI.length) {
            this.currentIntersect = intersectsUI[0]
            this.clickedObject = this.currentIntersect.object
        }

        // --- Raycast Perspective
        this.ray.setFromCamera(this.mouse, this.experience.camera.instance)
        const intersects3D = this.ray.intersectObjects(this.objectsForTestingPersp)
        
        // DRAG START
        if (intersects3D.length > 0 && !this.clickedObject) {
            _event.preventDefault()
            this.isDragging = true
            this.dragStartX = _event.clientX
            this.experience.camera.startDrag()
            document.body.style.cursor = 'grabbing'
        }
    }

    onPointerMove(_event) {
        this.mouseRecording(_event)

        if (this.isDragging) {
            _event.preventDefault()
            // DRAG
            const deltaX = _event.clientX - this.dragStartX
            this.experience.camera.handleDrag(deltaX)
        } 
        // Hover only if no clicking
        else if (!this.clickedObject) {
            // HOVER 
            this.handleHover()
        }
    }

    onPointerUp(_event) {
        if (this.isDragging) {
            // DRAG END
            this.isDragging = false
            this.experience.camera.endDrag()
            document.body.style.cursor = 'default'
        } 
        // CLICK
        else if (this.currentIntersect && this.currentIntersect.object === this.clickedObject) {
            this.handleClick()
        }

        // Reset CLICK
        this.clickedObject = null
    }

    handleHover() {
        this.ray.setFromCamera(this.mouse, this.experience.camera.instanceOrtho)
        const intersectsUI = this.ray.intersectObjects(this.objectsForTestingOrtho)

        const intersectedObject = intersectsUI.length ? intersectsUI[0].object : null

        // Hover IN
        if (intersectedObject && this.currentIntersect !== intersectedObject) {
            document.body.style.cursor = 'pointer'
            this.currentIntersect = intersectedObject
            
            // Timelines Hover IN
            if (this.currentIntersect.hoverTimeline) this.currentIntersect.hoverTimeline.play()
            else if (this.currentIntersect === this.ui.fullscreenButton) this.ui.fullscreenHover.play()
            else if (this.currentIntersect === this.ui.intervalsButton) this.ui.intervalsHover.play()
            else if (this.currentIntersect === this.ui.backButton)  this.ui.backButtonHover.play()
        } 
        // Hover OUT
        else if (!intersectedObject && this.currentIntersect) {
            document.body.style.cursor = 'default'

            // Timelines Hover OUT
            if (this.currentIntersect.hoverTimeline) this.currentIntersect.hoverTimeline.reverse()
            else if (this.currentIntersect === this.ui.fullscreenButton) this.ui.fullscreenHover.reverse()
            else if (this.currentIntersect === this.ui.intervalsButton) this.ui.intervalsHover.reverse()
            else if (this.currentIntersect === this.ui.backButton)  this.ui.backButtonHover.reverse()
            
            this.currentIntersect = null
        }
    }

    handleClick() {
        if (this.currentIntersect) {
            // Click IN
            const objectClicked = this.currentIntersect.object
            // Fullscreen Button
            if (objectClicked === this.ui.fullscreenButton) {
                this.sizes.toggleFullscreen()
                this.ui.fullscreenHover.reverse()
            }
            // Interval Game Button
            else if (objectClicked === this.ui.intervalsButton) {
                this.ui.playIntervals()
            }
            // Interval Disk Button
            else if (this.ui.intervalGroup.children.includes(objectClicked)) {
                this.ui.playDiskIntervals(objectClicked)
            }
            // minimap PLUS Button
            else if (objectClicked === this.ui.minimap.plusButton) {
            this.experience.game.increaseOctave()
            }
            // minimap MINUS Button
            else if (objectClicked === this.ui.minimap.minusButton) {
                this.experience.game.decreaseOctave()
            }
            // Back Button
            else if (objectClicked === this.ui.backButton) {
                this.ray.far = 0
                this.ui.playBackButton()
            }
        }
    }

    resize () {
        if(this.ui ) {
            // this.sizes.checkOrientation()
            this.ui.resize()
        }        
    }
    update() {
        if(this.stage)
            this.stage.update()

        if(this.ui)
            this.ui.update()
    }
}