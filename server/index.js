import express from "express";
import mysql from "mysql2";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.js";
import postsRoutes from "./routes/posts.js";
import favoritesRoutes from "./routes/favorites.js";
// 1️⃣ Load environment variables
dotenv.config();

// 2️⃣ Initialize Express app
const app = express();

// 3️⃣ Middleware
app.use(express.json());
// Configure CORS with specific options
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Serve static files from uploads directory
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4️⃣ Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/favorites", favoritesRoutes);
// 5️⃣ DB connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "user_trackingmoments",
});

// Test DB connection
db.connect((err) => {
    if (err) {
        console.error("DB connection failed:", err.message);
    } else {
        console.log("✅ Connected to MySQL Database");
    }
});

// 6️⃣ Simple route
app.get("/", (req, res) => {
    res.send("Server is running 🚀");
});

// 7️⃣ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
