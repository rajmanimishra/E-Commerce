const express = require("express");

const router = express.Router();

const { chatWithAI } = require("../controllers/aiControllers");

// JWT authentication middleware
const authMiddleware = require("../middleware/authmiddleware");
router.post("/chat", authMiddleware, chatWithAI);

module.exports = router;