import WebMidi from "webmidi";
import AudioKeys from "audiokeys";
import { scale } from "@tonaljs/scale";
import { sample } from "lodash";
import Tone from "tone";

let ctx = new AudioContext();

let oscMap = {};

let scaleName = "piongio";

let { notes: o1 } = scale(`c4 ${scaleName}`);
let { notes: o2 } = scale(`c5 ${scaleName}`);
let notes = [...o1, ...o2];

// create a synth and connect it to the master output (your speakers)
// var synth = new Tone.Synth().toMaster();
// var synth = new Tone.MembraneSynth().toMaster();

//play a middle 'C' for the duration of an 8th note
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

WebMidi.enable(err => {
  keyboard.down(note => {
    // do things with the note object
    // fire(note);

    synth.triggerAttackRelease(note.frequency, "8n");
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

    if (input) {
      input.addListener("noteon", "all", e => {
        console.log(e);
        synth.triggerAttackRelease(e.note.name + e.note.octave, "8n");
      });

      let loop = new Tone.Loop(time => {
        output.playNote(sample(notes), "all", {
          velocity: Math.random() / 2
        });
      }, "8n");

      loop.start("1m").stop("120m");

      Tone.Transport.bpm.value = 80;
      Tone.Transport.start();
    }
  }
});
