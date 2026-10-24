import { API_BASE } from "./api";

// ⚡ डिफ़ॉल्ट SVG/वेब प्लेसहोल्डर अगर इमेज मौजूद न हो
const DEFAULT_PLACEHOLDER = "https://placehold.co/300x300?text=No+Image";

export function getProductImage(image, imageMap = {}) {
    // 1. अगर इमेज ही नहीं है तो फॉलबैक लौटाएं
    if (!image || typeof image !== "string" || !image.trim()) {
        return DEFAULT_PLACEHOLDER;
    }

    const cleanImage = image.trim();

    // 2. अगर imageMap (लोकल इम्पोर्ट्स/एसेट्स) में मैप्ड है
    if (imageMap[cleanImage]) {
        return imageMap[cleanImage];
    }

    // 3. पूर्ण वेब URLs या बेस64 इमेजेस (Cloudinary, S3, Unsplash आदि)
    if (/^(https?:|\/\/|data:)/i.test(cleanImage)) {
        return cleanImage;
    }

    // 4. रिलेटिव API पाथ्स (चाहे शुरू में '/' हो या न हो)
    if (cleanImage.startsWith("/api/") || cleanImage.startsWith("api/")) {
        const path = cleanImage.startsWith("/") ? cleanImage : `/${cleanImage}`;
        return `${API_BASE}${path}`;
    }

    // 5. अगर केवल ग्रिडएफएस आईडी पास हुई हो (24 हेक्स कैरेक्टर)
    if (/^[0-9a-fA-F]{24}$/.test(cleanImage)) {
        return `${API_BASE}/api/products/images/${cleanImage}`;
    }

    // 6. अगर केवल फ़ाइल नेम (उदा. "banana.png") है और रूट /assets में है
    if (cleanImage.startsWith("/")) {
        return cleanImage;
    }

    return cleanImage;
}