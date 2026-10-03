import { useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "https://e-commerce-z6p4.onrender.com";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const response = await fetch(`${API}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to request a reset link.");
            }

            setSent(true);
        } catch (requestError) {
            setError(requestError.message || "Unable to reach the store. Try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 px-5 py-12 flex items-center justify-center">
            <section className="w-full max-w-md rounded-3xl border border-orange-100 bg-white p-8 shadow-xl">
                <Link to="/login" className="text-3xl font-extrabold text-gray-800">
                    Gr<span className="text-orange-500">o</span>cify
                </Link>
                <h1 className="mt-8 text-2xl font-bold text-gray-800">Forgot your password?</h1>
                <p className="mt-2 text-gray-600">
                    Enter the email on your account and we’ll send you a link to choose a new password.
                </p>

                {sent ? (
                    <div role="status" className="mt-6 rounded-xl bg-green-50 p-4 text-sm leading-6 text-green-800">
                        If an account exists for that email, a password reset link will be sent shortly. The link is valid for 15 minutes.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div>
                            <label htmlFor="reset-email" className="mb-2 block text-sm font-semibold text-gray-700">
                                Email
                            </label>
                            <input
                                id="reset-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
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
                            className="w-full rounded-xl bg-orange-600 px-4 py-3 font-bold text-white transition hover:bg-orange-700 disabled:cursor-wait disabled:opacity-60"
                        >
                            {submitting ? "Sending..." : "Send reset link"}
                        </button>
                    </form>
                )}

                <p className="mt-6 text-sm text-gray-600">
                    Remembered it?{" "}
                    <Link to="/login" className="font-semibold text-orange-600 hover:underline">
                        Back to login
                    </Link>
                </p>
            </section>
        </main>
    );
}
