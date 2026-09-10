import { writeFileSync } from 'node:fs';
// Original 32-bar instrumental tracks; no external samples.
const rate = 22050;
const songs = [
 {id:'midnight', bpm:120, roots:[45,41,48,43], chords:[0,3,7,10], kind:0},
 {id:'sunroom', bpm:126, roots:[48,43,45,41], chords:[0,4,7,11], kind:1},
 {id:'neon', bpm:128, roots:[40,40,43,38], chords:[0,3,7,10], kind:2},
];
for (const song of songs) {
 const beat = 60/song.bpm, duration = 32*4*beat, mix = new Float32Array(Math.ceil(duration*rate));
 let seed = 812 + song.kind;
 const random = () => { seed = (1664525*seed+1013904223)>>>0; return seed/4294967296*2-1; };
 const hz = n => 440*2**((n-69)/12);
 function voice(start, length, gain, synth) {
  const offset=Math.round(start*rate), count=Math.ceil(length*rate);
  for(let i=0;i<count && offset+i<mix.length;i++) {
   const t=i/rate;
   mix[offset+i]+=gain*synth(t,i)*Math.min(1,t/.003)*Math.min(1,(length-t)/.012);
  }
 }
 for(let bar=0;bar<32;bar++) {
  const root=song.roots[Math.floor(bar/2)%4], breakdown=bar>=16&&bar<20;
  for(let step=0;step<16;step++) {
   const time=(bar*4+step/4)*beat;
   if(step%4===0 && !breakdown) voice(time,.38,.72,t=>Math.sin(2*Math.PI*(46*t+95*.022*(1-Math.exp(-t/.022))))*Math.exp(-t*13));
   if(step%4===2 || (song.kind===2&&step%2===1)) {
    let prev=0;
    voice(time,step%4===2?.15:.045,.12,t=>{const n=random(), h=n-prev;prev=n;return h*Math.exp(-t*38);});
   }
   if(step===4||step===12) voice(time,.19,.18,t=>random()*(Math.exp(-t*24)+.5*Math.exp(-Math.max(0,t-.018)*50)));
   if(bar>=4 && !breakdown && [0,3,6,8,10,14].includes(step)) {
    const f=hz(root+(step===14?7:0));
    voice(time,beat*.42,.25,t=>(Math.sin(2*Math.PI*f*t)+.24*Math.sin(4*Math.PI*f*t)+ (song.kind===2?.18*Math.sin(6*Math.PI*f*t)*Math.exp(-t*18):0))*Math.exp(-t*9));
   }
   if(bar>=8 && (song.kind===1?[0,3,6,10,14]:[2,10]).includes(step)) {
    for(const interval of song.chords) {
     const f=hz(root+24+interval);
     voice(time,beat*1.4,.065,t=>(Math.sin(2*Math.PI*f*t)+.3*Math.sin(2*Math.PI*f*2.002*t))*Math.exp(-t*(song.kind===1?5:2.8)));
    }
   }
   if(bar>=12 && [1,7,11,14].includes(step)) {
    const f=hz(root+36+[7,10,12,3][[1,7,11,14].indexOf(step)]);
    voice(time,beat*.6,.045,t=>Math.sin(2*Math.PI*f*t)*Math.exp(-t*12));
    voice(time+beat*.75,beat*.6,.018,t=>Math.sin(2*Math.PI*f*t)*Math.exp(-t*12));
   }
  }
 }
 let peak=0;for(const value of mix) peak=Math.max(peak,Math.abs(value));
 const wav=Buffer.alloc(44+mix.length*2);
 wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(mix.length*2,40);
 for(let i=0;i<mix.length;i++){const fade=Math.min(1,i/rate/0.03,(mix.length-i)/rate/2);wav.writeInt16LE(Math.round(mix[i]/peak*.88*fade*32767),44+i*2);}
 writeFileSync(`public/music/${song.id}.wav`,wav);
 console.log(song.id, `${duration.toFixed(1)}s`, wav.length);
}
