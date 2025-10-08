import * as THREE from "three"

import Experience from '../Experience'
import { tan } from "three/tsl"

export default class Environment {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        if(this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('environment').close()
        }

        this.setLight()
        this.setEnvironmentMap()
    }

    setLight() {
        this.directionalLight = new THREE.DirectionalLight('#ffffff', 3)
        this.directionalLight.castShadow = true
        this.directionalLight.shadow.camera.far = 15
        this.directionalLight.shadow.camera.right = 47
        this.directionalLight.shadow.camera.left = -47
        this.directionalLight.shadow.camera.top = 10
        this.directionalLight.shadow.camera.bottom = -10
        this.directionalLight.shadow.mapSize.set(1024, 1024)
        this.directionalLight.shadow.normalBias = 0.05
        this.directionalLight.position.set(0, 3, - 2.25)
        this.scene.add(this.directionalLight)

        // Debug

        if(this.debug.active) {
            this.debugFolder
                .add(this.directionalLight, 'intensity')
                .name('Intensity')
                .min(0)
                .max(10)
                .step(0.001)

            this.debugFolder
                .add(this.directionalLight.position, 'x')
                .name('light posX')
                .min(-10)
                .max(10)
                .step(0.1)

            this.debugFolder
                .add(this.directionalLight.position, 'y')
                .name('light posY')
                .min(-10)
                .max(10)
                .step(0.1)

            this.debugFolder
                .add(this.directionalLight.position, 'z')
                .name('light posZ')
                .min(-10)
                .max(10)
                .step(0.1)
        }
    }

    setEnvironmentMap()
    {
        this.environmentMap = {}
        this.environmentMap.intensity = 0.4
        this.environmentMap.texture = this.resources.items.environmentMapTexture
        this.environmentMap.texture.colorSpace = THREE.SRGBColorSpace

        this.scene.environment = this.environmentMap.texture

        this.environmentMap.updateMaterials = () => {
            this.scene.traverse((child) => {
                if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial && !child.noEnvUpdate) {
                    child.material.envMap = this.environmentMap.texture
                    child.material.envMapIntensity = this.environmentMap.intensity
                    child.material.needsUpdate = true
                    child.castShadow = true
                    child.receiveShadow = true
                }
            })
        }

        this.environmentMap.updateMaterials()

        // Debug

        if(this.debug.active) {
            this.debugFolder
                .add(this.environmentMap, 'intensity')
                .name('envMapIntensity')
                .min(0)
                .max(4)
                .step(0.001)
                .onChange(this.environmentMap.updateMaterials)
        }
    }

}