import WebMidi from "webmidi";
import AudioKeys from "audiokeys";
import { scale } from "@tonaljs/scale";
import { sample } from "lodash";
import Tone from "tone";
import midi from "./fairy_theme.midi.json";
import trumpet from "./trumpet.wav";

let ctx = new AudioContext();

let oscMap = {};

let scaleName = "hirajoshi";
// let scaleName = "piongio";

let { notes: o1 } = scale(`c4 ${scaleName}`);
let { notes: o2 } = scale(`c5 ${scaleName}`);
let notes = [...o1, ...o2];

// create a synth and connect it to the master output (your speakers)
var synth = new Tone.Synth().toMaster();
// var synth = new Tone.MembraneSynth().toMaster();

// play a middle 'C' for the duration of an 8th note
// var loop = new Tone.Loop(function(time) {
//   synth.triggerAttackRelease(sample(notes), "8n", time);
// }, "32n");
//
// loop.start("1m").stop("120m");
//
// Tone.Transport.bpm.value = 80;
// Tone.Transport.start();

let fire = note => {
  let osc = ctx.createOscillator();
  osc.frequency.value = note.frequency;
  osc.connect(ctx.destination);
  osc.start();

  oscMap[note.frequency] = osc;
};

let kill = note => {
  oscMap[note.frequency].stop();
};

let keyboard = new AudioKeys();

// const sampler = new Tone.Sampler(
//   {
//     C4: "/test.mp3"
//   },
//   () => {
//     console.log(123);
//     sampler.triggerAttack("C4");
//   }
// ).toMaster();

// var sampler = new Tone.Sampler(
//   {
//     C3: trumpet
//   },
//   function() {
//     console.log("test");
//     keyboard.down(note => {
//       // do things with the note object
//       // fire(note);
//       // synth.triggerAttackRelease(note.frequency, "8n");
//       sampler.triggerAttack(note.frequency);
//     });
//     //sampler will repitch the closest sample
//   }
// ).toMaster();
// //
WebMidi.enable(err => {
  keyboard.down(note => {
    // do things with the note object
    // fire(note);
    // synth.triggerAttackRelease(note.frequency, "8n");
  });

  keyboard.up(note => {
    // kill(note);
  });

  if (err) {
    console.log("WebMidi could not be enabled.", err);
  } else {
    console.log("WebMidi enabled!");

    console.log(WebMidi.inputs);
    console.log(WebMidi.outputs);

    let [input] = WebMidi.inputs;
    let [output] = WebMidi.outputs;

    if (output) {
      const synths = [];
      const now = Tone.now() + 0.5;
      midi.tracks.forEach(track => {
        //create a synth for each track
        const synth = new Tone.PolySynth(10, Tone.Synth, {
          envelope: {
            attack: 0.02,
            decay: 0.1,
            sustain: 0.3,
            release: 1
          }
        }).toMaster();
        synths.push(synth);
        //schedule all of the events

        track.notes.forEach(note => {
          Tone.Draw.schedule(() => {
            output.playNote(note.name);
          }, note.time + now);

          // synth.triggerAttackRelease(
          //   note.name,
          //   note.duration,
          //   note.time + now,
          //   note.velocity
          // );
        });
      });
    }

    if (input) {
      input.addListener("noteon", "all", e => {
        console.log(e);
        synth.triggerAttackRelease(e.note.name + e.note.octave, "8n");
      });

      // let loop = new Tone.Loop(time => {
      //   output.playNote(sample(notes), "all", {
      //     velocity: Math.random() / 2
      //   });
      // }, "16n");
      //
      // loop.start("1m").stop("120m");
      //
      // Tone.Transport.bpm.value = 50;
      // Tone.Transport.start();
    }
  }
});
