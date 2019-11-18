const leapControl = {
  theSound: undefined,
  controller: undefined,
  lastSoundSpec: {},

  makeSineSound : (frequency) => {
    const sound = new Pizzicato.Sound({ 
      source: 'wave',
      options: {
        type: 'sine',
        frequency: frequency
      }
    });
    return sound;
  },
  
  stopSound : () => {
    if (leapControl.soundInPlay) {
      leapControl.theSound.stop();
      leapControl.soundInPlay = false;
    }
  },

  startSound : (soundSpec) => {
    leapControl.stopSound();
    if (soundSpec === undefined) {
      soundSpec = {
        frequency: 440,
        volume: 1
      }
    }
    leapControl.theSound = leapControl.makeSineSound(soundSpec.frequency);
    leapControl.theSound.volume = soundSpec.volume;
    leapControl.theSound.attack = 1;
    leapControl.theSound.release = 1;
    leapControl.theSound.play();
    leapControl.soundInPlay = true;
    leapControl.lastSoundSpec.frequency = soundSpec.frequency;
    leapControl.lastSoundSpec.volume = soundSpec.volume;
  },

  togglePlayState: () => {
    if (leapControl.soundInPlay) {
      leapControl.stopSound();
    } else {
      leapControl.startSound();
    }
  },

  changeSound: (soundSpec) => {
    if (leapControl.soundInPlay) {
      leapControl.theSound.frequency = soundSpec.frequency;
      leapControl.theSound.volume = soundSpec.volume;
    }
  },

  init: () => {
    leapControl.controller = new Leap.Controller({enableGestures: true});
    const controller = leapControl.controller;
    controller.loop(function(frame) {
      if (leapControl.soundInPlay && frame.data && frame.data.hands && frame.data.hands[0]) {
        //console.log(frame.data.hands[0].sphereCenter[1]);
        const newFrequency = Math.max(400, 400 + 160 + parseInt(frame.data.hands[0].sphereCenter[1]));
        let changeMade = false;
        const soundSpec = {
          frequency: leapControl.lastSoundSpec.frequency,
          volume: leapControl.lastSoundSpec.volume
        };
        if (leapControl.lastSoundSpec.frequency != newFrequency) {
          soundSpec.frequency = newFrequency;
          leapControl.lastSoundSpec.frequency = newFrequency;
          changeMade = true;
        }
        if (frame.data.hands[1] !== undefined) {
          const volumeRatio = ((170 + parseInt(frame.data.hands[1].sphereCenter[1])) / 500);
          //console.log('new vol:', volumeRatio);
          const newVolume = Math.min(1.0, Math.max(0,volumeRatio));
          if (leapControl.lastSoundSpec.volume != newVolume) {
            soundSpec.volume = newVolume;
            //console.log('new vol:', soundSpec.volume);
            newV = (160 + parseInt(frame.data.hands[1].sphereCenter[1]));
            //console.log('h1 min:', Math.min(lastMinV,newV), 'h1 max:', Math.max(lastMaxV,newV));
            lastMinV = Math.min(lastMinV,newV);
            lastMaxV = Math.max(lastMaxV,newV);
            leapControl.lastSoundSpec.volume = newVolume;
            changeMade = true;
          }
        }
        if (changeMade) {
          //console.log('new freq, vol:', soundSpec.frequency, soundSpec.volume);
          leapControl.changeSound(soundSpec);
          $('#frequency').html('Frequency: ' + soundSpec.frequency);
          const volPercent = parseInt(soundSpec.volume * 100);
          $('#volume').html('Volume: ' + volPercent + '%');
        }
      }
    });

    // Note that this means Leap is connected, but not streaming.  Use streamingStarted for that.
    controller.on('ready', function() {
      console.log("ready. Service version: " + controller.connection.protocol.serviceVersion);
    });
    controller.on('connect', function() {
      console.log("connected with protocol v" + controller.connection.opts.requestProtocolVersion);
    });
    controller.on('disconnect', function() {
      console.log("disconnect");
    });
    controller.on('focus', function() {
      console.log("focus");
    });
    controller.on('blur', function() {
      console.log("blur");
    });

    controller.on('deviceAttached', function(deviceInfo) {
      console.log("deviceAttached", deviceInfo);
    });
    controller.on('deviceRemoved', function(deviceInfo) {
      console.log("deviceRemoved", deviceInfo);
    });
    controller.on('deviceStreaming', function(deviceInfo) {
      console.log("deviceStreaming", deviceInfo);
    });
    controller.on('deviceStopped', function(deviceInfo) {
      console.log("deviceStopped", deviceInfo);
    });
    controller.on('streamingStarted', function(deviceInfo) {
      console.log("streamingStarted", deviceInfo);
    });
    controller.on('streamingStopped', function(deviceInfo) {
      console.log("streamingStopped", deviceInfo);
    });

    controller.on('deviceConnected', function() {
      console.log("deviceConnected");
    });
    controller.on('deviceDisconnected', function() {
      console.log("deviceDisconnected");
    });

    // This event is always called after other frame events, and is ideal for rendering WebGL scenes.
    // The timestamp is from requestAnimationFrame and is when the pixels hit the screen.
    controller.on('frameEnd', function(timestamp){
      //console.log('frameEnd', timestamp);
    });
  },

};

let cursorPosition;
$('#start').click(() => {
  leapControl.startSound();
});

$('#stop').click(() => {
  leapControl.stopSound();
});

$('body').ready(() => {
  leapControl.init();
});

$('body').keyup((e) => {
  const keyCode = e.which;
  if (keyCode === 32) {
    leapControl.togglePlayState();
  }
});

lastMinV = 10000;
lastMaxV = -10000;
