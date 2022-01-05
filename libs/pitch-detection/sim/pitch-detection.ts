namespace pxsim.pitchdetection {

    let Ctx = window.AudioContext || (window as any).webkitAudioContext;
    
    let MAX_SIZE:number;
    let audioContext: any;
    let sourceNode: any;
    let analyser: any;
    let mediaStreamSource: any;
    let rafID:any = null;
    let note: string;
    let pitch: number;
    const buflen:number = 2048;
    const buf = new Float32Array(buflen);
    const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];


    
    /**
     * Stop all sounds from playing.
     */
    //% blockId=pitch_start_mic_input block="start microphone input"
    //% weight=93
    export function _startLiveInput() {
        console.log("startLiveInput");
        sourceNode = audioContext.createBufferSource();
        sourceNode.loop = true;
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        sourceNode.connect(analyser);
        analyser.connect(audioContext.destination);
        sourceNode.start(0);
        _updatePitch();
        _startListening();
    }

    export function _getNote():string{
        return note;
    }

    export function _getPitch():number{
        return pitch;
    }

    export function _updatePitch(){
        let ac = _autoCorrelate(buf, audioContext.sampleRate);
        analyser.getFloatTimeDomainData(buf);
       
        if (ac == -1) {
            note = "null";
        }
        else {
            var notePitch = _noteFromPitch(ac);
            //console.log("pitch: " + Math.round(ac));
            //console.log("note: " + noteStrings[notePitch % 12]);
            note = noteStrings[notePitch % 12];
            pitch = Math.round(ac);
        }
        
        // if (!window.requestAnimationFrame)
        //     window.requestAnimationFrame = window.webkitRequestAnimationFrame;
        rafID = window.requestAnimationFrame(_updatePitch);


    }

   

    export function _autoCorrelate(buf: any, sampleRate: number) {
        //Implements the ACF2+ algorithm
        let SIZE = buf.length;
        let rms = 0;
        for (let i = 0; i < SIZE; i++) {
            let val = buf[i];
            rms += val * val;
        }
        rms = Math.sqrt(rms / SIZE);
        if (rms < 0.01) // not enough signal
            return -1;
        var r1 = 0, r2 = SIZE - 1, thres = 0.2;
        for (let i = 0; i < SIZE / 2; i++)
            if (Math.abs(buf[i]) < thres) {
                r1 = i;
                break;
            }
        for (let i = 1; i < SIZE / 2; i++)
            if (Math.abs(buf[SIZE - i]) < thres) {
                r2 = SIZE - i;
                break;
            }
        buf = buf.slice(r1, r2);
        SIZE = buf.length;

        let c:number[] = Array.apply(null, Array(SIZE)).map(Number.prototype.valueOf,0);
        //let c:number[] = new Array(SIZE).fill(0); <- Doesn't work
       
        for (let i = 0; i < SIZE; i++)
            for (let j = 0; j < SIZE - i; j++)
                c[i] = c[i] + buf[j] * buf[j + i];
        let d = 0;
        while (c[d] > c[d + 1])
            d++;
        let maxval = -1, maxpos = -1;
        for (var i = d; i < SIZE; i++) {
            if (c[i] > maxval) {
                maxval = c[i];
                maxpos = i;
            }
        }
        let T0 = maxpos;
        let x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
        let a = (x1 + x3 - 2 * x2) / 2;
        let b = (x3 - x1) / 2;
        if (a)
            T0 = T0 - b / (2 * a);
        return sampleRate / T0;
    }

    function _noteFromPitch(frequency:number) {
        var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
        return Math.round(noteNum) + 69;
    }

    
    export function _initializePitchDetection() {
        audioContext = new AudioContext();
        MAX_SIZE = Math.max(4, Math.floor(audioContext.sampleRate / 5000)); // corresponds to a 5kHz signal
        console.log("_initializePitchDetection");
    }

    export function _startListening(){
        _getUserMedia({
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            }
        }, _gotStream);
    }

    export function _getUserMedia(dictionary:object, callback:any) {
        let nav: any;
        nav = window.navigator;

        try {
            nav.getUserMedia =
                nav.getUserMedia ||
                    nav.webkitGetUserMedia ||
                    nav.mozGetUserMedia;
                nav.getUserMedia(dictionary, callback, _error);
        }
        catch (e) {
            alert('getUserMedia threw exception :' + e);
        }
    }

    //Need to create an error handler block
    export function _error() {
        alert('Stream generation failed.');
    }

    export function _gotStream(stream:any){
        // Create an AudioNode from the stream.
        mediaStreamSource = audioContext.createMediaStreamSource(stream);
        // Connect it to the destination.
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        mediaStreamSource.connect(analyser);
        _updatePitch();
    }

    /**
     * Runs code each time a word or sentence boundary is reached in text being spoken
     */
    //% blockId=pitch_onPitchDetected
    //% block="on pitch detected"
    export function _onPitchDetected(handler: () => void) {
        console.log("onPitchDetected");
    }
}
