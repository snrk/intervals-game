import Experience from './Experience'

export default class Tones {
    constructor() {
        this.experience = new Experience()
        this.resources = this.experience.resources
        this.Tone = null

        // Init Audi on click only
        window.addEventListener('click', () => this.init(), { once: true })
    }

    async init() {

        try {
            this.Tone = await import('tone')
            await this.Tone.start()
            this.Tone.getTransport().bpm.value = 90

            const decodedSamples = {}
            const pianoSamples = [
                { name: 'C1', buffer: this.resources.items.pianoC1 },
                { name: 'C2', buffer: this.resources.items.pianoC2 },
                { name: 'C3', buffer: this.resources.items.pianoC3 },
                { name: 'C4', buffer: this.resources.items.pianoC4 },
            ]

            // Decoding promise
            const decodingPromises = pianoSamples.map(async (sample) => {
                const audioBuffer = await this.Tone.getContext().decodeAudioData(sample.buffer)
                decodedSamples[sample.name] = audioBuffer
            })

            await Promise.all(decodingPromises)

            // Create Sampler
            this.sampler = new this.Tone.Sampler({
                urls: decodedSamples,
            }).toDestination()
            
        } catch (error) {
             console.error("Error initializing Tone.js:", error)
        }
    }

    playNote(noteName, duration = "1n") {
        if (this.sampler) {
            this.sampler.triggerAttackRelease(noteName, duration)
        } 
    }

    playTwoNotes(noteName, duration = "2n", silence = "2n") {
        // Audio time
        const now = this.Tone.now()

        // Convert silence in second
        const delayInSeconds = this.Tone.Time(silence).toSeconds()
        // Play fist note
        this.sampler.triggerAttackRelease(noteName, duration, now)
        // play second note
        this.sampler.triggerAttackRelease(noteName, duration, now + delayInSeconds)
    }
}