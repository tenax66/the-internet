import { getEmDashCollection } from "emdash";

const ASSET_BASE_URL = "https://assets.internet.tanka.cc";
const ASSET_ORIGIN = new URL(ASSET_BASE_URL).origin;

export interface GalleryData {
	id: string;
	status: string;
	createdAt: Date;
	image?: { id: string; src?: string; alt?: string; width?: number; height?: number };
}

export async function getGallery(cursor?: string, limit = 24) {
	const result = await getEmDashCollection<"gallery", GalleryData>("gallery", {
		status: "published",
		orderBy: { created_at: "desc", id: "desc" },
		limit,
		...(cursor ? { cursor } : {}),
	});
	if (result.error) console.error("Gallery query failed:", result.error);
	return result;
}

export function galleryImage(image: GalleryData["image"]) {
	if (image?.src?.startsWith("/gallery/")) return `${ASSET_BASE_URL}${image.src}`;
	if (image?.src) {
		try {
			const url = new URL(image.src);
			if (url.origin === ASSET_ORIGIN && url.pathname.startsWith("/gallery/")) {
				return url.href;
			}
		} catch {
			// Invalid and unapproved sources fall back to the managed media ID below.
		}
	}
	return image?.id ? `/_emdash/api/media/file/${encodeURIComponent(image.id)}` : "";
}
