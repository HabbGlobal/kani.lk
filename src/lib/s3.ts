import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

/**
 * HABB self-hosted S3-compatible storage (SeaweedFS). Every kani.lk photo lives
 * under the KEY_PREFIX "folder" of the shared bucket, so it never mixes with
 * other projects' files.
 */
export const KEY_PREFIX = "kani.lk";

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true, // required for SeaweedFS / non-AWS S3 servers
});

/** Object key for a stored photo: kani.lk/<imageId>.webp */
export function imageKey(id: string | { toString(): string }): string {
  return `${KEY_PREFIX}/${String(id)}.webp`;
}

/** Public URL of an object — the bucket is public-read. */
export function publicUrl(key: string): string {
  return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`;
}

export async function uploadObject(key: string, body: Buffer, contentType: string) {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return publicUrl(key);
}

export async function deleteObject(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
}

/** Delete many objects (S3 caps a single request at 1000 keys). */
export async function deleteObjects(keys: string[]) {
  for (let i = 0; i < keys.length; i += 1000) {
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: process.env.S3_BUCKET,
        Delete: { Objects: keys.slice(i, i + 1000).map((Key) => ({ Key })), Quiet: true },
      })
    );
  }
}
