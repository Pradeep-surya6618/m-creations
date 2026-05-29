import { MongoClient, type Db } from "mongodb";

// Cache the client promise across HMR reloads in dev so we don't exhaust
// the Atlas connection pool. In prod a single module instance is reused.
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

// Lazy: the env check + connection happen on first getDb() call, NOT at
// module import. This lets the app build, type-check, and start the dev
// server without MONGODB_URI present — only an actual DB operation requires
// it. Avoids build-time crashes when env vars aren't set yet.
function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local.");
  }
  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = new MongoClient(uri).connect();
  }
  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB ?? "maria_creations");
}
