import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Optional AWS S3 storage path (doc tech stack: "AWS S3 — Receipt/file
// storage"). Only initialized if AWS_* env vars are present; otherwise
// receiptService falls back to the already-configured Cloudinary pipeline
// (utils/cloudinary.js) so the app runs out of the box without AWS creds.
export const isS3Configured = () =>
  Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET);

const getClient = () =>
  new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

export const uploadBufferToS3 = async (buffer, key, mimeType) => {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
};

export const deleteFromS3 = async (key) => {
  const client = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }));
};
