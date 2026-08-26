import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {

    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);


    // FETCH WISHLIST
    const fetchWishlist = async () => {

        const token = localStorage.getItem("token");

        if (!token) {
            setWishlistItems([]);
            return;
        }

        try {

            setLoading(true);

            const response = await fetch(
                "http://localhost:3000/api/wishlist",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (data.success) {
                setWishlistItems(data.wishlist);
            } else {
                setWishlistItems([]);
            }

        } catch (error) {

            console.error("Fetch wishlist error:", error);
            setWishlistItems([]);

        } finally {

            setLoading(false);

        }
    };


    // ADD TO WISHLIST
    const addToWishlist = async (productId) => {

        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please login first.");
            return false;
        }

        try {

            const response = await fetch(
                "http://localhost:3000/api/wishlist/add",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        productId: productId,
                    }),
                }
            );

            const data = await response.json();

            if (data.success) {

                await fetchWishlist();

                return true;

            } else {

                alert(
                    data.message ||
                    "Failed to add product to wishlist"
                );

                return false;
            }

        } catch (error) {

            console.error("Add wishlist error:", error);

            alert("Something went wrong.");

            return false;
        }
    };


    // REMOVE FROM WISHLIST
    const removeFromWishlist = async (productId) => {

        const token = localStorage.getItem("token");

        if (!token) {
            return false;
        }

        try {

            const response = await fetch(
                `http://localhost:3000/api/wishlist/${productId}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (data.success) {

                setWishlistItems((previousItems) =>
                    previousItems.filter(
                        (item) =>
                            item.productId?._id !== productId
                    )
                );

                return true;

            } else {

                alert(
                    data.message ||
                    "Unable to remove product"
                );

                return false;
            }

        } catch (error) {

            console.error("Remove wishlist error:", error);

            return false;
        }
    };


    // CHECK PRODUCT IN WISHLIST
    const isInWishlist = (productId) => {

        return wishlistItems.some(
            (item) =>
                item.productId?._id === productId
        );
    };


    // INITIAL FETCH
    useEffect(() => {

        fetchWishlist();

    }, []);


    // WISHLIST COUNT
    const wishlistCount = wishlistItems.length;


    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                wishlistCount,
                loading,
                fetchWishlist,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};


// CUSTOM HOOK
export const useWishlist = () => {

    return useContext(WishlistContext);

};