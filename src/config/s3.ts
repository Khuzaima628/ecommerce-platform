import { S3Client } from "@aws-sdk/client-s3";

// The connection to MinIO. We make it one time and use it everywhere.
const s3 = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY as string,
    secretAccessKey: process.env.MINIO_SECRET_KEY as string,
  },
  forcePathStyle: true, // MinIO needs this. AWS does not.
});

const BUCKET = process.env.MINIO_BUCKET as string;

export { s3, BUCKET };
