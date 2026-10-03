import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || (
    import.meta.env.DEV
        ? "http://localhost:3000"
        : "https://e-commerce-z6p4.onrender.com"
);

async function readResponse(response) {
    if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error(
            `The API at ${API} returned a non-JSON response (HTTP ${response.status}). Check that the backend is running and the API URL is correct.`
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

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const response = await fetch(`${API}/api/auth/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(data.message || "Unable to sign in.");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate("/admin");
        } catch (requestError) {
            setError(
                requestError instanceof TypeError
                    ? `Can't reach the backend at ${API}. Start the backend and try again.`
                    : requestError.message || "Unable to reach the store. Try again."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen bg-stone-100 px-5 py-12 flex items-center justify-center">
            <section className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
                <Link to="/" className="text-2xl font-extrabold text-stone-900">
                    Gr<span className="text-orange-500">o</span>cify
                </Link>
                <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">
                    Store team
                </p>
                <h1 className="mt-2 text-3xl font-bold text-stone-900">Admin sign in</h1>
                <p className="mt-2 text-stone-600">
                    Sign in with the admin account set up for this store.
                </p>

                <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                    <div>
                        <label htmlFor="admin-email" className="mb-2 block text-sm font-medium text-stone-700">
                            Email
                        </label>
                        <input
                            id="admin-email"
                            type="email"
                            autoComplete="username"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>
                    <div>
                        <label htmlFor="admin-password" className="mb-2 block text-sm font-medium text-stone-700">
                            Password
                        </label>
                        <input
                            id="admin-password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    {error && (
                        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-wait disabled:opacity-60"
                    >
                        {submitting ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-stone-600">
                    Shopping instead?{" "}
                    <Link to="/login" className="font-semibold text-orange-700 hover:underline">
                        Customer sign in
                    </Link>
                </p>
            </section>
        </main>
    );
}
