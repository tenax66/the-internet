const formatter = new Intl.DateTimeFormat("en-GB", {
	timeZone: "Asia/Tokyo",
	weekday: "short",
	day: "2-digit",
	month: "short",
	year: "numeric",
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
	hourCycle: "h23",
});

export function formatServiceClock(now: Date) {
	const parts = Object.fromEntries(formatter.formatToParts(now).map(({ type, value }) => [type, value]));
	return {
		date: `${parts.weekday} ${parts.day} ${parts.month} ${parts.year}`.toUpperCase(),
		time: `${parts.hour}:${parts.minute}/${parts.second}`,
	};
}
