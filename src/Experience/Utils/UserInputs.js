import { PitchDetector } from 'pitchy'
import Experience from '../Experience'

export default class UserInputs {
    constructor() {
        this.experience = new Experience()
        this.world = this.experience.world
        this.detector = null
        this.analyser = null
        this.inputData = null
        this.audioContext = null
        this.herzOutput = null
        this.BASE_FREQUENCY = 261.63 // C3 in Hz
    }

    async init() {
        try {
            this.audioContext = new AudioContext()
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            
            const microphoneSource = this.audioContext.createMediaStreamSource(stream)

            // Create Filter 1
            const highPassFilter1 = this.audioContext.createBiquadFilter()
            // Set filter 1 to highPass
            highPassFilter1.type = 'highpass'
            // Filter 1 frequency limit
            highPassFilter1.frequency.value = 32

            // Create Filter 2
            const highPassFilter2 = this.audioContext.createBiquadFilter()
            // Set filter 2 to highPass
            highPassFilter2.type = 'highpass'
            // Filter 2 frequency limit
            highPassFilter2.frequency.value = 32

            // Create Filter 3
            const highPassFilter3 = this.audioContext.createBiquadFilter()
            // Set filter 3 to highPass
            highPassFilter3.type = 'highpass'
            // Filter 3 frequency limit
            highPassFilter3.frequency.value = 32

            this.analyser = this.audioContext.createAnalyser()

            // Link micro to Filter 1
            microphoneSource.connect(highPassFilter1)
            // Link filter 1 to filter 2
             highPassFilter1.connect(highPassFilter2) 
            // Link filter 2 to filter 3
             highPassFilter2.connect(highPassFilter3) 
            // Link filter 3 to analyser
            highPassFilter3.connect(this.analyser) 
            
            this.inputData = new Float32Array(this.analyser.fftSize)

            this.detector = PitchDetector.forFloat32Array(this.analyser.fftSize)

        } catch (error) {
             console.error("Erreur lors de l'initialisation du microphone.", error)
        }
    }

    update() {
        if (this.detector) {
            this.analyser.getFloatTimeDomainData(this.inputData)
            const [pitch, clarity] = this.detector.findPitch(this.inputData, this.audioContext.sampleRate)
        
            if (clarity > 0.98 && pitch > 0) {
                // 1. Convert Hz fréquency in MIDI note 
                const midiNote = 69 + 12 * Math.log2(pitch / 440)
                this.experience.game.updateRingPosition(midiNote)
            }        
        }
    }
}