const Wishlist = require("../wishlistSchema/wishlistSchema");
const Product = require("../productSchema/productSchema");

// Add product to wishlist
async function addToWishlist({ userId, productId }) {
    try {
        // 1. प्रोडक्ट चेक और विशलिस्ट डुप्लीकेट चेक दोनों को एक साथ (Parallel) चलाएँ
        const [product, existingItem] = await Promise.all([
            Product.findById(productId).select("title price").lean(),
            Wishlist.findOne({ userId, productId }).select("_id").lean()
        ]);

        if (!product) {
            return {
                success: false,
                message: "Product not found"
            };
        }

        if (existingItem) {
            return {
                success: false,
                message: `${product.title} is already in your wishlist`
            };
        }

        // 2. विशलिस्ट में इंसर्ट करें
        await Wishlist.create({
            userId,
            productId
        });

        return {
            success: true,
            message: `${product.title} added to wishlist`,
            product: {
                id: product._id.toString(),
                title: product.title,
                price: product.price
            }
        };

    } catch (error) {
        // अगर MongoDB Unique Index की वजह से डुप्लीकेट एरर (E11000) आए तो उसे सुरक्षित हैंडल करें
        if (error.code === 11000) {
            return {
                success: false,
                message: "Product is already in your wishlist"
            };
        }
        console.error("Add to wishlist error:", error);
        throw error;
    }
}

// Get wishlist
async function getWishlist({ userId }) {
    try {
        // .lean() जोड़ने से मेमोरी और टाइम दोनों काफी कम हो जाते हैं
        const wishlist = await Wishlist.find({ userId })
            .populate("productId", "title price category image")
            .lean();

        return wishlist
            .filter(item => item.productId) // अगर कभी प्रोडक्ट डिलीट हो जाए तो null क्रैश से बचाव
            .map(item => ({
                wishlistItemId: item._id.toString(),
                productId: item.productId._id.toString(),
                title: item.productId.title,
                price: item.productId.price,
                category: item.productId.category,
                image: item.productId.image
            }));

    } catch (error) {
        console.error("Get wishlist error:", error);
        throw error;
    }
}

// Remove product from wishlist
async function removeFromWishlist({ userId, productId }) {
    try {
        // डिलीट करने के बाद अलग से Product.findById करने की जरूरत नहीं है
        const deletedItem = await Wishlist.findOneAndDelete({
            userId,
            productId
        }).lean();

        if (!deletedItem) {
            return {
                success: false,
                message: "Product is not in your wishlist"
            };
        }

        return {
            success: true,
            message: "Product removed from wishlist"
        };

    } catch (error) {
        console.error("Remove from wishlist error:", error);
        throw error;
    }
}

module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist
};