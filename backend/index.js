/* global process */
import "dotenv/config";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { requireAuth } from "./middleware/auth.js";
import Note from "./models/Note.js";
import User from "./models/User.js";

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;
const zeroKnowledgeMode = String(process.env.ZERO_KNOWLEDGE_MODE || "true") === "true";

if (!mongoUri) {
  console.error("Missing MONGODB_URI in environment");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET in environment");
  process.exit(1);
}

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "This username already exists. Please use another one." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });
    const token = jwt.sign({ userId: user._id.toString(), username: user.username }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({ token, user: { id: user._id, username: user.username } });
  } catch {
    return res.status(500).json({ message: "Failed to create account." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const token = jwt.sign({ userId: user._id.toString(), username: user.username }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({ token, user: { id: user._id, username: user.username } });
  } catch {
    return res.status(500).json({ message: "Login failed." });
  }
});

app.get("/api/notes", requireAuth, async (req, res) => {
  const notes = await Note.find({ userId: req.user.userId }).sort({ updatedAt: -1 }).limit(100);
  return res.json(notes);
});

app.post("/api/notes", requireAuth, async (req, res) => {
  const body = req.body || {};
  const title = String(body.title || "").trim() || "UNTITLED_NOTE";
  const content = String(body.content || "");
  const ciphertext = String(body.ciphertext || "");
  const iv = String(body.iv || "");
  const salt = String(body.salt || "");
  const kdf = String(body.kdf || "");
  const algo = String(body.algo || "");
  const version = Number.isFinite(Number(body.version)) ? Number(body.version) : 1;
  const type = body.type === "code" ? "code" : "text";
  const language = ["cpp", "c", "java", "python", "javascript"].includes(body.language) ? body.language : "cpp";

  if (content.length > 750000) {
    return res.status(400).json({ message: "Note is too large." });
  }
  if (zeroKnowledgeMode && (!ciphertext || !iv || !salt || !kdf || !algo)) {
    return res.status(400).json({ message: "Encrypted payload required in zero-knowledge mode." });
  }

  const note = await Note.create({
    userId: req.user.userId,
    title,
    content: zeroKnowledgeMode ? "" : content,
    ciphertext,
    iv,
    salt,
    kdf,
    algo,
    version,
    revision: 1,
    type,
    language,
  });

  return res.status(201).json(note);
});

app.put("/api/notes/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const body = req.body || {};
  const expectedRevision = Number(body.expectedRevision);

  if (!Number.isFinite(expectedRevision)) {
    return res.status(400).json({ message: "expectedRevision is required." });
  }

  const existing = await Note.findOne({ _id: id, userId: req.user.userId });
  if (!existing) {
    return res.status(404).json({ message: "Note not found." });
  }
  if (existing.revision !== expectedRevision) {
    return res.status(409).json({ message: "Conflict: note was updated elsewhere.", currentRevision: existing.revision });
  }

  const updates = {
    title: String(body.title || existing.title).trim() || "UNTITLED_NOTE",
    type: body.type === "code" ? "code" : "text",
    language: ["cpp", "c", "java", "python", "javascript"].includes(body.language) ? body.language : existing.language,
    revision: existing.revision + 1,
  };

  if (zeroKnowledgeMode) {
    const ciphertext = String(body.ciphertext || "");
    const iv = String(body.iv || "");
    const salt = String(body.salt || "");
    const kdf = String(body.kdf || "");
    const algo = String(body.algo || "");
    const version = Number.isFinite(Number(body.version)) ? Number(body.version) : existing.version || 1;

    if (!ciphertext || !iv || !salt || !kdf || !algo) {
      return res.status(400).json({ message: "Encrypted payload required in zero-knowledge mode." });
    }

    updates.content = "";
    updates.ciphertext = ciphertext;
    updates.iv = iv;
    updates.salt = salt;
    updates.kdf = kdf;
    updates.algo = algo;
    updates.version = version;
  } else {
    updates.content = String(body.content || "");
  }

  const updated = await Note.findOneAndUpdate(
    { _id: id, userId: req.user.userId, revision: expectedRevision },
    updates,
    { new: true }
  );

  if (!updated) {
    return res.status(409).json({ message: "Conflict: note was updated elsewhere." });
  }

  return res.json(updated);
});

