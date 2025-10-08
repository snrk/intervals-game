import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Experience from "./Experience"
import { gsap } from "gsap"

export default class Camera {
    constructor () {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.sceneGroup = this.experience.sceneGroup
        this.canvas = this.experience.canvas
        this.debug = this.experience.debug

        //Drag
        this.dragStartPosition = new THREE.Vector3()
        this.dragOffset = new THREE.Vector3()
        this.savedDragX = 0

        this.KEY_WIDTH = 0.4000072479248047 * 10
        this.DRAG_LIMIT_X = this.KEY_WIDTH * 11 
        
        //Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Camera').close()
        }

        this.setCamerasGroup()
        this.setInstance()
        this.setOrthoInstance()
        this.setCameraOffsets()
        this.setCamerasPosition()
        // this.setOrbitControls()
    }

    setCamerasGroup () {
        this.camerasGroup = new THREE.Group()
        this.camerasGroup.name = "camerasGroup"
        this.sceneGroup.add(this.camerasGroup)

        this.basePosition = new THREE.Vector3()
        this.offset = new THREE.Vector3()
        this.targetOffset = new THREE.Vector3()
    }

     setInstance () {
        this.instance = new THREE.PerspectiveCamera(65, this.sizes.width / this.sizes.height, 0.1, 300)
        this.instance.far = 1000
        this.camerasGroup.add(this.instance)

        if (this.debug.active) {
            this.debugFolder.add(this.basePosition, 'x').name('camPosX').min(-50).max(50).step(0.1)
            this.debugFolder.add(this.basePosition, 'y').name('camPosY').min(-50).max(50).step(0.1)
            this.debugFolder.add(this.basePosition, 'z').name('camPosZ').min(-200).max(200).step(0.1)
            this.debugFolder.add(this.instance.rotation, 'x').name('camRotX').min(-Math.PI).max(Math.PI).step(0.1)
            this.debugFolder.add(this.instance.rotation, 'y').name('camRotY').min(-Math.PI).max(Math.PI).step(0.1)
            this.debugFolder.add(this.instance.rotation, 'z').name('camRotZ').min(-Math.PI).max(Math.PI).step(0.1)
        }  
    }

    setCamerasPosition () {
            // Perspective Cam
            this.instance.aspect = this.sizes.width / this.sizes.height
            let depthPosition, heightPosition, rotationPan

            // Map aspect with height and depth
            if (this.instance.aspect <= 1) {
                this.instance.aspect = THREE.MathUtils.clamp(this.instance.aspect, 0.4, 1)
                depthPosition = THREE.MathUtils.mapLinear(this.instance.aspect, 0.4, 1, 195, 100)
                heightPosition = THREE.MathUtils.mapLinear(this.instance.aspect, 0.4, 1, 65, 35)
                rotationPan = THREE.MathUtils.mapLinear(this.instance.aspect, 0.4, 1, -0.2, -0.15)
            } else { 
                this.instance.aspect = THREE.MathUtils.clamp(this.instance.aspect, 1, 3)
                depthPosition = THREE.MathUtils.mapLinear(this.instance.aspect, 1, 3, 100, 75)
                heightPosition = THREE.MathUtils.mapLinear(this.instance.aspect, 1, 3, 35, 32)
                rotationPan = THREE.MathUtils.mapLinear(this.instance.aspect, 1, 3, -0.15, -0.3)   
            }

            this.basePosition.y = heightPosition
            this.basePosition.z = depthPosition
            this.instance.rotation.x = rotationPan
            this.instance.updateProjectionMatrix()        

            // Orthographic Cam
            this.instanceOrtho.left = - this.sizes.width / 2
            this.instanceOrtho.right = this.sizes.width / 2
            this.instanceOrtho.top = this.sizes.height / 2
            this.instanceOrtho.bottom = - this.sizes.height / 2
            this.instanceOrtho.updateProjectionMatrix()
    }

    setOrthoInstance () {
        this.instanceOrtho = new THREE.OrthographicCamera(
            - this.sizes.width / 2, 
            this.sizes.width / 2, 
            this.sizes.height / 2, 
            - this.sizes.height / 2,
            1,
            100
        )

    }
    startDrag() {
            this.dragStartPosition.copy(this.dragOffset)
    }

    handleDrag(deltaX) {
        const dragDistance = -deltaX *.2
        let newX = this.dragStartPosition.x + dragDistance
        newX = THREE.MathUtils.clamp(newX, 0, this.DRAG_LIMIT_X)
        this.dragOffset.x = newX
    }

    endDrag() {
        // Snap to key
        const closestNoteIndex = Math.round(Math.abs(this.dragOffset.x) / this.KEY_WIDTH)
        const snappedX = closestNoteIndex * this.KEY_WIDTH
        gsap.to(this.dragOffset, {
            x: snappedX,
            duration: 0.3,
            ease: 'power2.out',
            onComplete: () => {
                if (this.experience.game) {
                    this.experience.game.setBaseNote(closestNoteIndex)
                }
            }
        })
        
    }

    saveDragState() {
        this.savedDragX = this.dragOffset.x        
    }

    restoreDragState() {        
        if (Math.abs(this.dragOffset.x) < 4) {
            gsap.to(this.dragOffset, {
                x: this.savedDragX,
                duration: 2,
                ease: 'expo.out'
            })
        }
    }

    resetDrag() {
        gsap.to(this.dragOffset, {x: 0,duration: 2,ease: 'expo.out'})
    }

    setCameraOffsets() {
         this.camOffsets = {
            menu: new THREE.Vector3(0, 0, 0),
            setting: new THREE.Vector3(-24.4, -7, -18),
            demo: new THREE.Vector3(-24, 0, -16),
            play: new THREE.Vector3(-24, 0, -23)
        }
        
        this.experience.on('menu', () => { this.targetOffset.copy(this.camOffsets.menu) })
        // 'setting' position call in Game constructor
        this.experience.on('demo', () => { this.targetOffset.copy(this.camOffsets.demo) })
        this.experience.on('play', () => { this.targetOffset.copy(this.camOffsets.play) })
    }

    resize () {
        this.setCamerasPosition()    
        // console.log(this.camerasGroup.position);
        // console.log(this.instance.rotation);    
    }

    setOrbitControls () {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
    }

    update () {
        this.offset.lerp(this.targetOffset, 0.03)
        this.camerasGroup.position
            .copy(this.basePosition)
            .add(this.offset)
            .add(this.dragOffset)    
    }
} 