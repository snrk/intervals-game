import * as THREE from "three"

import Experience from "./Experience"

export default class Renderer {
    constructor() {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.sceneOrtho = this.experience.sceneOrtho
        this.camera = this.experience.camera

        this.setInstance()
    }

    setInstance() {
        this.instance = new THREE.WebGLRenderer({
            canvas : this.canvas,
            antialias : true,
            alpha: true
        })
        this.instance.toneMapping = THREE.ReinhardToneMapping
        this.instance.toneMappingExposure = 3
        this.instance.shadowMap.enabled = true
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
        this.instance.autoClear = false

    }

    resize () {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }

    update () {
        this.instance.clear()
        this.instance.render(this.scene, this.camera.instance)
        this.instance.clearDepth()
        this.instance.render(this.sceneOrtho, this.camera.instanceOrtho)
    }
}