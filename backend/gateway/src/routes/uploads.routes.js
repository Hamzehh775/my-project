import express from "express";
import multer from "multer";
import { v4 as uuid } from "uuid";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../lib/s3.js";

const router = express.Router();

// store files in memory temporarily
const upload = multer({ storage: multer.memoryStorage() });

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

// GET /uploads/s3-get?key=posts/xxx.jpg  -> { url }
router.get("/s3-get", async (req, res) => {
  try {
    const key = String(req.query.key || "");
    if (!key || !key.startsWith("posts/")) {
      return res.status(400).json({ message: "Bad key" });
    }
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: key }),
      { expiresIn: 300 }
    );
    res.json({ url, expiresIn: 300 });
  } catch (err) {
    console.error("s3-get error:", err);
    res.status(500).json({ message: "Failed to sign GET" });
  }
});

// POST /uploads/image  (form-data field: image) -> { key }
router.post("/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    if (!ALLOWED.has(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type" });
    }

    const ext = req.file.mimetype.split("/")[1] || "bin";
    const key = `posts/${uuid()}.${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    res.json({ key });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

export default router;
