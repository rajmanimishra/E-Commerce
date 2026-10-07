import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { requestJson } from "../utils/api";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

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
                    ? "Can't reach the store right now. Check your connection and try again."
                    : requestError.message || "Unable to reset your password."
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
                <h1 className="mt-8 text-2xl font-bold text-gray-800">Choose a new password</h1>

                {success ? (
                    <div className="mt-4">
                        <p role="status" className="rounded-xl bg-green-50 p-4 text-sm leading-6 text-green-800">
                            Your password has been reset. You can sign in with it now.
                        </p>
                        <Link
                            to="/login"
                            className="mt-5 inline-block rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
                        >
                            Go to login
                        </Link>
                    </div>
                ) : !token ? (
                    <div className="mt-4">
                        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700">
                            This reset link is missing or invalid. Request a new one to continue.
                        </p>
                        <Link to="/forgot-password" className="mt-5 inline-block font-semibold text-orange-600 hover:underline">
                            Request another link
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="mt-2 text-gray-600">
                            Use at least 8 characters. You’ll use this password the next time you sign in.
                        </p>
                        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                            <div>
                                <label htmlFor="new-password" className="mb-2 block text-sm font-semibold text-gray-700">
                                    New password
                                </label>
                                <input
                                    id="new-password"
                                    type="password"
                                    autoComplete="new-password"
                                    minLength={8}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-gray-700">
                                    Confirm new password
                                </label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    autoComplete="new-password"
                                    minLength={8}
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
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
                                {submitting ? "Saving..." : "Set new password"}
                            </button>
                        </form>
                    </>
                )}

                <p className="mt-6 text-sm text-gray-600">
                    <Link to="/login" className="font-semibold text-orange-600 hover:underline">
                        Back to login
                    </Link>
                </p>
            </section>
        </main>
    );
}
