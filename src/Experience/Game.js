import Experience from "./Experience"
import gsap from 'gsap'


export default class Game {
    constructor() {
        this.experience = new Experience()

        // Setup
        this.currentState = 'menu'
        this.demoTimeline = null
        this.playTimeline = null

        this.baseOctaveNote = 36
        this.selectedNote = this.baseOctaveNote
        this.MIN_OCTAVE_NOTE = 24 // MIDI note for C1
        this.MAX_OCTAVE_NOTE = 72 // MIDI note for C5

        this.updateRingPosition(this.baseOctaveNote)

        // EventListener
        this.experience.on('setting', () => this.enterSettingState())
        this.experience.on('demo', (intervalData) => this.runDemo([intervalData]))
        this.experience.on('play', (intervalData) => this.enterPlayState([intervalData]))
    }

    playNoteAndKey(midiNote) {
        const noteName = this.midiToNoteName(midiNote)
        if (noteName) {
            this.experience.world.tones.playNote([noteName], "1n")
        }
        const absoluteKeyIndex = midiNote - this.baseOctaveNote
        if (absoluteKeyIndex >= 0 && absoluteKeyIndex < 24) {
            this.experience.world.ui.moveKey(absoluteKeyIndex)
        }
    }

    enterSettingState() {
        this.experience.camera.restoreDragState()
        this.currentState = 'setting'
        this.experience.camera.targetOffset.copy(this.experience.camera.camOffsets.setting)
        if (!this.experience.world.ui.isTutorialPlaying) {
            this.experience.world.ui.intervalsDiskIn.play()
        }
        this.experience.world.ui.minimapIn.play()
        this.experience.world.ui.backButtonIn.play()
        // Raycarter Keyboard Cube IN
        this.experience.world.stage.raycastKeyboardIn.play()
    }

    runDemo(intervalData) {
        this.data = intervalData[0]
        this.currentState = 'demo'
        // Raycarter Keyboard Cube OUT
        this.experience.world.stage.raycastKeyboardIn.reverse()

        if (this.demoTimeline) this.demoTimeline.kill()

        const baseNote = this.selectedNote
        const intervalNote = baseNote + this.data.semitones

        const baseNoteIndex = baseNote - this.baseOctaveNote
        const intervalNoteIndex = intervalNote - this.baseOctaveNote

        const baseNoteX = this.experience.world.ui.getKeyPositionX(baseNoteIndex)
        const intervalNoteX = this.experience.world.ui.getKeyPositionX(intervalNoteIndex)
        
        this.demoTimeline = gsap.timeline({
            onComplete: () => {
                // Send base note and interval key's X position
                this.experience.trigger('play', [{ baseNoteX, intervalNoteX }])
                this.demoTimeline = null
            }
        })

        this.demoTimeline
            .call(() => {
                this.experience.world.ui.showText("listen")
            }, [], "+=0.5") 
            .call(() => {
                this.playNoteAndKey(baseNote)
            }, [], "+=0.5") 
            .call(() => {
                this.playNoteAndKey(intervalNote)
            }, [], "+=0.5") 
            
            .to({}, { duration: 1 })
    }

    enterPlayState(notesToPlay) {
        this.data = notesToPlay[0]    
        this.currentState = 'play'
        if (this.playTimeline) this.playTimeline.kill()
        
        const ballSpeed = 2 //seconde 
        const waitTime = .2

        this.playTimeline = gsap.timeline({
            onComplete: () => {
                this.experience.trigger('setting')
                this.playTimeline = null
            }
        })

        this.playTimeline
            .call(() => {
                this.experience.world.ui.showText("sing") 
            }, [], "+=0.5")
            .call(() => {
                this.experience.world.stage.animBallBase(this.data.baseNoteX, ballSpeed)
            }, [], "+=0.5")
            .call(() => {
                this.checkPitch(this.data.baseNoteX)
            }, [], `+=1`)
            .call(() => {
                this.experience.world.stage.animBallInterval(this.data.intervalNoteX, ballSpeed)
            }, [], `<`)
            .call(() => {
                this.checkPitch(this.data.intervalNoteX)
            }, [], `+=1`)
    }

