import express from "express";
import mysql from "mysql2/promise";
import multer from "multer";
import path from "path";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access token required" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user; // { id, email }
    next();
  });
}

// Setup file upload (optional)
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ----------------------
// Add new post
// ----------------------
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { user_id, title, description, post_date } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "user_trackingmoments",
    });

    const [result] = await db.execute(
      "INSERT INTO posts (user_id, title, description, image_url, post_date) VALUES (?, ?, ?, ?, ?)",
      [user_id, title, description, image_url, post_date]
    );

    // Fetch the newly created post
    const [newPost] = await db.execute(
      "SELECT * FROM posts WHERE id = ?",
      [result.insertId]
    );

    res.json({
      message: "Post created successfully!",
      post: newPost[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// ----------------------
// Get posts for a specific user
// ----------------------
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "user_trackingmoments",
    });

    const [rows] = await db.execute(
      "SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user posts" });
  }
});

// ----------------------
// Get single post by ID
// ----------------------
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "user_trackingmoments",
    });

    const [rows] = await db.execute("SELECT * FROM posts WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// ----------------------
// Update post by ID
// ----------------------
router.put("/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title, description, post_date } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "user_trackingmoments",
    });

    // First check if post exists
    const [existing] = await db.execute("SELECT * FROM posts WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Build query dynamically depending on whether image is uploaded
    let query = "UPDATE posts SET title = ?, description = ?, post_date = ?";
    let values = [title, description, post_date];

    if (image_url) {
      query += ", image_url = ?";
      values.push(image_url);
    }

    query += " WHERE id = ?";
    values.push(id);

    await db.execute(query, values);

    // Fetch updated post
    const [updated] = await db.execute("SELECT * FROM posts WHERE id = ?", [id]);

    res.json({
      message: "Post updated successfully!",
      post: updated[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update post" });
  }
});

// ----------------------
// Delete post by ID (only owner can delete)
// ----------------------
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // from JWT

  try {
    const db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "user_trackingmoments",
    });

    // Check if post exists and belongs to the user
    const [rows] = await db.execute("SELECT * FROM posts WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = rows[0];
    if (post.user_id !== userId) {
      return res.status(403).json({ error: "You are not allowed to delete this post" });
    }

    // Delete the post
    await db.execute("DELETE FROM posts WHERE id = ? AND user_id = ?", [id, userId]);

    res.json({ message: "Post deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;
