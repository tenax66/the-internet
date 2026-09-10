const tv = document.querySelector<HTMLElement>("[data-television]");
if (tv) {
	const screen = tv.querySelector<HTMLElement>("[data-screen]")!;
	const power = tv.querySelector<HTMLButtonElement>("[data-power]")!;
	const status = tv.querySelector<HTMLElement>("[data-tv-status]")!;
	const off = tv.querySelector<HTMLElement>(".tv-off")!;
	const reduced = matchMedia("(prefers-reduced-motion: reduce)");
	let on = true;
	function sync() {
		const running = on && !reduced.matches && !document.hidden;
		screen.classList.toggle("is-playing", running);
		off.hidden = on;
		power.setAttribute("aria-pressed", String(on));
		status.textContent = !on ? "電源 OFF" : running ? "放送中" : "静止中";
	}
	power.addEventListener("click", () => { on = !on; sync(); });
	reduced.addEventListener("change", sync);
	document.addEventListener("visibilitychange", sync);
	window.addEventListener("pageshow", sync);
	sync();
}
