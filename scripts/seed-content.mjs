/**
 * Creates the initial Book record and site settings from the material the
 * client supplied, so the CMS opens with real, editable content instead of an
 * empty form.
 *
 *   node scripts/seed-content.mjs
 *
 * Safe to run more than once: existing records are left untouched unless you
 * pass --force, which overwrites them.
 *
 * Nothing here is invented. The summary is the client's own text, the status is
 * "coming-soon" because the book is still at the printer, and no cover, price,
 * ISBN or publication date is set, because none has been provided.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import mongoose from "mongoose";

function loadEnvFile(name) {
  try {
    for (const line of readFileSync(resolve(process.cwd(), name), "utf8").split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      if (!process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    // No env file present; variables may already be set in the environment.
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set.");
  process.exit(1);
}

const force = process.argv.includes("--force");

const BOOK = {
  slug: "one-thread-in-the-fabric-of-freedom",
  title: "One Thread in the Fabric of Freedom",
  subtitle: "The true story of Reverend Edmond Kelly",
  author: "Peter Douet",
  description:
    "The true story of Reverend Edmond Kelly, born into slavery in Columbia, Tennessee, in 1817, who taught himself to read in secret and spent years preaching across America, England and Ireland to buy his family out of bondage.",
  longDescription: [
    "One Thread in the Fabric of Freedom by Peter Douet is a biographical and historical narrative tracing the true story of Reverend Edmond Kelly, the author's ancestor, who was born into slavery in Columbia, Tennessee, in 1817.",
    "The book follows his remarkable journey as he secretly teaches himself to read, becomes the first Black man ordained as a Baptist minister in Tennessee, and, after fleeing bondage, spends years preaching across America, England, and Ireland to raise the $2,800 needed to purchase the freedom of his wife and children, which he ultimately achieves.",
    "Blending faith, courage, and the fight for equality, the book recounts his meetings with Abraham Lincoln, his ministry to escaped slaves during the Civil War, his founding of numerous churches, and his lifelong dedication to freedom and the Gospel, preserving a family legacy of perseverance and triumph over slavery.",
  ].join("\n\n"),
  coverImage: "",
  publicationStatus: "coming-soon",
  publicationDate: null,
  isbn: "",
  price: null,
  currency: "USD",
  featured: true,
};

const SETTINGS = {
  key: "site",
  siteName: "Edmond Kelly",
  tagline: "One Thread in the Fabric of Freedom",
  siteDescription:
    "Edmond Kelly preserves and shares the true story of Reverend Edmond Kelly, set down by Peter Douet in the forthcoming book One Thread in the Fabric of Freedom, continuing the work of his late wife LaTanya D. Kelly-Douet, Edmond Kelly's descendant.",
  email: "support@usagwp.com",
  phone: "9165009232",
  socialLinks: [],
};

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
const db = mongoose.connection.db;
const now = new Date();

async function upsert(collection, filter, doc) {
  const existing = await db.collection(collection).findOne(filter);
  if (existing && !force) {
    console.log(`${collection}: already present, left unchanged (use --force to overwrite)`);
    return;
  }
  await db
    .collection(collection)
    .updateOne(filter, { $set: { ...doc, updatedAt: now }, $setOnInsert: { createdAt: now } }, { upsert: true });
  console.log(`${collection}: ${existing ? "overwritten" : "created"}`);
}

await upsert("books", { slug: BOOK.slug }, BOOK);
await upsert("sitesettings", { key: "site" }, SETTINGS);

console.log("\nNext: sign in at /admin and upload the cover on the Book screen.");
await mongoose.disconnect();
