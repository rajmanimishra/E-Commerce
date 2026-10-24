import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { requestJson } from "../utils/api";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token")?.trim() || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [countdown, setCountdown] = useState(5);

    const navigate = useNavigate();

    // 1. अगर टोकन का फॉर्मेट बहुत छोटा या अमान्य है
    const isTokenFormatValid = token.length >= 30;

    // 2. सफलता मिलने पर 5 सेकंड बाद ऑटो-रीडायरेक्ट
    useEffect(() => {
        if (!success) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate("/login", { replace: true });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [success, navigate]);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Those passwords don’t match.");
            return;
        }

        setSubmitting(true);

        try {
            await requestJson("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            setSuccess(true);
        } catch (requestError) {
            setError(
                requestError instanceof TypeError
                    ? "Can't reach the store right now. Check your internet connection and try again."
                    : requestError.message || "Unable to reset your password. The link may have expired."
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
                <h1 className="mt-8 text-2xl font-bold text-gray-800">Choose a new password</h1>

                {success ? (
                    <div className="mt-6 space-y-4">
                        <div role="status" className="rounded-2xl border border-green-200 bg-green-50 p-4 text-xs leading-5 text-green-800">
                            <p className="font-semibold text-green-900 mb-1">Password updated successfully</p>
                            Your password has been changed. Redirecting to login in {countdown} seconds...
                        </div>
                        <Link
                            to="/login"
                            className="block w-full text-center rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 transition"
                        >
                            Sign in now
                        </Link>
                    </div>
                ) : !token || !isTokenFormatValid ? (
                    <div className="mt-6 space-y-4">
                        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs leading-5 text-red-700">
                            <p className="font-semibold text-red-900 mb-1">Invalid or Expired Link</p>
                            This password reset token is missing, malformed, or has already expired.
                        </div>
                        <Link
                            to="/forgot-password"
                            className="block w-full text-center rounded-xl border border-stone-300 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
                        >
                            Request a new link
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="mt-2 text-xs text-gray-600">
                            Must be at least 8 characters. You will use this new password next time you sign in.
                        </p>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="new-password" className="mb-1.5 block text-xs font-semibold uppercase text-gray-700">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="new-password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        minLength={8}
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        required
                                        placeholder="At least 8 characters"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 pr-14 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-gray-800"
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-semibold uppercase text-gray-700">
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirm-password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    minLength={8}
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    required
                                    placeholder="Repeat your password"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                />
                            </div>

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
                                {submitting ? "Updating password..." : "Set new password"}
                            </button>
                        </form>
                    </>
                )}

                <div className="mt-6 border-t border-gray-100 pt-4 text-center">
                    <p className="text-xs text-gray-600">
                        <Link to="/login" className="font-semibold text-orange-600 hover:underline">
                            Back to login
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
}