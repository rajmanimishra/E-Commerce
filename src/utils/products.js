import { requestJson } from "./api";

const CACHE_TTL_MS = 30_000;

let cachedProducts = null;
let cachedAt = 0;
let pendingRequest = null;

export async function getProducts() {
    if (cachedProducts && Date.now() - cachedAt < CACHE_TTL_MS) {
        return cachedProducts;
    }

    if (!pendingRequest) {
        const request = requestJson("/api/products")
            .then((data) => {
                if (!data.success || !Array.isArray(data.products)) {
                    throw new Error("Unable to load products.");
                }

                if (pendingRequest === request) {
                    cachedProducts = data.products;
                    cachedAt = Date.now();
                }

                return data.products;
            })
            .finally(() => {
                if (pendingRequest === request) {
                    pendingRequest = null;
                }
            });

        pendingRequest = request;
    }

    return pendingRequest;
}

export function invalidateProducts() {
    cachedProducts = null;
    cachedAt = 0;
    pendingRequest = null;
}
