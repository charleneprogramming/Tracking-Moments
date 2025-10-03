import express from "express";
import mysql from "mysql2/promise";
import multer from "multer";
import path from "path";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  try {
    // Log incoming headers for debugging
    console.log('Headers:', req.headers);

    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    console.log('Auth header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No token found in header');
      return res.status(401).json({ message: "Access token required" });
    }

    const token = authHeader.split(' ')[1];
    console.log('Extracted token:', token ? 'Token exists' : 'No token');

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set');
      return res.status(500).json({ message: "Server configuration error" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('JWT verification error:', err);
        return res.status(403).json({ message: "Invalid or expired token" });
      }
      console.log('Decoded user:', user);
      req.user = user; // { id, email }
      next();
    });
  } catch (error) {
    console.error('Error in authenticateToken:', error);
    res.status(500).json({ message: "Authentication error" });
  }
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
// Get active posts for a specific user (excludes archived posts by default)
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const { showArchived } = req.query; // Optional query parameter to show archived posts

  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      ...(process.env.DB_PASS && { password: process.env.DB_PASS }),
      database: process.env.DB_NAME || "user_trackingmoments"
    });

    let query = "SELECT * FROM posts WHERE user_id = ?";
    const params = [userId];

    // Only include the is_archived condition if showArchived is not true
    if (showArchived !== 'true') {
      query += " AND (is_archived IS NULL OR is_archived = 0)";
    }

    query += " ORDER BY post_date DESC";

    const [posts] = await db.execute(query, params);
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch posts" });
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

// DELETE /api/posts/:id → permanently delete a note
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

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

    const post = rows[0];
    console.log("Delete attempt → post.user_id:", post.user_id, "token.userId:", userId);

    if (parseInt(post.user_id) !== parseInt(userId)) {
      return res.status(403).json({ error: "You are not allowed to delete this post" });
    }

    await db.execute("DELETE FROM posts WHERE id = ? AND user_id = ?", [id, userId]);
    res.json({ message: "Post permanently deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete post" });
  }
});


// PATCH /api/posts/:id  → archive a post
router.patch("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { is_archived } = req.body;

  try {
    const db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "user_trackingmoments",
    });

    // check ownership
    const [rows] = await db.execute("SELECT * FROM posts WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = rows[0];
    if (parseInt(post.user_id) !== parseInt(userId)) {
      return res.status(403).json({ error: "You are not allowed to archive this post" });
    }

    // update archive flag
    await db.execute("UPDATE posts SET is_archived = ? WHERE id = ? AND user_id = ?", [
      is_archived,
      id,
      userId,
    ]);

    res.json({ message: "Post archived successfully!" });
  } catch (err) {
    console.error("Archive error:", err);
    res.status(500).json({ error: "Failed to archive post" });
  }
});


// ----------------------
// Get archived posts for a specific user
// ----------------------
router.get("/user/:userId/archived", authenticateToken, async (req, res) => {
  const { userId } = req.params;

  // Verify that the authenticated user is requesting their own data
  if (parseInt(userId) !== parseInt(req.user.id)) {
    return res.status(403).json({ error: "You are not authorized to view these posts" });
  }

  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      ...(process.env.DB_PASS && { password: process.env.DB_PASS }),
      database: process.env.DB_NAME || "user_trackingmoments"
    });

    const [posts] = await db.execute(
      "SELECT * FROM posts WHERE user_id = ? AND is_archived = TRUE ORDER BY post_date DESC",
      [userId]
    );

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch archived posts" });
  }
});

// ----------------------
// Restore an archived post
// ----------------------
router.patch("/:id/restore", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // from JWT

  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      ...(process.env.DB_PASS && { password: process.env.DB_PASS }),
      database: process.env.DB_NAME || "user_trackingmoments"
    });

    // Check if post exists, is archived, and belongs to the user
    const [rows] = await db.execute(
      "SELECT * FROM posts WHERE id = ? AND user_id = ? AND is_archived = TRUE",
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Archived post not found or you don't have permission" });
    }

    // Restore the post by setting is_archived to FALSE
    await db.execute(
      "UPDATE posts SET is_archived = FALSE WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    res.json({ message: "Post restored successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to restore post" });
  }
});

// ----------------------
// Permanently delete a post (for admin/archive cleanup)

export default router;
