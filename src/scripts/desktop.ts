/*
 * デスクトップの挙動:
 *   - ウィンドウを閉じる / スタートメニューから開き直す
 *   - アクティブウィンドウ（タイトルバーの色）の切り替え
 *   - スタートメニューの開閉
 *   - 上部バーの時計
 *
 * 上部バーはサイト内ナビゲーション（ふつうのリンク）なので、ウィンドウとは
 * 連動していない。閉じた窓を戻す手段はスタートメニューの項目だけ。
 */

interface DeskWindow {
	el: HTMLElement;
	closed: boolean;
}

function setup(): void {
	const windowEls = Array.from(
		document.querySelectorAll<HTMLElement>("[data-window]"),
	);

	const windows: DeskWindow[] = windowEls.map((el) => ({ el, closed: false }));
	let active: DeskWindow | null = null;

	function setActive(win: DeskWindow | null): void {
		active = win;
		for (const w of windows) {
			w.el.classList.toggle("is-inactive", w !== win || w.closed);
		}
	}

	/** 開いている先頭の窓。アクティブな窓が閉じたときの引き継ぎ先 */
	function firstOpen(): DeskWindow | null {
		return windows.find((w) => !w.closed) ?? null;
	}

	function close(win: DeskWindow): void {
		win.closed = true;
		win.el.hidden = true;
		setActive(win === active ? firstOpen() : active);
	}

	for (const win of windows) {
		win.el.addEventListener("mousedown", () => setActive(win));
		win.el.addEventListener("focusin", () => setActive(win));

		win.el
			.querySelector<HTMLButtonElement>('[data-window-action="close"]')
			?.addEventListener("click", (event) => {
				event.stopPropagation();
				close(win);
			});
	}

	/*
	 * 最初にアクティブにする窓。看板の窓のようにタイトルバーを持たない窓を選ぶと
	 * どこもアクティブに見えないので、帯を出せる窓の先頭から始める。
	 */
	const hasTitlebar = (w: DeskWindow): boolean =>
		!!w.el.querySelector<HTMLElement>(".win-titlebar")?.offsetParent;

	setActive(windows.find(hasTitlebar) ?? windows[0] ?? null);

	/* ------------------------------------------------- スタートメニュー */

	const startButton = document.getElementById(
		"start-button",
	) as HTMLButtonElement | null;
	const startMenu = document.getElementById("startmenu");

	function closeStartMenu(): void {
		if (!startMenu || !startButton) return;
		startMenu.hidden = true;
		startButton.setAttribute("aria-expanded", "false");
	}

	// 「閉じたウィンドウを開き直す」（トップページのみ）
	document
		.querySelector<HTMLElement>('[data-window-action="restore-all"]')
		?.addEventListener("click", (event) => {
			event.preventDefault();
			for (const w of windows) {
				w.closed = false;
				w.el.hidden = false;
			}
			setActive(windows[0] ?? null);
			closeStartMenu();
		});

	if (startButton && startMenu) {
		startButton.addEventListener("click", (event) => {
			event.stopPropagation();
			const open = startMenu.hidden;
			startMenu.hidden = !open;
			startButton.setAttribute("aria-expanded", String(open));
			if (open) {
				startMenu.querySelector<HTMLAnchorElement>("a")?.focus();
			}
		});

		startMenu.addEventListener("click", (event) => event.stopPropagation());

		document.addEventListener("click", closeStartMenu);

		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && !startMenu.hidden) {
				closeStartMenu();
				startButton.focus();
			}
		});
	}

	/* -------------------------------------------------------- 時計 */

	const clock = document.getElementById("taskbar-clock");
	if (clock) {
		const tick = () => {
			clock.textContent = new Date().toLocaleTimeString("ja-JP", {
				hour: "2-digit",
				minute: "2-digit",
			});
		};
		tick();
		// 分が変わる瞬間に合わせてから 1 分ごと
		const msToNextMinute = 60_000 - (Date.now() % 60_000);
		window.setTimeout(() => {
			tick();
			window.setInterval(tick, 60_000);
		}, msToNextMinute);
	}
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", setup, { once: true });
} else {
	setup();
}
