import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { invalidateProducts } from "../utils/products";

const API = import.meta.env.VITE_API_URL || (
    import.meta.env.DEV
        ? "http://localhost:3000"
        : "https://e-commerce-z6p4.onrender.com"
);

const tabs = ["Products", "Orders", "Customers"];
const orderStatuses = [
    "Placed",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
];
const emptyProduct = { title: "", price: "", image: "", category: "" };

async function request(path, options = {}) {
    const isFormData = options.body instanceof FormData;
    const token = localStorage.getItem("token");

    const response = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            ...(!isFormData && { "Content-Type": "application/json" }),
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        throw new Error(`Server returned HTTP ${response.status}. Please check backend connection.`);
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Request failed.");
    }

    return data;
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("Products");
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Product Form States
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState(emptyProduct);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const imagePreviewRef = useRef("");
    const [showProductForm, setShowProductForm] = useState(false);
    const [saving, setSaving] = useState(false);

    // Customer Password States
    const [editingCustomerPasswordId, setEditingCustomerPasswordId] = useState("");
    const [customerPassword, setCustomerPassword] = useState("");
    const [customerPasswordConfirmation, setCustomerPasswordConfirmation] = useState("");
    const [passwordActionCustomerId, setPasswordActionCustomerId] = useState("");

    const navigate = useNavigate();
    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
            return {};
        }
    }, []);

    // 1. Auth Guard: टोकन न होने पर तुरंत रीडायरेक्ट
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/admin/login");
        }
    }, [navigate]);

    // 2. ऑटो-डिसमिस नोटिस टोस्ट
    useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => setNotice(""), 3500);
        return () => clearTimeout(timer);
    }, [notice]);

    // 3. Blob Memory Cleanup
    useEffect(() => () => {
        if (imagePreviewRef.current) URL.revokeObjectURL(imagePreviewRef.current);
    }, []);

    // 4. डेटा फ़ेचिंग (Tab Change पर)
    useEffect(() => {
        let active = true;

        async function loadTab() {
            setLoading(true);
            setError("");
            setSearchQuery("");

            try {
                if (activeTab === "Products") {
                    const data = await request("/api/products");
                    if (active) setProducts(data.products || []);
                } else if (activeTab === "Orders") {
                    const data = await request("/api/orders/admin/all");
                    if (active) setOrders(data.orders || []);
                } else {
                    const data = await request("/api/auth/admin/customers");
                    if (active) setCustomers(data.customers || []);
                }
            } catch (err) {
                if (active) {
                    if (err.message.includes("401") || err.message.includes("Unauthorized")) {
                        signOut();
                    } else {
                        setError(err.message || "Unable to load data.");
                    }
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        loadTab();
        return () => {
            active = false;
        };
    }, [activeTab]);

    function signOut() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/admin/login");
    }

    function selectImage(file) {
        if (imagePreviewRef.current) URL.revokeObjectURL(imagePreviewRef.current);
        imagePreviewRef.current = file ? URL.createObjectURL(file) : "";
        setImagePreview(imagePreviewRef.current);
        setImageFile(file);
    }

    function startNewProduct() {
        setEditingProduct(null);
        setProductForm(emptyProduct);
        selectImage(null);
        setShowProductForm(true);
        setError("");
        setNotice("");
    }

    function startEditingProduct(product) {
        setEditingProduct(product);
        setProductForm({
            title: product.title,
            price: product.price,
            image: product.image,
            category: product.category,
        });
        selectImage(null);
        setShowProductForm(true);
        setError("");
        setNotice("");
    }

    // ⚡ Optimistic / Instant Product State Update
    async function saveProduct(event) {
        event.preventDefault();
        setSaving(true);
        setError("");

        try {
            const path = editingProduct ? `/api/products/${editingProduct._id}` : "/api/products";
            const body = new FormData();
            body.set("title", productForm.title);
            body.set("price", String(Number(productForm.price)));
            body.set("image", productForm.image);
            body.set("category", productForm.category);
            if (imageFile) body.set("imageFile", imageFile);

            const data = await request(path, {
                method: editingProduct ? "PUT" : "POST",
                body,
            });

            if (editingProduct) {
                setProducts((prev) =>
                    prev.map((p) => (p._id === editingProduct._id ? (data.product || { ...p, ...productForm }) : p))
                );
            } else if (data.product) {
                setProducts((prev) => [data.product, ...prev]);
            }

            setShowProductForm(false);
            setEditingProduct(null);
            setProductForm(emptyProduct);
            selectImage(null);
            setNotice(data.message || "Product saved successfully.");
        } catch (err) {
            setError(err.message || "Unable to save this product.");
        } finally {
            setSaving(false);
        }
    }

    // ⚡ Optimistic Remove Product
    async function removeProduct(product) {
        if (!window.confirm(`Remove "${product.title}" from catalog?`)) return;

        setError("");
        const originalProducts = [...products];
        setProducts((prev) => prev.filter((p) => p._id !== product._id));

        try {
            const data = await request(`/api/products/${product._id}`, { method: "DELETE" });
            setNotice(data.message || "Product removed.");
        } catch (err) {
            setProducts(originalProducts); // Rollback on error
            setError(err.message || "Unable to remove product.");
        }
    }

    // ⚡ Optimistic Order Status Update
    async function updateOrderStatus(orderId, orderStatus) {
        setError("");
        const originalOrders = [...orders];

        setOrders((prev) =>
            prev.map((order) => (order._id === orderId ? { ...order, orderStatus } : order))
        );

        try {
            const data = await request(`/api/orders/${orderId}/status`, {
                method: "PATCH",
                body: JSON.stringify({ orderStatus }),
            });
            setNotice(data.message || "Status updated.");
        } catch (err) {
            setOrders(originalOrders);
            setError(err.message || "Unable to update status.");
        }
    }

    // ⚡ Optimistic Customer Status Toggle
    async function updateCustomerStatus(customer) {
        setError("");
        const nextStatus = !customer.isActive;
        const originalCustomers = [...customers];

        setCustomers((prev) =>
            prev.map((c) => (c.id === customer.id ? { ...c, isActive: nextStatus } : c))
        );

        try {
            const data = await request(`/api/auth/admin/customers/${customer.id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ isActive: nextStatus }),
            });
            setNotice(data.message || "Account status changed.");
        } catch (err) {
            setCustomers(originalCustomers);
            setError(err.message || "Unable to update customer.");
        }
    }

    async function updateCustomerPassword(event, customer) {
        event.preventDefault();
        setError("");

        if (customerPassword !== customerPasswordConfirmation) {
            setError("Passwords do not match.");
            return;
        }

        setPasswordActionCustomerId(customer.id);
        try {
            const data = await request(`/api/auth/admin/customers/${customer.id}/password`, {
                method: "PATCH",
                body: JSON.stringify({ password: customerPassword }),
            });
            setNotice(data.message || "Password updated.");
            setEditingCustomerPasswordId("");
            setCustomerPassword("");
            setCustomerPasswordConfirmation("");
        } catch (err) {
            setError(err.message || "Unable to update password.");
        } finally {
            setPasswordActionCustomerId("");
        }
    }

    async function sendCustomerPasswordReset(customer) {
        if (!window.confirm(`Send password reset email to ${customer.email}?`)) return;

        setError("");
        setPasswordActionCustomerId(customer.id);
        try {
            const data = await request(`/api/auth/admin/customers/${customer.id}/password-reset`, {
                method: "POST",
            });
            setNotice(data.message || "Reset link emailed.");
        } catch (err) {
            setError(err.message || "Unable to send reset email.");
        } finally {
            setPasswordActionCustomerId("");
        }
    }

    // फ़िल्टरिंग लॉजिक
    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;
        const q = searchQuery.toLowerCase();
        return products.filter((p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }, [products, searchQuery]);

    const filteredOrders = useMemo(() => {
        if (!searchQuery.trim()) return orders;
        const q = searchQuery.toLowerCase();
        return orders.filter(
            (o) =>
                o._id.toLowerCase().includes(q) ||
                o.customer?.fullName?.toLowerCase().includes(q) ||
                o.customer?.mobile?.includes(q)
        );
    }, [orders, searchQuery]);

    const filteredCustomers = useMemo(() => {
        if (!searchQuery.trim()) return customers;
        const q = searchQuery.toLowerCase();
        return customers.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    }, [customers, searchQuery]);

    return (
        <main className="min-h-screen bg-stone-100 text-stone-900">
            <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
                    <div>
                        <p className="text-xl font-extrabold tracking-tight">
                            Gr<span className="text-orange-500">o</span>cify
                            <span className="ml-2 rounded bg-stone-100 px-2 py-0.5 text-xs font-semibold uppercase text-stone-600">Admin</span>
                        </p>
                        <p className="text-xs text-stone-500">
                            {user.name || user.email || "Store Admin"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={signOut}
                        className="rounded-lg border border-stone-300 px-3.5 py-1.5 text-sm font-semibold hover:bg-stone-50"
                    >
                        Sign out
                    </button>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-5 py-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Store Management</h1>
                        <p className="text-sm text-stone-600">Control products, manage orders, and support customer accounts.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder={`Search ${activeTab.toLowerCase()}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-orange-500 sm:w-64"
                        />
                    </div>
                </div>

                <nav className="mb-6 flex gap-2 border-b border-stone-200 pb-3" aria-label="Admin sections">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => {
                                setActiveTab(tab);
                                setError("");
                                setNotice("");
                            }}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === tab
                                    ? "bg-stone-900 text-white shadow-sm"
                                    : "bg-white text-stone-700 hover:bg-stone-200"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>

                {error && (
                    <div role="alert" className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                        {error}
                    </div>
                )}
                {notice && (
                    <div role="status" className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-800 border border-green-200">
                        {notice}
                    </div>
                )}

                {/* ================= PRODUCTS TAB ================= */}
                {activeTab === "Products" && (
                    <section className="rounded-xl border border-stone-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                            <div>
                                <h2 className="text-base font-bold">Catalog Items ({filteredProducts.length})</h2>
                                <p className="text-xs text-stone-500">Live inventory synced with MongoDB.</p>
                            </div>
                            <button
                                type="button"
                                onClick={showProductForm ? () => setShowProductForm(false) : startNewProduct}
                                className="rounded-lg bg-orange-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-orange-700"
                            >
                                {showProductForm ? "Cancel Form" : "+ Add Product"}
                            </button>
                        </div>

                        {showProductForm && (
                            <form onSubmit={saveProduct} className="grid gap-4 border-b border-stone-200 bg-stone-50 p-5 sm:grid-cols-2">
                                {[
                                    ["title", "Product name", "text"],
                                    ["price", "Price (₹)", "number"],
                                    ["category", "Category", "text"],
                                ].map(([field, label, type]) => (
                                    <label key={field} className="text-xs font-semibold text-stone-700 uppercase">
                                        {label}
                                        <input
                                            type={type}
                                            min={type === "number" ? "0" : undefined}
                                            step={type === "number" ? "0.01" : undefined}
                                            required
                                            value={productForm[field]}
                                            onChange={(e) => setProductForm((c) => ({ ...c, [field]: e.target.value }))}
                                            className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                                        />
                                    </label>
                                ))}

                                <label className="text-xs font-semibold text-stone-700 uppercase">
                                    Product Image Upload
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(e) => selectImage(e.target.files?.[0] || null)}
                                        className="mt-1 block w-full text-xs text-stone-500 file:mr-2 file:rounded file:border-0 file:bg-stone-200 file:px-2.5 file:py-1.5 file:font-semibold hover:file:bg-stone-300"
                                    />
                                </label>

                                <label className="text-xs font-semibold text-stone-700 uppercase sm:col-span-2">
                                    Or Static Image URL
                                    <input
                                        type="text"
                                        value={productForm.image}
                                        onChange={(e) => setProductForm((c) => ({ ...c, image: e.target.value }))}
                                        required={!imageFile}
                                        placeholder="https://... or item.png"
                                        className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                                    />
                                </label>

                                {imagePreview && (
                                    <div className="sm:col-span-2">
                                        <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded border bg-white object-contain p-1" />
                                    </div>
                                )}

                                <div className="flex gap-2 sm:col-span-2">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
                                    >
                                        {saving ? "Saving..." : editingProduct ? "Update Product" : "Save Product"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowProductForm(false)}
                                        className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold hover:bg-white"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        {loading ? (
                            <p className="p-6 text-sm text-stone-500">Loading catalog...</p>
                        ) : filteredProducts.length === 0 ? (
                            <p className="p-6 text-sm text-stone-500">No matching products found.</p>
                        ) : (
                            <div className="divide-y divide-stone-100">
                                {filteredProducts.map((p) => (
                                    <div key={p._id} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-stone-50/50">
                                        <div className="flex items-center gap-3">
                                            {p.image && (
                                                <img src={p.image} alt={p.title} className="h-10 w-10 rounded border object-contain p-1" />
                                            )}
                                            <div>
                                                <p className="font-semibold text-sm">{p.title}</p>
                                                <p className="text-xs text-stone-500">{p.category} · ₹{p.price}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => startEditingProduct(p)}
                                                className="rounded border border-stone-300 px-2.5 py-1 text-xs font-semibold hover:bg-stone-100"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeProduct(p)}
                                                className="rounded border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* ================= ORDERS TAB ================= */}
                {activeTab === "Orders" && (
                    <section className="space-y-3">
                        {loading ? (
                            <p className="rounded-xl bg-white p-6 text-sm text-stone-500 shadow-sm">Loading orders...</p>
                        ) : filteredOrders.length === 0 ? (
                            <p className="rounded-xl bg-white p-6 text-sm text-stone-500 shadow-sm">No matching orders found.</p>
                        ) : (
                            filteredOrders.map((order) => (
                                <article key={order._id} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                                        <div>
                                            <span className="font-mono text-sm font-bold text-stone-800">
                                                #{order._id.slice(-6).toUpperCase()}
                                            </span>
                                            <span className="ml-3 text-xs text-stone-500">
                                                {new Date(order.createdAt).toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-stone-500">Status:</span>
                                            <select
                                                value={order.orderStatus}
                                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                className="rounded border border-stone-300 bg-white px-2 py-1 text-xs font-semibold outline-none focus:border-orange-500"
                                            >
                                                {orderStatuses.map((st) => (
                                                    <option key={st} value={st}>{st}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row">
                                        <div className="space-y-1 text-xs text-stone-600">
                                            <p className="font-semibold text-sm text-stone-800">{order.customer?.fullName}</p>
                                            <p>{order.customer?.mobile} · {order.customer?.address}, {order.customer?.city}</p>
                                            <div className="mt-2 text-stone-700">
                                                {order.items?.map((item, idx) => (
                                                    <span key={idx} className="mr-3 inline-block">
                                                        • {item.title} (×{item.quantity})
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-base font-bold text-stone-900">₹{order.totalAmount}</p>
                                            <p className="text-xs text-stone-500">
                                                {order.paymentMethod} · <span className={order.paymentStatus === "Paid" ? "text-green-600 font-semibold" : "text-amber-600 font-semibold"}>{order.paymentStatus}</span>
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            ))
                        )}
                    </section>
                )}

                {/* ================= CUSTOMERS TAB ================= */}
                {activeTab === "Customers" && (
                    <section className="rounded-xl border border-stone-200 bg-white shadow-sm">
                        <div className="border-b border-stone-200 px-5 py-4">
                            <h2 className="text-base font-bold">Registered Customers ({filteredCustomers.length})</h2>
                            <p className="text-xs text-stone-500">Manage user access and security resets.</p>
                        </div>

                        {loading ? (
                            <p className="p-6 text-sm text-stone-500">Loading accounts...</p>
                        ) : filteredCustomers.length === 0 ? (
                            <p className="p-6 text-sm text-stone-500">No matching customer accounts.</p>
                        ) : (
                            <div className="divide-y divide-stone-100">
                                {filteredCustomers.map((cust) => (
                                    <div key={cust.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 hover:bg-stone-50/50">
                                        <div>
                                            <p className="text-sm font-semibold">{cust.name}</p>
                                            <p className="text-xs text-stone-500">{cust.email}</p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${cust.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                                {cust.isActive ? "Active" : "Suspended"}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingCustomerPasswordId(editingCustomerPasswordId === cust.id ? "" : cust.id);
                                                    setCustomerPassword("");
                                                    setCustomerPasswordConfirmation("");
                                                }}
                                                className="rounded border border-stone-300 px-2.5 py-1 text-xs font-medium hover:bg-stone-50"
                                            >
                                                Password
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => sendCustomerPasswordReset(cust)}
                                                disabled={passwordActionCustomerId === cust.id}
                                                className="rounded border border-orange-200 px-2.5 py-1 text-xs font-medium text-orange-700 hover:bg-orange-50 disabled:opacity-50"
                                            >
                                                Reset Email
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateCustomerStatus(cust)}
                                                className={`rounded border px-2.5 py-1 text-xs font-medium ${cust.isActive ? "border-red-200 text-red-700 hover:bg-red-50" : "border-green-200 text-green-700 hover:bg-green-50"
                                                    }`}
                                            >
                                                {cust.isActive ? "Suspend" : "Activate"}
                                            </button>
                                        </div>

                                        {editingCustomerPasswordId === cust.id && (
                                            <form
                                                onSubmit={(e) => updateCustomerPassword(e, cust)}
                                                className="mt-2 flex w-full flex-wrap items-center gap-2 rounded bg-stone-50 p-3"
                                            >
                                                <input
                                                    type="password"
                                                    placeholder="New password (min 8 chars)"
                                                    minLength={8}
                                                    required
                                                    value={customerPassword}
                                                    onChange={(e) => setCustomerPassword(e.target.value)}
                                                    className="rounded border border-stone-300 bg-white px-2.5 py-1 text-xs outline-none"
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="Confirm password"
                                                    minLength={8}
                                                    required
                                                    value={customerPasswordConfirmation}
                                                    onChange={(e) => setCustomerPasswordConfirmation(e.target.value)}
                                                    className="rounded border border-stone-300 bg-white px-2.5 py-1 text-xs outline-none"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={passwordActionCustomerId === cust.id}
                                                    className="rounded bg-orange-600 px-3 py-1 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingCustomerPasswordId("")}
                                                    className="rounded border border-stone-300 px-2.5 py-1 text-xs hover:bg-white"
                                                >
                                                    Cancel
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}