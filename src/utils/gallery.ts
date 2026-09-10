import { getEmDashCollection } from "emdash";

const ASSET_BASE_URL = "https://assets.internet.tanka.cc";

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
	return image?.src || (image?.id ? `/_emdash/api/media/file/${encodeURIComponent(image.id)}` : "");
}
