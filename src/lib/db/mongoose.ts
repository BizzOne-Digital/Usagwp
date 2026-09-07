import mongoose from "mongoose";

/**
 * Serverless-safe connection cache. On Vercel each warm lambda reuses the same
 * module scope, so we memoise the promise rather than reconnecting per request.
 */
declare global {
  var __usagwpMongoose:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

const cached = globalThis.__usagwpMongoose ?? { conn: null, promise: null };
globalThis.__usagwpMongoose = cached;

export class DatabaseUnavailableError extends Error {
  constructor(message = "The database is not reachable.") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new DatabaseUnavailableError(
      "MONGODB_URI is not set. Add it to your environment before using the CMS.",
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
      })
      .catch((error) => {
        // Clear the memo so a later request can retry instead of latching a
        // permanently rejected promise.
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Read path helper for public pages: never let a database outage take down the
 * marketing site. Returns the fallback and logs server-side instead.
 */
export async function safeQuery<T>(
  label: string,
  run: () => Promise<T>,
  fallback: T,
): Promise<T> {
  if (!isDatabaseConfigured()) return fallback;
  try {
    await connectToDatabase();
    return await run();
  } catch (error) {
    console.error(`[usagwp] query failed: ${label}`, error);
    return fallback;
  }
}
