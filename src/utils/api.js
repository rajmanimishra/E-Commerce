export const API_BASE = (import.meta.env.VITE_API_URL || (
    import.meta.env.DEV
        ? "http://localhost:3000"
        : "https://e-commerce-z6p4.onrender.com"
)).replace(/\/+$/, "").replace(/\/api$/i, "");

export async function requestJson(path, options = {}) {
    // 1. पाथ सेफ फॉर्मेटिंग (लीडिंग स्लैश सुनिश्चित करें)
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const requestUrl = `${API_BASE}${normalizedPath}`;

    // 2. ऑटोमैटिक टोकन और हेडर्स मैनेजमेंट
    const token = localStorage.getItem("token");
    const isFormData = options.body instanceof FormData;

    const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(!isFormData ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
    };

    // अगर FormData भेजा जा रहा है तो Content-Type हटा दें (ब्राउज़र बाउंड्री खुद लगाएगा)
    if (isFormData) {
        delete headers["Content-Type"];
    }

    try {
        const response = await fetch(requestUrl, {
            ...options,
            headers,
        });

        // 3. 401 Unauthorized टोकन एक्सपायरी हैंडलिंग
        if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
            throw new Error(
                `Server returned HTTP ${response.status} from ${requestUrl}. Check backend connection.`
            );
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "The request could not be completed.");
        }

        return data;
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error(`Cannot reach backend at ${API_BASE}. Please check your internet connection.`);
        }
        throw error;
    }
}