/*
 * デスクトップの挙動:
 *   - ウィンドウの最小化 / 閉じる、タスクバーからの復帰
 *   - アクティブウィンドウ（タイトルバーの色）の切り替え
 *   - スタートメニューの開閉
 *   - タスクバーの時計
 *
 * ドラッグや最大化は入れていない（参考画像のレイアウトを保ちたいので、
 * ウィンドウ位置は CSS グリッドに任せている）。
 */

const CLOSED = "closed";
const MINIMIZED = "minimized";

type WindowState = typeof CLOSED | typeof MINIMIZED | "open";

interface DeskWindow {
	el: HTMLElement;
	id: string;
	title: string;
	button: HTMLButtonElement;
	state: WindowState;
}

function setup(): void {
	const items = document.getElementById("taskbar-items");
	const windowEls = Array.from(
		document.querySelectorAll<HTMLElement>("[data-window]"),
	);

	const windows: DeskWindow[] = [];
	let active: DeskWindow | null = null;

	function setActive(win: DeskWindow | null): void {
		active = win;
		for (const w of windows) {
			const isActive = w === win && w.state === "open";
			w.el.classList.toggle("is-inactive", !isActive);
			w.button.classList.toggle("is-active", isActive);
			w.button.setAttribute("aria-pressed", String(w.state === "open"));
		}
	}

	/** 一番上に見えている開いているウィンドウを返す（アクティブが閉じたときの引き継ぎ先） */
	function firstOpen(): DeskWindow | null {
		return windows.find((w) => w.state === "open") ?? null;
	}

	function show(win: DeskWindow, scroll = false): void {
		win.state = "open";
		win.el.hidden = false;
		setActive(win);
		if (scroll) {
			win.el.scrollIntoView({ block: "nearest", behavior: "smooth" });
		}
	}

	function minimize(win: DeskWindow): void {
		win.state = MINIMIZED;
		win.el.hidden = true;
		setActive(win === active ? firstOpen() : active);
	}

	function close(win: DeskWindow): void {
		win.state = CLOSED;
		win.el.hidden = true;
		win.button.hidden = true;
		setActive(win === active ? firstOpen() : active);
	}

	for (const el of windowEls) {
		const id = el.dataset.window ?? "";
		const title = el.dataset.windowTitle ?? id;

		const button = document.createElement("button");
		button.type = "button";
		button.className = "taskbar-item";
		button.setAttribute("aria-pressed", "true");
		button.title = title;

		// タイトルバーのアイコンをそのまま流用する
		const icon = el.querySelector<SVGElement>(".win-titlebar-icon");
		if (icon) {
			const copy = icon.cloneNode(true) as SVGElement;
			copy.removeAttribute("class");
			button.appendChild(copy);
		}
		const label = document.createElement("span");
		label.textContent = title;
		button.appendChild(label);

		const win: DeskWindow = { el, id, title, button, state: "open" };
		windows.push(win);

		button.addEventListener("click", () => {
			// 押されている（＝アクティブで開いている）ならしまう、それ以外は出す
			if (win.state === "open" && win === active) {
				minimize(win);
			} else {
				show(win, true);
			}
		});

		items?.appendChild(button);

		el.addEventListener("mousedown", () => setActive(win));
		el.addEventListener("focusin", () => setActive(win));

		el.querySelector<HTMLButtonElement>(
			'[data-window-action="minimize"]',
		)?.addEventListener("click", (event) => {
			event.stopPropagation();
			minimize(win);
		});

		el.querySelector<HTMLButtonElement>(
			'[data-window-action="close"]',
		)?.addEventListener("click", (event) => {
			event.stopPropagation();
			close(win);
		});
	}

	setActive(windows[0] ?? null);

	// 「すべてのウィンドウを開く」
	document
		.querySelector<HTMLElement>('[data-window-action="restore-all"]')
		?.addEventListener("click", (event) => {
			event.preventDefault();
			for (const w of windows) {
				w.state = "open";
				w.el.hidden = false;
				w.button.hidden = false;
			}
			setActive(windows[0] ?? null);
			closeStartMenu();
		});

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
