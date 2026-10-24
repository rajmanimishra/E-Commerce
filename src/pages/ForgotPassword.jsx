import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requestJson } from "../utils/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [recoveryCode, setRecoveryCode] = useState("");
    const [method, setMethod] = useState("email"); // "email" | "recovery"
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    function handleMethodSwitch(selectedMethod) {
        setMethod(selectedMethod);
        setError("");
        setSent(false);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) {
            setError("Please enter your account email.");
            return;
        }

        // रिकवरी कोड से स्पेस और स्पेशल कैरेक्टर्स साफ़ करें
        const cleanCode = recoveryCode.trim().replace(/[^a-fA-F0-9]/g, "").toUpperCase();
        if (method === "recovery" && cleanCode.length !== 32) {
            setError("Recovery code must be exactly 32 hexadecimal characters.");
            return;
        }

        setSubmitting(true);

        try {
            const endpoint = method === "email"
                ? "/api/auth/forgot-password"
                : "/api/auth/forgot-password/recovery-code";

            const payload = method === "email"
                ? { email: cleanEmail }
                : { email: cleanEmail, code: cleanCode };

            const result = await requestJson(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (method === "email") {
                setSent(true);
            } else if (result?.token) {
                navigate(`/reset-password?token=${encodeURIComponent(result.token)}`);
            } else {
                throw new Error("Unable to verify recovery code.");
            }
        } catch (requestError) {
            setError(
                requestError instanceof TypeError
                    ? "Can't reach the store right now. Check your internet connection and try again."
                    : requestError.message || "Unable to process password reset."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 px-5 py-12 flex items-center justify-center">
            <section className="w-full max-w-md rounded-3xl border border-orange-100 bg-white p-8 shadow-xl">
                <Link to="/login" className="text-3xl font-extrabold text-gray-800 tracking-tight">
                    Gr<span className="text-orange-500">o</span>cify
                </Link>
                <h1 className="mt-8 text-2xl font-bold text-gray-800">Forgot your password?</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Choose how you want to verify your account and set a new password.
                </p>

                {/* Method Switcher Tabs */}
                <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-orange-50 p-1">
                    <button
                        type="button"
                        onClick={() => handleMethodSwitch("email")}
                        className={`rounded-lg py-2 text-xs font-bold transition ${method === "email" ? "bg-white text-orange-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        Email Link
                    </button>
                    <button
                        type="button"
                        onClick={() => handleMethodSwitch("recovery")}
                        className={`rounded-lg py-2 text-xs font-bold transition ${method === "recovery" ? "bg-white text-orange-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        Recovery Code
                    </button>
                </div>

                {/* Email Sent Success State */}
                {sent && method === "email" ? (
                    <div className="mt-6 space-y-4">
                        <div role="status" className="rounded-2xl bg-green-50 border border-green-200 p-4 text-xs leading-5 text-green-800">
                            <p className="font-semibold text-green-900 mb-1">Check your inbox</p>
                            If an account exists for <span className="font-semibold">{email}</span>, a password reset link has been sent. The link expires in 15 minutes.
                        </div>
                        <button
                            type="button"
                            onClick={() => { setSent(false); setError(""); }}
                            className="w-full rounded-xl border border-stone-300 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
                        >
                            Try another email
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="reset-email" className="mb-1.5 block text-xs font-semibold uppercase text-gray-700">
                                Account Email
                            </label>
                            <input
                                id="reset-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                placeholder="name@example.com"
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                            />
                        </div>

                        {method === "recovery" && (
                            <div>
                                <label htmlFor="recovery-code" className="mb-1.5 block text-xs font-semibold uppercase text-gray-700">
                                    One-Time Recovery Code
                                </label>
                                <input
                                    id="recovery-code"
                                    type="text"
                                    autoComplete="off"
                                    spellCheck="false"
                                    value={recoveryCode}
                                    onChange={(event) => setRecoveryCode(event.target.value)}
                                    required
                                    placeholder="32-CHARACTER CODE"
                                    maxLength={36}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 font-mono text-sm uppercase tracking-wider outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                />
                                <p className="mt-1.5 text-[11px] text-gray-500">
                                    Paste one of the 10 codes generated from your profile. Each code can only be used once.
                                </p>
                            </div>
                        )}

                        {error && (
                            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-xl bg-orange-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-wait disabled:opacity-60"
                        >
                            {submitting
                                ? method === "email" ? "Sending link..." : "Validating code..."
                                : method === "email" ? "Send reset link" : "Verify & reset password"}
                        </button>
                    </form>
                )}

                <div className="mt-6 border-t border-gray-100 pt-4 text-center">
                    <p className="text-xs text-gray-600">
                        Remember your password?{" "}
                        <Link to="/login" className="font-semibold text-orange-600 hover:underline">
                            Back to login
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
}