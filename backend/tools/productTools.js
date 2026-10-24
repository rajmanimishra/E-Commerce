const Product = require("../productSchema/productSchema");

// Regex के स्पेशल कैरेक्टर्स को एस्केप करने के लिए हेल्पर
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

async function searchProducts({ query, maxPrice }) {
    try {
        const filter = {};

        // 1. सेफ और इंडेक्स-फ्रेंडली सर्च
        if (query && query.trim() !== "") {
            const cleanQuery = escapeRegex(query.trim());
            filter.title = {
                $regex: cleanQuery,
                $options: "i"
            };
        }

        // 2. प्राइस वैलिडेशन
        if (maxPrice !== undefined && maxPrice !== null && !isNaN(Number(maxPrice))) {
            filter.price = {
                $lte: Number(maxPrice)
            };
        }

        // 3. .select() से सिर्फ़ ज़रूरी फ़ील्ड्स लाएँ और .lean() से भारी Mongoose ओवरहेड हटाएँ
        const products = await Product.find(filter)
            .select("title price category image")
            .limit(10)
            .lean();

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
        // .select() और .lean() से सिंगल प्रोडक्ट फ़ेच 3x फ़ास्ट हो जाता है
        const product = await Product.findById(productId)
            .select("title price category image")
            .lean();

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