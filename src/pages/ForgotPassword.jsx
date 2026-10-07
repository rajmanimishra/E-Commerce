import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requestJson } from "../utils/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [method, setMethod] = useState("email");
    const [recoveryCode, setRecoveryCode] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const endpoint = method === "email"
                ? "/api/auth/forgot-password"
                : "/api/auth/forgot-password/recovery-code";
            const result = await requestJson(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(method === "email"
                    ? { email }
                    : { email, code: recoveryCode }),
            });

            if (method === "email") {
                setSent(true);
            } else {
                navigate(`/reset-password?token=${encodeURIComponent(result.token)}`);
            }
        } catch (requestError) {
            setError(
                requestError instanceof TypeError
                    ? "Can't reach the store right now. Check your connection and try again."
                    : requestError.message || "Unable to request a reset link."
            );
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
                    Choose how you want to verify your account and reset your password.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-orange-50 p-1">
                    <button
                        type="button"
                        onClick={() => { setMethod("email"); setSent(false); setRecoveryCode(""); setError(""); }}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold ${method === "email" ? "bg-white text-orange-700 shadow" : "text-gray-600"}`}
                    >
                        Email link
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMethod("recovery"); setSent(false); setRecoveryCode(""); setError(""); }}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold ${method === "recovery" ? "bg-white text-orange-700 shadow" : "text-gray-600"}`}
                    >
                        Recovery code
                    </button>
                </div>

                {sent && (
                    <div role="status" className="mt-4 rounded-xl bg-green-50 p-4 text-sm leading-6 text-green-800">
                        {method === "email"
                            ? "If an account exists for that email, a password reset link will be sent shortly. The link is valid for 15 minutes."
                            : "Enter one of the recovery codes you saved from your profile."}
                    </div>
                )}

                {(!sent || method === "recovery") && (
                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div>
                            <label htmlFor="reset-email" className="mb-2 block text-sm font-semibold text-gray-700">
                                Account email
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

                        {method === "recovery" && (
                            <div>
                                <label htmlFor="recovery-code" className="mb-2 block text-sm font-semibold text-gray-700">
                                    One-time recovery code
                                </label>
                                <input
                                    id="recovery-code"
                                    type="text"
                                    autoComplete="off"
                                    value={recoveryCode}
                                    onChange={(event) => setRecoveryCode(event.target.value)}
                                    required
                                    maxLength={32}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 font-mono uppercase outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    Use one of the codes you saved from your profile. Each code works once.
                                </p>
                            </div>
                        )}

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
                            {submitting
                                ? method === "email" ? "Sending..." : "Checking code..."
                                : method === "email" ? "Send reset link" : "Use recovery code"}
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