app.post("/api/run", requireAuth, async (req, res) => {
  const body = req.body || {};
  const language = String(body.language || "");
  const code = String(body.code || "");
  const stdin = String(body.stdin || "");
  const supported = ["cpp", "c", "java", "python", "javascript"];
  if (!supported.includes(language)) {
    return res.status(400).json({ message: "Unsupported language." });
  }

  async function runCommand(command, args, options = {}) {
    return await new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd: options.cwd,
        stdio: "pipe",
        shell: false,
      });

      let stdout = "";
      let stderr = "";
      let done = false;

      const timeoutMs = options.timeoutMs ?? 8000;
      const timer = setTimeout(() => {
        if (!done) {
          child.kill("SIGKILL");
          reject(new Error(`Process timeout (${timeoutMs}ms)`));
        }
      }, timeoutMs);

      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      child.on("error", (error) => {
        clearTimeout(timer);
        done = true;
        reject(error);
      });

      child.on("close", (code) => {
        clearTimeout(timer);
        done = true;
        resolve({ code: code ?? 1, stdout, stderr });
      });

      if (options.stdin) {
        child.stdin.write(options.stdin);
      }
      child.stdin.end();
    });
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "vault-run-"));

  try {
    let stdout = "";
    let stderr = "";
    let compileOutput = "";
    let compileError = "";
    let exitCode = 0;

    if (language === "javascript") {
      const file = path.join(tempDir, "main.js");
      await fs.writeFile(file, code, "utf8");
      const result = await runCommand("node", [file], { stdin });
      stdout = result.stdout;
      stderr = result.stderr;
      exitCode = result.code;
    }

    if (language === "python") {
      const file = path.join(tempDir, "main.py");
      await fs.writeFile(file, code, "utf8");
      const result = await runCommand("python", [file], { stdin });
      stdout = result.stdout;
      stderr = result.stderr;
      exitCode = result.code;
    }

    if (language === "cpp" || language === "c") {
      const ext = language === "cpp" ? "cpp" : "c";
      const srcFile = path.join(tempDir, `main.${ext}`);
      const outFile = path.join(tempDir, process.platform === "win32" ? "main.exe" : "main.out");
      await fs.writeFile(srcFile, code, "utf8");

      const compiler = language === "cpp" ? "g++" : "gcc";
      const compiled = await runCommand(compiler, [srcFile, "-O2", "-std=c++17", "-o", outFile]);
      compileOutput = compiled.stdout;
      compileError = compiled.stderr;
      if (compiled.code !== 0) {
        exitCode = compiled.code;
      } else {
        const executed = await runCommand(outFile, [], { stdin, cwd: tempDir });
        stdout = executed.stdout;
        stderr = executed.stderr;
        exitCode = executed.code;
      }
    }

    if (language === "java") {
      const srcFile = path.join(tempDir, "Main.java");
      await fs.writeFile(srcFile, code, "utf8");
      const compiled = await runCommand("javac", [srcFile], { cwd: tempDir });
      compileOutput = compiled.stdout;
      compileError = compiled.stderr;
      if (compiled.code !== 0) {
        exitCode = compiled.code;
      } else {
        const executed = await runCommand("java", ["Main"], { stdin, cwd: tempDir });
        stdout = executed.stdout;
        stderr = executed.stderr;
        exitCode = executed.code;
      }
    }

    return res.json({
      stdout,
      stderr,
      compileOutput,
      compileError,
      exitCode,
      raw: { localRunner: true, language },
    });
  } catch (error) {
    return res.status(502).json({
      message:
        `Local runner failed: ${error?.message || "unknown error"}. ` +
        "Make sure required runtime/compiler is installed (node/python/g++/gcc/jdk).",
    });
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

app.delete("/api/notes/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const deleted = await Note.findOneAndDelete({ _id: id, userId: req.user.userId });

  if (!deleted) {
    return res.status(404).json({ message: "Note not found." });
  }

  return res.json({ ok: true });
});

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`API running on http://localhost:${port}`);
    });
  })
  .catch(() => {
    console.error("Failed to connect to MongoDB");
    process.exit(1);
  });
