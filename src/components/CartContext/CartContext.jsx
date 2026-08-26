import React, {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // ===============================
    // FETCH CART
    // ===============================

    const fetchCart = async () => {

        const token = localStorage.getItem("token");

        if (!token) {
            setCartItems([]);
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:3000/api/cart",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (data.success) {
                setCartItems(data.cart);
            } else {
                setCartItems([]);
            }

        } catch (error) {
            console.error("Fetch cart error:", error);
            setCartItems([]);

        } finally {
            setLoading(false);
        }
    };


    // ===============================
    // ADD TO CART
    // ===============================

    const addToCart = async (productId) => {

        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please login first.");
            return false;
        }

        try {

            const response = await fetch(
                "http://localhost:3000/api/cart/add",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        productId: productId,
                        quantity: 1,
                    }),
                }
            );

            const data = await response.json();

            if (data.success) {

                await fetchCart();

                return true;

            } else {

                alert(data.message || "Failed to add product");

                return false;
            }

        } catch (error) {

            console.error("Add to cart error:", error);

            alert("Something went wrong.");

            return false;
        }
    };


    // ===============================
    // UPDATE QUANTITY
    // ===============================

    const updateQuantity = async (productId, quantity) => {

        if (quantity < 1) {
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        try {

            const response = await fetch(
                `http://localhost:3000/api/cart/${productId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        quantity: quantity,
                    }),
                }
            );

            const data = await response.json();

            if (data.success) {

                setCartItems((previousItems) =>
                    previousItems.map((item) =>
                        item.productId._id === productId
                            ? {
                                ...item,
                                quantity: quantity,
                            }
                            : item
                    )
                );

            } else {

                alert(
                    data.message ||
                    "Unable to update quantity"
                );
            }

        } catch (error) {

            console.error(
                "Update quantity error:",
                error
            );
        }
    };


    // ===============================
    // REMOVE FROM CART
    // ===============================

    const removeFromCart = async (productId) => {

        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        try {

            const response = await fetch(
                `http://localhost:3000/api/cart/${productId}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (data.success) {

                setCartItems((previousItems) =>
                    previousItems.filter(
                        (item) =>
                            item.productId._id !== productId
                    )
                );

            } else {

                alert(
                    data.message ||
                    "Unable to remove product"
                );
            }

        } catch (error) {

            console.error(
                "Remove cart error:",
                error
            );
        }
    };


    // ===============================
    // INITIAL FETCH
    // ===============================

    useEffect(() => {
        fetchCart();
    }, []);


    // ===============================
    // CART COUNT
    // ===============================

    const cartCount = cartItems.reduce(
        (total, item) =>
            total + item.quantity,
        0
    );


    // ===============================
    // CART TOTAL
    // ===============================

    const cartTotal = cartItems.reduce(
        (total, item) =>
            total +
            item.productId.price *
            item.quantity,
        0
    );


    return (
        <CartContext.Provider
            value={{
                cartItems,
                cartCount,
                cartTotal,
                loading,
                fetchCart,
                addToCart,
                updateQuantity,
                removeFromCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};


// ===============================
// CUSTOM HOOK
// ===============================

export const useCart = () => {
    return useContext(CartContext);
};