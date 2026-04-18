

import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import fetch from "node-fetch";
import Redis from "ioredis";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { body, validationResult } from "express-validator";
import crypto from "crypto";
import csurf from "csurf";

dotenv.config();
const app = express();
const redis = new Redis(process.env.REDIS_URL);
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// CORS: restrict to your real domain
app.use(
  cors({
    origin: ["http://localhost:5173", "https://www.thinkercaregroup.com"],
    credentials: true,
  })
);

// Global rate limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);

// CSRF protection using cookie
const csrfMiddleware = csurf({ cookie: true });
app.use(csrfMiddleware);

// helper
function makeSessionId() {
  return crypto.randomBytes(24).toString("hex");
}

// expose csrf token for frontend
app.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.post(
  "/auth",
  body("passphrase").trim().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { passphrase } = req.body;
    if (passphrase !== process.env.TOKEN) {
      return res.status(401).json({ success: false, error: "Invalid passphrase" });
    }

    const sessionId = makeSessionId();
    const key = `session:${sessionId}`;

    // store remaining submits as hash field with TTL
    await redis.hset(key, "remaining", 3);
    await redis.expire(key, 24 * 3600);

    // signed cookie
    res.cookie("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 3600 * 1000,
      signed: true,
    });

    return res.json({ success: true, message: "Access granted", remaining: 3 });
  }
);

app.post(
  "/submit",
  body("fullname").trim().isLength({ min: 1 }),
  body("email").isEmail(),
  body("phone").trim().isLength({ min: 3 }),
  body("message").trim().isLength({ min: 1, max: 200 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const sessionId = req.signedCookies?.session_id;
      if (!sessionId) return res.status(401).json({ success: false, error: "No session. Please authenticate." });

      const key = `session:${sessionId}`;
      const session = await redis.hgetall(key);
      if (!session || Object.keys(session).length === 0) {
        return res.status(401).json({ success: false, error: "Session expired or invalid." });
      }

      const remaining = parseInt(session.remaining || "0", 10);
      if (remaining <= 0) {
        return res.status(403).json({ success: false, error: "You reached the 3-message limit." });
      }

      const { fullname, email, phone, message } = req.body;
      const phoneForSheet = phone.startsWith("'") ? phone : `'${phone}`;

      const sheetRes = await fetch(process.env.SHEETDB_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "AetherSecureForm/1.0"
        },
        body: JSON.stringify({
          data: [{ fullname, email, phone: phoneForSheet, message }],
        }),
      });

      if (!sheetRes.ok) {
        console.error("SheetDB error:", await sheetRes.text());
        return res.status(500).json({ success: false, error: "Failed to save data." });
      }

      await redis.hincrby(key, "remaining", -1);
      const newRemaining = Math.max(0, remaining - 1);

      const logKey = `submissions:${new Date().toISOString().slice(0,10)}`;
      await redis.lpush(logKey, JSON.stringify({ at: Date.now(), ip: req.ip, fullname, email }));
      await redis.expire(logKey, 30 * 24 * 3600);

      return res.json({ success: true, message: "Message sent", remaining: newRemaining });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "Server error." });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});