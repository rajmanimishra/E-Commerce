const Cart = require("../schema/cartSchema");
const Product = require("../productSchema/productSchema");

async function addToCart({ userId, productId, quantity = 1 }) {
    try {
        const qty = Number(quantity);
        if (!Number.isInteger(qty) || qty <= 0) {
            return {
                success: false,
                message: "Quantity must be a positive number"
            };
        }

        // 1. प्रोडक्ट की केवल जरूरी फ़ील्ड्स फेच करें (पूरा डॉक्यूमेंट नहीं)
        const product = await Product.findById(productId).select("title price").lean();
        if (!product) {
            return {
                success: false,
                message: "Product not found"
            };
        }

        // 2. findOne + save/create के बजाय सिंगल एटॉमिक UPSERT ऑपरेशन
        const updatedCartItem = await Cart.findOneAndUpdate(
            { userId, productId },
            { $inc: { quantity: qty } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).lean();

        return {
            success: true,
            message: `${qty} ${product.title} added to cart`,
            product: {
                id: product._id.toString(),
                title: product.title,
                price: product.price,
                quantity: updatedCartItem.quantity
            }
        };

    } catch (error) {
        console.error("Add to cart error:", error);
        throw error;
    }
}

async function getCart({ userId }) {
    try {
        // .lean() जोड़ने से Mongoose डॉक्यूमेंट ओवरहेड खत्म हो जाता है और परफॉर्मेंस 4x-5x फ़ास्ट हो जाती है
        const cartItems = await Cart.find({ userId })
            .populate("productId", "title price")
            .lean();

        return cartItems
            .filter(item => item.productId) // अगर कोई प्रोडक्ट डिलीट हो चुका हो तो क्रैश से बचाव
            .map(item => ({
                cartItemId: item._id.toString(),
                productId: item.productId._id.toString(),
                title: item.productId.title,
                price: item.productId.price,
                quantity: item.quantity,
                total: item.productId.price * item.quantity
            }));

    } catch (error) {
        console.error("Get cart error:", error);
        throw error;
    }
}

async function removeFromCart({ userId, productId }) {
    try {
        const cartItem = await Cart.findOneAndDelete({ userId, productId }).lean();

        if (!cartItem) {
            return {
                success: false,
                message: "Product is not in your cart"
            };
        }

        return {
            success: true,
            message: "Product removed from cart"
        };

    } catch (error) {
        console.error("Remove from cart error:", error);
        throw error;
    }
}

async function updateCartQuantity({ userId, productId, quantity }) {
    try {
        const qty = Number(quantity);
        if (!Number.isInteger(qty) || qty <= 0) {
            return {
                success: false,
                message: "Quantity must be a positive number"
            };
        }

        const [cartItem, product] = await Promise.all([
            Cart.findOneAndUpdate(
                { userId, productId },
                { $set: { quantity: qty } },
                { new: true }
            ).lean(),
            Product.findById(productId).select("title price").lean()
        ]);

        if (!cartItem) {
            return {
                success: false,
                message: "Product is not in your cart"
            };
        }

        return {
            success: true,
            message: `${product ? product.title : "Product"} quantity updated`,
            product: {
                id: productId,
                title: product ? product.title : "Product",
                price: product ? product.price : 0,
                quantity: cartItem.quantity,
                total: product ? product.price * cartItem.quantity : 0
            }
        };

    } catch (error) {
        console.error("Update cart quantity error:", error);
        throw error;
    }
}

async function clearCart({ userId }) {
    try {
        const result = await Cart.deleteMany({ userId });
        return {
            success: true,
            message: "Cart cleared successfully",
            deletedItems: result.deletedCount
        };
    } catch (error) {
        console.error("Clear cart error:", error);
        throw error;
    }
}

module.exports = {
    addToCart,
    getCart,
    removeFromCart,
    updateCartQuantity,
    clearCart
};