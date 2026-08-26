const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);



const connectDB = require("./db/db");
const Product = require("./productSchema/productSchema");


dotenv.config();

const products = [
    {
        title: "Banana",
        price: 40,
        image: "banana.png",
        category: "Fruits",
    },
    {
        title: "Tofu",
        price: 120,
        image: "tofu.png",
        category: "Dairy",
    },
    {
        title: "Yogurt",
        price: 60,
        image: "yogurt.png",
        category: "Dairy",
    },
    {
        title: "Slice Cheese",
        price: 150,
        image: "slice_cheese.png",
        category: "Dairy",
    },
    {
        title: "Shrimp",
        price: 450,
        image: "shrimp.png",
        category: "Seafood",
    },
    {
        title: "Salmon",
        price: 700,
        image: "salmon.png",
        category: "Seafood",
    },
    {
        title: "Ricotta Cheese",
        price: 250,
        image: "ricottacheese.png",
        category: "Dairy",
    },
    {
        title: "Pineapple",
        price: 80,
        image: "pineapple.png",
        category: "Fruits",
    },
    {
        title: "Milk",
        price: 60,
        image: "milk.png",
        category: "Dairy",
    },
    {
        title: "Lettuce",
        price: 40,
        image: "lettuce.png",
        category: "Vegetables",
    },
    {
        title: "Kiwi",
        price: 100,
        image: "kiwi.png",
        category: "Fruits",
    },
    {
        title: "Grapes",
        price: 90,
        image: "grapes.png",
        category: "Fruits",
    },
    {
        title: "Eggs",
        price: 80,
        image: "eggs.png",
        category: "Dairy",
    },
    {
        title: "Eggplant",
        price: 50,
        image: "eggplant.png",
        category: "Vegetables",
    },
    {
        title: "Cheese",
        price: 200,
        image: "cheese.png",
        category: "Dairy",
    },
    {
        title: "Capsicum",
        price: 60,
        image: "capsicum.png",
        category: "Vegetables",
    },
    {
        title: "Cabbage",
        price: 40,
        image: "cabbage.png",
        category: "Vegetables",
    },
    {
        title: "Butter",
        price: 100,
        image: "butter.png",
        category: "Dairy",
    },
    {
        title: "Broccoli",
        price: 70,
        image: "broccoli.png",
        category: "Vegetables",
    },
    {
        title: "Beef",
        price: 500,
        image: "beef.png",
        category: "Meat",
    },
];

const seedProducts = async () => {
    try {
        await connectDB();
        console.log("Database connected");

        await Product.deleteMany();

        await Product.insertMany(products);

        console.log("Products inserted successfully");

        await mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

seedProducts();
