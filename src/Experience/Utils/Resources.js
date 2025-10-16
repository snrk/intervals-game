import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import EventEmitter from './EventEmitter'
import Experience from '../Experience'
import { loaderSources, mainSources } from './../sources.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export default class Resources extends EventEmitter {
  constructor() {
    super()

    // Option
    this.loaderSources = loaderSources
    this.mainSources = mainSources

    // Setup
    this.items = {}
    this.toLoad = this.loaderSources.length
    this.loaded = 0

    this.experience = new Experience()

    this.setLoaders()
    this.startLoading(this.loaderSources, 'loader')
  }

  setLoaders() {
    // Draco
    const dracoLoader = new DRACOLoader()
    // dracoLoader.setDecoderPath('/draco/')
    dracoLoader.setDecoderPath(
      'https://www.gstatic.com/draco/versioned/decoders/1.5.7/'
    )

    this.loaders = {}
    this.loaders.gltfLoader = new GLTFLoader()

    this.loaders.gltfLoader.setDRACOLoader(dracoLoader)

    this.loaders.textureLoader = new THREE.TextureLoader()
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
    this.loaders.fileLoader = new THREE.FileLoader()
    this.loaders.fileLoader.setResponseType('arraybuffer')
  }

  startLoading(sourcesToLoad, phase) {
    // Load each source
    for (const source of sourcesToLoad) {
      if (source.type === 'gltfModel') {
        this.loaders.gltfLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file, phase)
        })
      } else if (source.type === 'texture') {
        this.loaders.textureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file, phase)
        })
      } else if (source.type === 'cubeTexture') {
        this.loaders.cubeTextureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file, phase)
        })
      } else if (source.type === 'audio') {
        this.loaders.fileLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file, phase)
        })
      }
    }
  }

  sourceLoaded(source, file, phase) {
    this.items[source.name] = file
    this.loaded++

    if (phase === 'loader') {
      if (this.loaded === this.toLoad) {
        this.trigger('loaderReady')

        this.toLoad = this.mainSources.length
        this.loaded = 0
        this.startLoading(this.mainSources, 'main')
      }
    } else if (phase === 'main') {
      const progressRatio = this.loaded / this.toLoad
      this.trigger('progress', [progressRatio])

      if (this.loaded === this.toLoad) {
        this.trigger('ready')
      }
    }
  }
}
