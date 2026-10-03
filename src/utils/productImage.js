const API = (import.meta.env.VITE_API_URL || (
    import.meta.env.DEV
        ? "http://localhost:3000"
        : "https://e-commerce-z6p4.onrender.com"
)).replace(/\/+$/, "");

export function getProductImage(image, imageMap = {}) {
    if (!image) return "";
    if (imageMap[image]) return imageMap[image];
    if (image.startsWith("/api/")) return `${API}${image}`;

    return image;
}
