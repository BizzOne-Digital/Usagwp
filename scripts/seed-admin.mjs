/**
 * Creates or updates the first administrator account.
 *
 *   node scripts/seed-admin.mjs "you@example.com" "a-strong-password" "Your Name"
 *
 * Reads MONGODB_URI from the environment (or from .env.local if present).
 * Running it again for an existing address resets that account's password and
 * invalidates every session issued under the old one.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

function loadEnvFile(name) {
  try {
    const contents = readFileSync(resolve(process.cwd(), name), "utf8");
    for (const line of contents.split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const value = match[2].replace(/^["']|["']$/g, "");
      if (!process.env[match[1]]) process.env[match[1]] = value;
    }
  } catch {
    // No env file present. Environment variables may still be set directly.
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const [email, password, name = ""] = process.argv.slice(2);

if (!email || !password) {
  console.error('Usage: node scripts/seed-admin.mjs "email" "password" ["Name"]');
  process.exit(1);
}

if (password.length < 12) {
  console.error("Choose a password of at least 12 characters.");
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set.");
  process.exit(1);
}

const AdminUser =
  mongoose.models.AdminUser ??
  mongoose.model(
    "AdminUser",
    new mongoose.Schema(
      {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        name: { type: String, default: "" },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ["owner", "editor"], default: "editor" },
        lastLoginAt: { type: Date, default: null },
        tokenVersion: { type: Number, default: 0 },
      },
      { timestamps: true },
    ),
  );

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

const passwordHash = await bcrypt.hash(password, 12);
const normalised = email.toLowerCase().trim();
const existing = await AdminUser.findOne({ email: normalised });

if (existing) {
  existing.passwordHash = passwordHash;
  if (name) existing.name = name;
  // Bumping the version signs out every existing session for this account.
  existing.tokenVersion = (existing.tokenVersion ?? 0) + 1;
  await existing.save();
  console.log(`Updated the password for ${normalised}. Existing sessions are now signed out.`);
} else {
  await AdminUser.create({
    email: normalised,
    name,
    passwordHash,
    role: "owner",
  });
  console.log(`Created the administrator account ${normalised}.`);
}

await mongoose.disconnect();
