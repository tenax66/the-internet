const songs = [
 { file: 'midnight', title: 'Midnight — Deep House' },
 { file: 'sunroom', title: 'Sunroom — Piano House' },
 { file: 'neon', title: 'Neon — Acid House' },
];
const panel = document.querySelector<HTMLElement>('[data-media-player]');
if (panel) {
 const audio = panel.querySelector<HTMLAudioElement>('[data-music]')!;
 const play = panel.querySelector<HTMLButtonElement>('[data-music-play]')!;
 const select = panel.querySelector('[data-music-select]') as unknown as HTMLSelectElement;
 const volume = panel.querySelector<HTMLInputElement>('[data-volume]')!;
 const title = panel.querySelector<HTMLElement>('[data-song-title]')!;
 const status = panel.querySelector<HTMLElement>('[data-music-status]')!;
 const bars = [...panel.querySelectorAll<HTMLElement>('[data-spectrum] span')];
 const wave = panel.querySelector<SVGPathElement>('[data-waveform]')!;
 const window = panel.closest<HTMLElement>('[data-window]')!;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 let context: AudioContext | undefined, analyser: AnalyserNode | undefined;
 let current = songs.findIndex(song => song.file === select.value), request = 0, frame = 0, lastVisual = 0;
 const samples = new Uint8Array(256), frequencies = new Uint8Array(128);
 audio.volume = Number(volume.value);
 title.textContent = songs[current]?.title ?? 'HOUSE RADIO';
 function setActive(active: boolean) {
  play.disabled = active;
  select.disabled = active;
 }
 function resetVisuals() {
  cancelAnimationFrame(frame);
  bars.forEach(bar => bar.style.setProperty('--h', '0%'));
  wave.setAttribute('d', 'M0 20H256');
 }
 function stop() {
  ++request; audio.pause(); audio.currentTime = 0;
  setActive(false);
  play.setAttribute('aria-pressed', 'false');
  status.textContent = '停止中'; resetVisuals();
 }
 function animate(now = performance.now()) {
  if (audio.paused || !analyser) return;
  if (!reduced.matches || now-lastVisual >= 150) {
   lastVisual = now;
   analyser.getByteFrequencyData(frequencies);
   analyser.getByteTimeDomainData(samples);
   bars.forEach((bar,i) => {
    const start = Math.floor((i/bars.length)**2*frequencies.length);
    const end = Math.max(start+1, Math.floor(((i+1)/bars.length)**2*frequencies.length));
    bar.style.setProperty('--h', `${Math.max(...frequencies.subarray(start,end))/255*100}%`);
   });
   wave.setAttribute('d', Array.from(samples,(v,i)=>`${i?'L':'M'}${i} ${20-(v-128)/128*19}`).join(''));
  }
  frame = requestAnimationFrame(animate);
 }
 select.addEventListener('change', () => {
  const selected = songs.findIndex(song => song.file === select.value);
  if (selected < 0) return;
  current = selected;
  title.textContent = songs[current].title;
  status.textContent = '再生ボタンで再生できます';
 });
 play.addEventListener('click', async () => {
  if (play.disabled) return;
  stop();
  const attempt = request;
  current = songs.findIndex(song => song.file === select.value);
  if (current < 0) return;
  const song = songs[current];
  title.textContent = song.title;
  status.textContent = '読み込み中';
  setActive(true);
  audio.src = `https://assets.internet.tanka.cc/music/${song.file}.wav`;
  try {
   if (!context) {
    context = new AudioContext();
    analyser = context.createAnalyser(); analyser.fftSize = 256;
    context.createMediaElementSource(audio).connect(analyser).connect(context.destination);
   }
   await context.resume();
   if (attempt !== request) return;
   await audio.play();
   if (attempt !== request) return;
   play.setAttribute('aria-pressed','true');
   status.textContent = `再生中 · ${song.title}`; animate();
  } catch {
   if (attempt !== request) return;
   stop(); status.textContent = '再生できませんでした。再生ボタンで再試行してください。';
  }
 });
 audio.addEventListener('ended', stop);
 audio.addEventListener('error', () => { stop(); status.textContent = '曲を読み込めませんでした。再生ボタンで再試行してください。'; });
 panel.querySelector('[data-music-stop]')!.addEventListener('click', stop);
 volume.addEventListener('input', () => { audio.volume = Number(volume.value); });
 new MutationObserver(() => { if (window.hidden) stop(); }).observe(window, {attributes:true, attributeFilter:['hidden']});
 document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
 globalThis.addEventListener('pagehide', stop);
}
