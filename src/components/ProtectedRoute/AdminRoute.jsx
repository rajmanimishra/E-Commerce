import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const isAdmin = (() => {
        try {
            return JSON.parse(savedUser || "{}").role === "admin";
        } catch {
            return false;
        }
    })();

    if (!token || !isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}
