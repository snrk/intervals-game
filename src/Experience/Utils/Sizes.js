import Experience from '../Experience'
import EventEmitter from './EventEmitter'
import gsap from 'gsap'

export default class Sizes extends EventEmitter
{
    constructor()
    {
        super()

        // Setup
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.pixelRatio = Math.min(window.devicePixelRatio, 2)

        this.isPortrait = this.width < this.height
        this.isPortraitWarningVisible = false

        //Resize event
        window.addEventListener('resize', () => {
            this.width = window.innerWidth
            this.height = window.innerHeight
            this.pixelRatio = Math.min(window.devicePixelRatio, 2)
            this.trigger('resize')
        })
    }

    toggleFullscreen() {
        const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement
        if(!fullscreenElement) {
            if(this.canvas.requestFullscreen) {
                this.canvas.requestFullscreen()
            } else if(this.canvas.webkitRequestFullscreen) {
                this.canvas.webkitRequestFullscreen()
            }
            this.experience.world.ui.fullscreenClick.play()
        } else {
            if(document.exitFullscreen) {
                document.exitFullscreen()
            } else if(this.canvas.webkitExitFullscreen) {
                this.canvas.webkitExitFullscreen()
            }
            this.experience.world.ui.fullscreenClick.reverse()
        }     
    }

    checkOrientation() {
        gsap.to(this.experience.loading.overlayMaterial.uniforms.uAlpha, { value: 0, duration: 0.5 })

        // this.isPortrait = this.width < this.height

        // if (this.isPortrait && !this.isPortraitWarningVisible) {
        //     this.experience.world.ui.landscapeMessage.material.opacity = 1
        //     this.isPortraitWarningVisible = true
        //     this.experience.world.ui.landscapeMessage.visible = true
        //     gsap.to(this.experience.loading.overlayMaterial.uniforms.uAlpha, { value: 1, duration: 0.2 })
        // }
        // else if (!this.isPortrait && this.isPortraitWarningVisible) {
        //     this.experience.world.ui.landscapeMessage.material.opacity = 0
        //     this.isPortraitWarningVisible = false
        //     this.experience.world.ui.landscapeMessage.visible = false
        //     gsap.to(this.experience.loading.overlayMaterial.uniforms.uAlpha, { value: 0, duration: 0.5 })
        // }
    }
}