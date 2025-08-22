import "dotenv/config";
import { S3Client } from "@aws-sdk/client-s3";

// Read envs once into a plain object (avoids TDZ issues)
const env = {
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  AWS_S3_ENDPOINT: process.env.AWS_S3_ENDPOINT,
  AWS_S3_FORCE_PATH_STYLE: process.env.AWS_S3_FORCE_PATH_STYLE,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
};

// Helpful masked debug on startup
console.log("S3 INIT", {
  REGION: env.AWS_REGION,
  ENDPOINT: env.AWS_S3_ENDPOINT,
  FORCE_PATH_STYLE: env.AWS_S3_FORCE_PATH_STYLE,
  BUCKET: env.S3_BUCKET_NAME,
  ACCESS_KEY: env.AWS_ACCESS_KEY_ID ? "***" : "(missing)",
  SECRET: env.AWS_SECRET_ACCESS_KEY ? "***" : "(missing)",
});

// Hard fail early if required vars are missing
if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.S3_BUCKET_NAME || !env.AWS_S3_ENDPOINT) {
  throw new Error("S3 credentials/config missing. Check backend/gateway/.env");
}

export const s3 = new S3Client({
  region: env.AWS_REGION,
  endpoint: env.AWS_S3_ENDPOINT,                     // e.g. http://localhost:9000
  forcePathStyle: String(env.AWS_S3_FORCE_PATH_STYLE) === "true", // required for MinIO
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});
