import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, BUCKET } from "@src/config/s3";
import type { presignedUrlType } from "@src/types/mediaTypes";

// Make a ticket that lets the frontend upload one file, for 5 minutes.
export const presignedUrlService = async (body: presignedUrlType) => {
  // A unique name, so two users never overwrite each other
  const key = `${Date.now()}-${body.fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: body.fileType,
  });

  // uploadUrl = where the frontend sends the file
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  // fileUrl = the final address of the file after upload
  const fileUrl = `${process.env.MINIO_ENDPOINT}/${BUCKET}/${key}`;

  return { uploadUrl, fileUrl };
};
