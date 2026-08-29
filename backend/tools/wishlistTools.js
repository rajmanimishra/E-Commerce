
const Wishlist = require("../wishlistSchema/wishlistSchema");
const Product = require("../productSchema/productSchema");


// Add product to wishlist
async function addToWishlist({ userId, productId }) {
    try {
        const product = await Product.findById(productId);

        if (!product) {
            return {
                success: false,
                message: "Product not found"
            };
        }

        const existingItem = await Wishlist.findOne({
            userId,
            productId
        });

        if (existingItem) {
            return {
                success: false,
                message: `${product.title} is already in your wishlist`
            };
        }

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
        console.error("Add to wishlist error:", error);
        throw error;
    }
}


// Get wishlist
async function getWishlist({ userId }) {
    try {
        const wishlist = await Wishlist.find({
            userId
        }).populate("productId");

        return wishlist.map(item => ({
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
        const deletedItem = await Wishlist.findOneAndDelete({
            userId,
            productId
        });

        if (!deletedItem) {
            return {
                success: false,
                message: "Product is not in your wishlist"
            };
        }

        const product = await Product.findById(productId);

        return {
            success: true,
            message: `${product ? product.title : "Product"} removed from wishlist`
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

