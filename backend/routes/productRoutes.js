const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const { Readable } = require("stream");

const Product = require("../productSchema/productSchema");
const authMiddleware = require("../middleware/authmiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const imageTypes = {
    "image/jpeg": {
        extension: "jpg",
        matches: (buffer) => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
    },
    "image/png": {
        extension: "png",
        matches: (buffer) =>
            buffer.length >= 8 &&
            buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    },
    "image/webp": {
        extension: "webp",
        matches: (buffer) =>
            buffer.length >= 12 &&
            buffer.toString("ascii", 0, 4) === "RIFF" &&
            buffer.toString("ascii", 8, 12) === "WEBP",
    },
};

const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
    fileFilter: (req, file, callback) => {
        if (!imageTypes[file.mimetype]) {
            return callback(new Error("Choose a JPG, PNG, or WebP image."));
        }
        callback(null, true);
    },
}).single("imageFile");

function receiveProductImage(req, res, next) {
    imageUpload(req, res, (error) => {
        if (!error) return next();

        const message = error.code === "LIMIT_FILE_SIZE"
            ? "Images must be 5 MB or smaller."
            : error.code === "LIMIT_UNEXPECTED_FILE"
                ? "Upload one image at a time."
                : error.message || "Unable to read the uploaded image.";

        return res.status(400).json({ success: false, message });
    });
}

function getImageBucket() {
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
        throw new Error("Database is not connected.");
    }
    return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: "productImages",
    });
}

async function storeImage(file) {
    const imageType = imageTypes[file.mimetype];
    if (!imageType.matches(file.buffer)) {
        const error = new Error("The selected file is not a valid image.");
        error.statusCode = 400;
        throw error;
    }

    const bucket = getImageBucket();
    const uploadStream = bucket.openUploadStream(
        `product-${Date.now()}.${imageType.extension}`,
        { metadata: { contentType: file.mimetype } }
    );

    await new Promise((resolve, reject) => {
        uploadStream.once("error", reject);
        uploadStream.once("finish", resolve);
        Readable.from(file.buffer).pipe(uploadStream);
    });

    return uploadStream.id;
}

// URL से GridFS Image ID निकालकर डिलीट करने वाला सेफ हेल्पर
async function removeStoredImage(imageIdentifier) {
    if (!imageIdentifier) return;
    try {
        let imageId = imageIdentifier;
        if (typeof imageIdentifier === "string" && imageIdentifier.includes("/api/products/images/")) {
            imageId = imageIdentifier.split("/api/products/images/")[1];
        }

        if (mongoose.Types.ObjectId.isValid(imageId)) {
            await getImageBucket().delete(new mongoose.Types.ObjectId(imageId));
        }
    } catch (error) {
        console.error("Unable to clean up product image:", error.message);
    }
}

function isValidPrice(price) {
    return (
        (typeof price === "number" || (typeof price === "string" && price.trim() !== "")) &&
        Number.isFinite(Number(price)) &&
        Number(price) >= 0
    );
}

// GET - Get all products (⚡ Optimized with .lean() and selective fields)
router.get("/", async (req, res) => {
    try {
        const products = await Product.find()
            .select("title price image category")
            .lean();

        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        console.error("Get Products Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
});

// GET - Serve a stored product image (GridFS)
router.get("/images/:id", async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid image ID." });
    }

    try {
        const bucket = getImageBucket();
        const files = await bucket.find({ _id: new mongoose.Types.ObjectId(id) }).toArray();
        const file = files[0];

        if (!file) {
            return res.status(404).json({ success: false, message: "Image not found." });
        }

        res.set({
            "Content-Type": file.metadata?.contentType || "application/octet-stream",
            "Content-Length": file.length,
            "Content-Disposition": "inline",
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
        });

        const downloadStream = bucket.openDownloadStream(file._id);
        downloadStream.on("error", (error) => {
            console.error("Read Product Image Error:", error);
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: "Unable to load product image." });
            } else {
                res.destroy(error);
            }
        });
        downloadStream.pipe(res);
    } catch (error) {
        console.error("Get Product Image Error:", error);
        res.status(500).json({ success: false, message: "Unable to load product image." });
    }
});

// POST - Add a new product
router.post("/", authMiddleware, adminMiddleware, receiveProductImage, async (req, res) => {
    let storedImageId;

    try {
        const { title, price, image, category } = req.body;

        if (
            typeof title !== "string" || !title.trim() ||
            (!req.file && (typeof image !== "string" || !image.trim())) ||
            typeof category !== "string" || !category.trim() ||
            !isValidPrice(price)
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter a title, valid price, image, and category.",
            });
        }

        const imagePath = req.file
            ? `/api/products/images/${(storedImageId = await storeImage(req.file))}`
            : image.trim();

        const product = await Product.create({
            title: title.trim(),
            price: Number(price),
            image: imagePath,
            category: category.trim(),
        });

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product,
        });
    } catch (error) {
        await removeStoredImage(storedImageId);
        console.error("Add Product Error:", error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : "Failed to add product",
        });
    }
});

// PUT - Update a product (⚡ Cleans old image if replaced)
router.put("/:id", authMiddleware, adminMiddleware, receiveProductImage, async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid product ID." });
    }

    let storedImageId;

    try {
        const { title, price, image, category } = req.body;

        if (
            typeof title !== "string" || !title.trim() ||
            (!req.file && (typeof image !== "string" || !image.trim())) ||
            typeof category !== "string" || !category.trim() ||
            !isValidPrice(price)
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter a title, valid price, image, and category.",
            });
        }

        const existingProduct = await Product.findById(id).select("image").lean();
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        const imagePath = req.file
            ? `/api/products/images/${(storedImageId = await storeImage(req.file))}`
            : image.trim();

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                $set: {
                    title: title.trim(),
                    price: Number(price),
                    image: imagePath,
                    category: category.trim(),
                }
            },
            { new: true, runValidators: true }
        ).lean();

        // अगर नई इमेज अपलोड हुई है तो पुरानी GridFS इमेज को डिलीट करें
        if (req.file && existingProduct.image && existingProduct.image !== imagePath) {
            await removeStoredImage(existingProduct.image);
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully.",
            product: updatedProduct,
        });
    } catch (error) {
        await removeStoredImage(storedImageId);
        console.error("Update Product Error:", error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : "Failed to update product.",
        });
    }
});

// DELETE - Remove a product (⚡ Cleans associated GridFS image)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid product ID." });
    }

    try {
        const product = await Product.findByIdAndDelete(id).lean();

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        // प्रोडक्ट हटने के बाद उसकी GridFS इमेज को भी डिलीट करें
        if (product.image) {
            await removeStoredImage(product.image);
        }

        res.status(200).json({
            success: true,
            message: "Product removed successfully.",
        });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to remove product.",
        });
    }
});

module.exports = router;