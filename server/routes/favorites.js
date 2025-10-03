import express from "express";
import mysql from "mysql2/promise";
import { authenticateToken } from "./auth.js"; // your JWT middleware

const router = express.Router();

// DB connection
const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "user_trackingmoments",
};

// Add to favorites
router.post("/:postId", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { postId } = req.params;

    try {
        const db = await mysql.createConnection(dbConfig);
        await db.execute(
            "INSERT IGNORE INTO favorites (user_id, post_id) VALUES (?, ?)",
            [userId, postId]
        );
        res.json({ message: "Post added to favorites!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add to favorites" });
    }
});

// Remove from favorites
router.delete("/:postId", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { postId } = req.params;

    try {
        const db = await mysql.createConnection(dbConfig);
        await db.execute("DELETE FROM favorites WHERE user_id = ? AND post_id = ?", [
            userId,
            postId,
        ]);
        res.json({ message: "Post removed from favorites!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to remove from favorites" });
    }
});

// Get all favorites of the logged-in user
router.get("/", authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const db = await mysql.createConnection(dbConfig);
        const [favorites] = await db.execute(
            `SELECT p.*
       FROM posts p
       INNER JOIN favorites f ON p.id = f.post_id
       WHERE f.user_id = ? AND p.deleted_at IS NULL
       ORDER BY f.created_at DESC`,
            [userId]
        );

        res.json(favorites);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch favorites" });
    }
});

export default router;
