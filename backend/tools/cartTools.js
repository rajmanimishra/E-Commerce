
const Cart = require("../schema/cartSchema");
const Product = require("../productSchema/productSchema");

async function addToCart({ userId, productId, quantity = 1 }) {
    try {
        const product = await Product.findById(productId);

        if (!product) {
            return {
                success: false,
                message: "Product not found"
            };
        }

        const qty = Number(quantity);

        if (!Number.isInteger(qty) || qty <= 0) {
            return {
                success: false,
                message: "Quantity must be a positive number"
            };
        }

        let cartItem = await Cart.findOne({
            userId,
            productId
        });

        if (cartItem) {
            cartItem.quantity += qty;
            await cartItem.save();
        } else {
            cartItem = await Cart.create({
                userId,
                productId,
                quantity: qty
            });
        }

        return {
            success: true,
            message: `${ qty } ${ product.title } added to cart`,
            product: {
                id: product._id.toString(),
                title: product.title,
                price: product.price,
                quantity: cartItem.quantity
            }
        };

    } catch (error) {
        console.error("Add to cart error:", error);
        throw error;
    }
}


async function getCart({ userId }) {
    try {
        const cartItems = await Cart.find({ userId })
            .populate("productId");

        return cartItems.map(item => ({
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
        const cartItem = await Cart.findOneAndDelete({
            userId,
            productId
        });

        if (!cartItem) {
            return {
                success: false,
                message: "Product is not in your cart"
            };
        }

        const product = await Product.findById(productId);

        return {
            success: true,
            message: `${ product ? product.title : "Product" } removed from cart`
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

        const cartItem = await Cart.findOne({
            userId,
            productId
        });

        if (!cartItem) {
            return {
                success: false,
                message: "Product is not in your cart"
            };
        }

        cartItem.quantity = qty;
        await cartItem.save();

        const product = await Product.findById(productId);

        return {
            success: true,
            message: `${ product ? product.title : "Product" } quantity updated`,
            product: {
                id: productId,
                title: product ? product.title : "Product",
                price: product ? product.price : 0,
                quantity: cartItem.quantity,
                total: product
                    ? product.price * cartItem.quantity
                    : 0
            }
        };

    } catch (error) {
        console.error("Update cart quantity error:", error);
        throw error;
    }
}


async function clearCart({ userId }) {
    try {
        const result = await Cart.deleteMany({
            userId
        });

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

