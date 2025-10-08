import * as THREE from "three"
import Sizes from "./Utils/Sizes"
import Time from "./Utils/Time"
import Camera from "./Camera"
import Renderer from "./Renderer"
import World from "./World/World"
import Resources from "./Utils/Resources"
import Debug from "./Utils/Debug"
import Loading from "./Loading"
import UserInputs from "./Utils/UserInputs"
import EventEmitter from './Utils/EventEmitter.js'
import Game from "./Game.js"

let instance = null

export default class Experience extends EventEmitter {
    constructor(canvas) {

        super() 
        
        // Singleton
        if(instance) {
             return instance
        }

        instance = this

        // Global access
        window.experience = this

        // Option
        this.canvas = canvas

        this.ringPosition = 0
        this.KEY_WIDTH = 0
        
        // Setup        
        this.debug = new Debug()
        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = new THREE.Scene()
        this.sceneOrtho = new THREE.Scene()
        this.resources = new Resources()
        this.sceneGroup = new THREE.Group()
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.userInputs = new UserInputs()
        this.loading = new Loading()
        this.world = new World()
        this.game = new Game()


        // Sizes resize event
        this.sizes.on('resize', () => {
            this.resize()
        })

        // Time tick event
        this.time.on('tick', () => {
            this.update()
        })
    }

    resize() {
        this.camera.resize()
        this.renderer.resize()
        if(this.world)
            this.world.resize()
    }

    update() {
        this.camera.update()
        this.renderer.update()
        if(this.world)
            this.world.update()
        if(this.loading)
            this.loading.update()
        if(this.userInputs)
            this.userInputs.update()
    }
}  