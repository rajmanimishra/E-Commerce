import { API_BASE } from "./api";

export function getProductImage(image, imageMap = {}) {
    if (!image) return "";
    if (imageMap[image]) return imageMap[image];
    if (image.startsWith("/api/")) return `${API_BASE}${image}`;

    return image;
}
