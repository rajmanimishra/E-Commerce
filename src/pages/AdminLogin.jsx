import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || (
    import.meta.env.DEV
        ? "http://localhost:3000"
        : "https://e-commerce-z6p4.onrender.com"
);

async function readResponse(response) {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        throw new Error(
            `The API returned an unexpected response (HTTP ${response.status}). Check backend connection.`
        );
    }
    return response.json();
}

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    // 1. अगर पहले से एडमिन टोकन मौजूद है तो सीधे डैशबोर्ड पर भेजें
    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user.role === "admin") {
                    navigate("/admin", { replace: true });
                }
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }
    }, [navigate]);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSubmitting(true);

        const cleanEmail = email.trim().toLowerCase();

        try {
            const response = await fetch(`${API}/api/auth/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: cleanEmail, password }),
            });

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(data.message || "Invalid credentials.");
            }

            // 2. सुरक्षा जांच: रोल एडमिन ही होना चाहिए
            if (data.user?.role !== "admin") {
                throw new Error("Access denied. Admin account required.");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            navigate("/admin", { replace: true });
        } catch (requestError) {
            setError(
                requestError instanceof TypeError
                    ? `Cannot reach backend at ${API}. Please check server.`
                    : requestError.message || "Sign in failed. Try again."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen bg-stone-100 px-5 py-12 flex items-center justify-center">
            <section className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
                <Link to="/" className="text-2xl font-extrabold text-stone-900 tracking-tight">
                    Gr<span className="text-orange-500">o</span>cify
                </Link>
                <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                    Store Team
                </p>
                <h1 className="mt-1 text-2xl font-bold text-stone-900">Admin Sign In</h1>
                <p className="mt-1.5 text-sm text-stone-600">
                    Sign in to manage catalog, orders, and customer accounts.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="admin-email" className="mb-1.5 block text-xs font-semibold uppercase text-stone-700">
                            Email
                        </label>
                        <input
                            id="admin-email"
                            type="email"
                            autoComplete="username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@grocify.com"
                            className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    <div>
                        <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold uppercase text-stone-700">
                            Password
                        </label>
                        <input
                            id="admin-password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••••••"
                            className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    {error && (
                        <p role="alert" className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-medium text-red-700">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-wait disabled:opacity-60 shadow-sm"
                    >
                        {submitting ? "Signing in..." : "Sign in to Dashboard"}
                    </button>
                </form>

                <div className="mt-6 border-t border-stone-100 pt-4 text-center">
                    <p className="text-xs text-stone-500">
                        Customer account?{" "}
                        <Link to="/login" className="font-semibold text-orange-600 hover:underline">
                            Customer login
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
}