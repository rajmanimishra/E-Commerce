import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { requestJson } from "../../utils/api";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [generatingCodes, setGeneratingCodes] = useState(false);

    useEffect(() => {
        const getProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const data = await requestJson("/api/auth/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(data.user);
            } catch (requestError) {
                setError(requestError.message || "Unable to load your profile.");
            } finally {
                setLoading(false);
            }
        };

        getProfile();
    }, []);

    const handleGenerateRecoveryCodes = async () => {
        const confirmed = window.confirm(
            "Generate a new set of recovery codes? Any codes you previously saved will stop working."
        );
        if (!confirmed) return;

        setError("");
        setMessage("");
        setGeneratingCodes(true);

        try {
            const token = localStorage.getItem("token");
            const data = await requestJson("/api/auth/profile/recovery-codes", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecoveryCodes(data.recoveryCodes);
            setMessage(data.message);
        } catch (requestError) {
            setError(requestError.message || "Unable to generate recovery codes.");
        } finally {
            setGeneratingCodes(false);
        }
    };

    if (loading) {
        return <main className="mx-auto max-w-2xl px-5 py-16 text-gray-600">Loading profile...</main>;
    }

    return (
        <main className="mx-auto max-w-2xl px-5 py-12">
            <section className="rounded-3xl border border-orange-100 bg-white p-8 shadow-lg">
                <Link to="/" className="font-semibold text-orange-600 hover:underline">
                    Back to store
                </Link>
                <h1 className="text-3xl font-bold text-gray-800">Your profile</h1>
                {user && (
                    <div className="mt-6 space-y-2 text-gray-700">
                        <p><span className="font-semibold">Name:</span> {user.name}</p>
                        <p><span className="font-semibold">Email:</span> {user.email}</p>
                    </div>
                )}

                <div className="mt-8 border-t border-gray-100 pt-6">
                    <h2 className="text-xl font-bold text-gray-800">Password recovery codes</h2>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                        Generate codes now and store them somewhere private, such as a password manager. Each code works once. A new set replaces all older codes.
                    </p>
                    <button
                        type="button"
                        onClick={handleGenerateRecoveryCodes}
                        disabled={generatingCodes}
                        className="mt-4 rounded-xl bg-orange-600 px-4 py-3 font-bold text-white disabled:cursor-wait disabled:opacity-60"
                    >
                        {generatingCodes ? "Generating..." : recoveryCodes.length ? "Generate new codes" : "Generate recovery codes"}
                    </button>
                    {error && (
                        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </p>
                    )}
                    {message && (
                        <p role="status" className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
                            {message}
                        </p>
                    )}
                    {recoveryCodes.length > 0 && (
                        <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
                            <p role="alert" className="mb-3 text-sm font-semibold text-orange-900">
                                These codes are shown only now. Save them before leaving this page.
                            </p>
                            <ul className="grid grid-cols-1 gap-2 font-mono text-sm sm:grid-cols-2">
                                {recoveryCodes.map((code) => <li key={code}>{code}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Profile;
