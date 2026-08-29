const Product = require("../productSchema/productSchema");

async function searchProducts({ query, maxPrice }) {
    try {
        const filter = {};

        // Product name search
        if (query) {
            filter.title = {
                $regex: query,
                $options: "i"
            };
        }

        // Maximum price filter
        if (maxPrice !== undefined && maxPrice !== null) {
            filter.price = {
                $lte: Number(maxPrice)
            };
        }

        const products = await Product.find(filter).limit(10);

        return products.map(product => ({
            id: product._id.toString(),
            title: product.title,
            price: product.price,
            category: product.category,
            image: product.image
        }));

    } catch (error) {
        console.error("Search products error:", error);
        throw error;
    }
}


async function getProduct(productId) {
    try {
        const product = await Product.findById(productId);

        if (!product) {
            return null;
        }

        return {
            id: product._id.toString(),
            title: product.title,
            price: product.price,
            category: product.category,
            image: product.image
        };

    } catch (error) {
        console.error("Get product error:", error);
        throw error;
    }
}


module.exports = {
    searchProducts,
    getProduct
};