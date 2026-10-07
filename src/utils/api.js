export const API_BASE = (import.meta.env.VITE_API_URL || (
    import.meta.env.DEV
        ? "http://localhost:3000"
        : "https://e-commerce-z6p4.onrender.com"
)).replace(/\/+$/, "");

export async function requestJson(path, options) {
    const response = await fetch(`${API_BASE}${path}`, options);
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
        throw new Error(
            `The server returned an unexpected response (HTTP ${response.status}). Check the API address and make sure the backend is up to date.`
        );
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "The request could not be completed.");
    }

    return data;
}
