import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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

async function readResponse(response) {
    if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error(
            `The API at ${API} returned a non-JSON response (HTTP ${response.status}). Check that the backend is running and the API URL is correct.`
        );
    }

    return response.json();
}

async function request(path, options = {}) {
    const isFormData = options.body instanceof FormData;
    const response = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            ...(!isFormData && { "Content-Type": "application/json" }),
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            ...options.headers,
        },
    });
    const data = await readResponse(response);

    if (!response.ok) {
        throw new Error(data.message || "The request could not be completed.");
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
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState(emptyProduct);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const imagePreviewRef = useRef("");
    const [showProductForm, setShowProductForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const [editingCustomerPasswordId, setEditingCustomerPasswordId] = useState("");
    const [customerPassword, setCustomerPassword] = useState("");
    const [customerPasswordConfirmation, setCustomerPasswordConfirmation] = useState("");
    const [passwordActionCustomerId, setPasswordActionCustomerId] = useState("");
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => () => {
        if (imagePreviewRef.current) URL.revokeObjectURL(imagePreviewRef.current);
    }, []);

    useEffect(() => {
        let active = true;

        async function loadTab() {
            setLoading(true);
            setError("");

            try {
                if (activeTab === "Products") {
                    const data = await request("/api/products");
                    if (active) setProducts(data.products);
                } else if (activeTab === "Orders") {
                    const data = await request("/api/orders/admin/all");
                    if (active) setOrders(data.orders);
                } else {
                    const data = await request("/api/auth/admin/customers");
                    if (active) setCustomers(data.customers);
                }
            } catch (requestError) {
                if (active) setError(requestError.message || "Unable to load this section.");
            } finally {
                if (active) setLoading(false);
            }
        }

        loadTab();
        return () => {
            active = false;
        };
    }, [activeTab, refresh]);

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

    async function saveProduct(event) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setNotice("");

        try {
            const path = editingProduct
                ? `/api/products/${editingProduct._id}`
                : "/api/products";
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

            setShowProductForm(false);
            setEditingProduct(null);
            setProductForm(emptyProduct);
            selectImage(null);
            setNotice(data.message);
            setRefresh((value) => value + 1);
        } catch (requestError) {
            setError(requestError.message || "Unable to save this product.");
        } finally {
            setSaving(false);
        }
    }

    async function removeProduct(product) {
        if (!window.confirm(`Remove ${product.title} from the store?`)) return;

        setError("");
        setNotice("");
        try {
            const data = await request(`/api/products/${product._id}`, {
                method: "DELETE",
            });
            setNotice(data.message);
            setRefresh((value) => value + 1);
        } catch (requestError) {
            setError(requestError.message || "Unable to remove this product.");
        }
    }

    async function updateOrderStatus(orderId, orderStatus) {
        setError("");
        setNotice("");
        try {
            const data = await request(`/api/orders/${orderId}/status`, {
                method: "PATCH",
                body: JSON.stringify({ orderStatus }),
            });
            setOrders((current) =>
                current.map((order) =>
                    order._id === orderId ? { ...order, orderStatus } : order
                )
            );
            setNotice(data.message);
        } catch (requestError) {
            setError(requestError.message || "Unable to update this order.");
        }
    }

    async function updateCustomerStatus(customer) {
        setError("");
        setNotice("");
        try {
            const data = await request(
                `/api/auth/admin/customers/${customer.id}/status`,
                {
                    method: "PATCH",
                    body: JSON.stringify({ isActive: !customer.isActive }),
                }
            );
            setCustomers((current) =>
                current.map((entry) =>
                    entry.id === customer.id
                        ? { ...entry, isActive: !customer.isActive }
                        : entry
                )
            );
            setNotice(data.message);
        } catch (requestError) {
            setError(requestError.message || "Unable to update this account.");
        }
    }

    async function updateCustomerPassword(event, customer) {
        event.preventDefault();
        setError("");
        setNotice("");

        if (customerPassword !== customerPasswordConfirmation) {
            setError("The passwords do not match.");
            return;
        }

        setPasswordActionCustomerId(customer.id);
        try {
            const data = await request(
                `/api/auth/admin/customers/${customer.id}/password`,
                {
                    method: "PATCH",
                    body: JSON.stringify({ password: customerPassword }),
                }
            );
            setNotice(data.message);
            setEditingCustomerPasswordId("");
            setCustomerPassword("");
            setCustomerPasswordConfirmation("");
        } catch (requestError) {
            setError(requestError.message || "Unable to update this customer password.");
        } finally {
            setPasswordActionCustomerId("");
        }
    }

    async function sendCustomerPasswordReset(customer) {
        if (!window.confirm(`Send a password reset email to ${customer.email}?`)) return;

        setError("");
        setNotice("");
        setPasswordActionCustomerId(customer.id);
        try {
            const data = await request(
                `/api/auth/admin/customers/${customer.id}/password-reset`,
                { method: "POST" }
            );
            setNotice(data.message);
        } catch (requestError) {
            setError(requestError.message || "Unable to send a password reset email.");
        } finally {
            setPasswordActionCustomerId("");
        }
    }

    return (
        <main className="min-h-screen bg-stone-100 text-stone-900">
            <header className="border-b border-stone-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5">
                    <div>
                        <p className="text-xl font-extrabold">
                            Gr<span className="text-orange-500">o</span>cify
                            <span className="ml-2 text-sm font-medium text-stone-500">Store admin</span>
                        </p>
                        <p className="mt-1 text-sm text-stone-500">
                            Signed in as {user.name || user.email}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={signOut}
                        className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold hover:bg-stone-50"
                    >
                        Sign out
                    </button>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-5 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Store management</h1>
                    <p className="mt-2 text-stone-600">
                        Keep the catalog current and stay on top of customer orders.
                    </p>
                </div>

                <nav className="mb-6 flex flex-wrap gap-2" aria-label="Admin sections">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => {
                                setActiveTab(tab);
                                setNotice("");
                            }}
                            aria-current={activeTab === tab ? "page" : undefined}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                                activeTab === tab
                                    ? "bg-stone-900 text-white"
                                    : "bg-white text-stone-700 hover:bg-stone-200"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>

                {error && (
                    <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </p>
                )}
                {notice && (
                    <p role="status" className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
                        {notice}
                    </p>
                )}

                {activeTab === "Products" && (
                    <section className="rounded-xl border border-stone-200 bg-white">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-5 py-4">
                            <div>
                                <h2 className="text-lg font-bold">Products</h2>
                                <p className="text-sm text-stone-500">Add, edit, or remove items from the catalog.</p>
                            </div>
                            <button
                                type="button"
                                onClick={showProductForm ? () => setShowProductForm(false) : startNewProduct}
                                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                            >
                                {showProductForm ? "Close form" : "Add product"}
                            </button>
                        </div>

                        {showProductForm && (
                            <form onSubmit={saveProduct} className="grid gap-4 border-b border-stone-200 bg-stone-50 p-5 sm:grid-cols-2">
                                {[
                                    ["title", "Product name", "text"],
                                    ["price", "Price (₹)", "number"],
                                    ["category", "Category", "text"],
                                ].map(([field, label, type]) => (
                                    <label key={field} className="text-sm font-medium text-stone-700">
                                        {label}
                                        <input
                                            type={type}
                                            min={type === "number" ? "0" : undefined}
                                            step={type === "number" ? "0.01" : undefined}
                                            required
                                            value={productForm[field]}
                                            onChange={(event) =>
                                                setProductForm((current) => ({
                                                    ...current,
                                                    [field]: event.target.value,
                                                }))
                                            }
                                            className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 outline-none focus:border-orange-500"
                                        />
                                    </label>
                                ))}
                                <label className="text-sm font-medium text-stone-700">
                                    Product image
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(event) => selectImage(event.target.files?.[0] || null)}
                                        className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-stone-100 file:px-3 file:py-2 file:font-semibold hover:file:bg-stone-200"
                                    />
                                    <span className="mt-1 block text-xs font-normal text-stone-500">
                                        JPG, PNG, or WebP. Maximum 5 MB.
                                    </span>
                                </label>
                                <label className="text-sm font-medium text-stone-700">
                                    Or use an image URL / existing filename
                                    <input
                                        type="text"
                                        value={productForm.image}
                                        onChange={(event) => setProductForm((current) => ({
                                            ...current,
                                            image: event.target.value,
                                        }))}
                                        required={!imageFile}
                                        placeholder="https://... or banana.png"
                                        className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 outline-none focus:border-orange-500"
                                    />
                                </label>
                                {imagePreview && (
                                    <div className="sm:col-span-2">
                                        <p className="mb-2 text-sm font-medium text-stone-700">Image preview</p>
                                        <img
                                            src={imagePreview}
                                            alt="Selected product preview"
                                            className="h-28 w-28 rounded-lg border border-stone-200 bg-white object-contain p-2"
                                        />
                                    </div>
                                )}
                                <div className="flex gap-2 sm:col-span-2">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-700 disabled:opacity-60"
                                    >
                                        {saving ? "Saving..." : editingProduct ? "Save changes" : "Add product"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowProductForm(false)}
                                        className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-semibold hover:bg-white"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        {loading ? (
                            <p className="p-6 text-sm text-stone-500">Loading products...</p>
                        ) : products.length === 0 ? (
                            <p className="p-6 text-sm text-stone-500">There are no products in the catalog yet.</p>
                        ) : (
                            <div className="divide-y divide-stone-100">
                                {products.map((product) => (
                                    <div key={product._id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                                        <div>
                                            <p className="font-semibold">{product.title}</p>
                                            <p className="mt-1 text-sm text-stone-500">
                                                {product.category} <span className="mx-1">·</span> ₹{product.price}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => startEditingProduct(product)}
                                                className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium hover:bg-stone-50"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeProduct(product)}
                                                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
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

                {activeTab === "Orders" && (
                    <section className="space-y-4">
                        <div>
                            <h2 className="text-lg font-bold">Orders</h2>
                            <p className="text-sm text-stone-500">Review deliveries and update each order as it moves along.</p>
                        </div>
                        {loading ? (
                            <p className="rounded-xl bg-white p-6 text-sm text-stone-500">Loading orders...</p>
                        ) : orders.length === 0 ? (
                            <p className="rounded-xl bg-white p-6 text-sm text-stone-500">No orders have come in yet.</p>
                        ) : orders.map((order) => (
                            <article key={order._id} className="rounded-xl border border-stone-200 bg-white p-5">
                                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-4">
                                    <div>
                                        <p className="font-semibold">Order {order._id.slice(-8).toUpperCase()}</p>
                                        <p className="mt-1 text-sm text-stone-500">
                                            {new Date(order.createdAt).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                    <label className="text-sm font-medium text-stone-600">
                                        Status
                                        <select
                                            value={order.orderStatus}
                                            onChange={(event) => updateOrderStatus(order._id, event.target.value)}
                                            className="ml-2 rounded-lg border border-stone-300 bg-white px-3 py-2"
                                        >
                                            {orderStatuses.map((status) => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                                <div className="grid gap-5 pt-4 md:grid-cols-[1fr_auto]">
                                    <div>
                                        <p className="font-medium">{order.customer?.fullName}</p>
                                        <p className="text-sm text-stone-600">
                                            {order.customer?.mobile} · {order.customer?.address}, {order.customer?.city}
                                        </p>
                                        <ul className="mt-3 space-y-1 text-sm text-stone-600">
                                            {order.items.map((item, index) => (
                                                <li key={`${order._id}-${index}`}>
                                                    {item.title} × {item.quantity}
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="mt-2 text-sm text-stone-500">
                                            Account: {order.userId?.name || order.userId?.email || "Unavailable"}
                                            {order.userId?.email ? ` (${order.userId.email})` : ""}
                                        </p>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-lg font-bold">₹{order.totalAmount}</p>
                                        <p className="text-sm text-stone-500">
                                            {order.paymentMethod === "ONLINE" ? "Online" : "Cash on delivery"} · {order.paymentStatus}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}

                {activeTab === "Customers" && (
                    <section className="rounded-xl border border-stone-200 bg-white">
                        <div className="border-b border-stone-200 px-5 py-4">
                            <h2 className="text-lg font-bold">Customer accounts</h2>
                            <p className="text-sm text-stone-500">Manage account access, set a new password, or email a reset link.</p>
                        </div>
                        {loading ? (
                            <p className="p-6 text-sm text-stone-500">Loading customer accounts...</p>
                        ) : customers.length === 0 ? (
                            <p className="p-6 text-sm text-stone-500">No customer accounts to show.</p>
                        ) : (
                            <div className="divide-y divide-stone-100">
                                {customers.map((customer) => (
                                    <div key={customer.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                                        <div>
                                            <p className="font-semibold">{customer.name}</p>
                                            <p className="mt-1 text-sm text-stone-500">{customer.email}</p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`text-sm font-medium ${customer.isActive ? "text-green-700" : "text-red-700"}`}>
                                                {customer.isActive ? "Active" : "Suspended"}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingCustomerPasswordId(
                                                        editingCustomerPasswordId === customer.id ? "" : customer.id
                                                    );
                                                    setCustomerPassword("");
                                                    setCustomerPasswordConfirmation("");
                                                    setError("");
                                                    setNotice("");
                                                }}
                                                className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium hover:bg-stone-50"
                                            >
                                                Change password
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => sendCustomerPasswordReset(customer)}
                                                disabled={passwordActionCustomerId === customer.id}
                                                className="rounded-lg border border-orange-200 px-3 py-2 text-sm font-medium text-orange-700 hover:bg-orange-50 disabled:cursor-wait disabled:opacity-60"
                                            >
                                                Email reset link
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateCustomerStatus(customer)}
                                                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                                                    customer.isActive
                                                        ? "border-red-200 text-red-700 hover:bg-red-50"
                                                        : "border-green-200 text-green-700 hover:bg-green-50"
                                                }`}
                                            >
                                                {customer.isActive ? "Suspend" : "Restore access"}
                                            </button>
                                        </div>
                                        {editingCustomerPasswordId === customer.id && (
                                            <form
                                                onSubmit={(event) => updateCustomerPassword(event, customer)}
                                                className="grid w-full gap-3 rounded-lg bg-stone-50 p-4 sm:grid-cols-[1fr_1fr_auto_auto]"
                                            >
                                                <label className="text-sm font-medium text-stone-700">
                                                    New password
                                                    <input
                                                        type="password"
                                                        autoComplete="new-password"
                                                        minLength={8}
                                                        required
                                                        value={customerPassword}
                                                        onChange={(event) => setCustomerPassword(event.target.value)}
                                                        className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
                                                    />
                                                </label>
                                                <label className="text-sm font-medium text-stone-700">
                                                    Confirm password
                                                    <input
                                                        type="password"
                                                        autoComplete="new-password"
                                                        minLength={8}
                                                        required
                                                        value={customerPasswordConfirmation}
                                                        onChange={(event) => setCustomerPasswordConfirmation(event.target.value)}
                                                        className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
                                                    />
                                                </label>
                                                <button
                                                    type="submit"
                                                    disabled={passwordActionCustomerId === customer.id}
                                                    className="self-end rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-wait disabled:opacity-60"
                                                >
                                                    {passwordActionCustomerId === customer.id ? "Saving..." : "Save password"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingCustomerPasswordId("");
                                                        setCustomerPassword("");
                                                        setCustomerPasswordConfirmation("");
                                                    }}
                                                    className="self-end rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-white"
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