    checkPitch(targetNote) {
        const ringX = this.experience.ringPosition
        const ballX = targetNote
        const distance = Math.abs(ringX - ballX)

        const perfectThreshold = this.experience.KEY_WIDTH * 0.25
        const goodThreshold = this.experience.KEY_WIDTH * 1

        if (distance <= perfectThreshold) {
            this.experience.world.ui.showText("perfect")
        } else if (distance <= goodThreshold) {
            this.experience.world.ui.showText("good")
        } else {
            this.experience.world.ui.showText("miss")
        }
    }

    goToMenu() {
        if (this.currentState !== 'menu') {
            if (this.currentState === 'setting') {
                this.experience.world.ui.exitSettingState()
            }
            else if (this.currentState === 'demo') {
                if (this.demoTimeline) {
                    this.demoTimeline.kill()
                    this.demoTimeline = null
                }
            }
            else if (this.currentState === 'play') {
                if (this.playTimeline) {
                    this.playTimeline.kill()
                    this.playTimeline = null
                }
            }
            this.experience.camera.saveDragState()
            this.experience.camera.resetDrag()
            // Raycarter Keyboard Cube OUT
            this.experience.world.stage.raycastKeyboardIn.reverse()

            this.experience.world.ui.enterMenuState() 
            this.experience.trigger('menu') 
            this.currentState = 'menu'
        }
    }

    midiToNoteName(midiNumber) {
        if (midiNumber < 0 || midiNumber > 127) {
            return null // MIDI notes are between 0 and 127
        }
        const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
        
        // Get the note name (C, D#, G, etc.)
        const noteName = noteNames[midiNumber % 12]
        
        // Get the octave number
        const octave = Math.floor(midiNumber / 12) - 1
        
        return `${noteName}${octave}`
    }

    setBaseNote(noteIndex) {
        this.selectedNote = this.baseOctaveNote + noteIndex
        
        const noteName = this.midiToNoteName(this.selectedNote)

        // Audio note
        if (noteName) {
            this.experience.world.tones.playNote([noteName], "1n")
        }
        // Moving Keyboard Touch
        const keyIndex = this.selectedNote % 12
        this.experience.world.ui.moveKey(keyIndex)
    }

    updateRingPosition(midiNote) {
        // I need to subtract two octaves (-24) so that the ring is positioned correctly
        const noteDifference = midiNote - this.baseOctaveNote - 24
        // Relative positionning 
        const positionX = (noteDifference * this.experience.KEY_WIDTH) + this.experience.KEY_WIDTH * 0.5
        // Update RingPosition
        this.experience.ringPosition = positionX
    }

    increaseOctave() {

        if (this.baseOctaveNote <= this.MAX_OCTAVE_NOTE) {
            const currentKeyIndex = this.selectedNote % 12

            this.baseOctaveNote += 12
            this.selectedNote = this.baseOctaveNote + currentKeyIndex

            // Play new base note
            const noteName = this.midiToNoteName(this.selectedNote)
            if (noteName) 
                this.experience.world.tones.playNote([noteName], "1n")
            // Move key on the keyboard
            const keyIndex = this.selectedNote % 12
            this.experience.world.ui.moveKey(keyIndex)
            this.experience.trigger('octaveChanged', [12])
        }
        
    }

    decreaseOctave() {
         if (this.baseOctaveNote >= this.MIN_OCTAVE_NOTE) {
            const currentKeyIndex = this.selectedNote % 12

            this.baseOctaveNote -= 12
            this.selectedNote = this.baseOctaveNote + currentKeyIndex

            // Play new base note
            const noteName = this.midiToNoteName(this.selectedNote)
            if (noteName) 
                this.experience.world.tones.playNote([noteName], "1n")
            // Move key on the keyboard
            const keyIndex = this.selectedNote % 12
            this.experience.world.ui.moveKey(keyIndex)
            this.experience.trigger('octaveChanged', [-12])
        }
    }
}