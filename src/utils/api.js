export const API_BASE = (import.meta.env.VITE_API_URL || (
    import.meta.env.DEV
        ? "http://localhost:3000"
        : "https://e-commerce-z6p4.onrender.com"
)).replace(/\/+$/, "").replace(/\/api$/i, "");

export async function requestJson(path, options) {
    const requestUrl = `${API_BASE}${path}`;
    const response = await fetch(requestUrl, options);
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
        throw new Error(
            `The server returned an unexpected response (HTTP ${response.status}) from ${requestUrl}. Check VITE_API_URL and make sure it points to the backend.`
        );
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "The request could not be completed.");
    }

    return data;
}
