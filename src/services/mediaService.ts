import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, BUCKET, PUBLIC_BUCKET } from "@src/config/s3";
import AppError from "@src/utils/appError";
import { folders, type folderType } from "@src/types/mediaTypes";

// Which bucket each folder goes to.
const bucketOf = (folder: folderType): string =>
  folder === "profile" ? BUCKET : PUBLIC_BUCKET;

// Put ONE file into MinIO and give back its address.
const uploadOne = async (
  file: Express.Multer.File,
  folder: folderType,
): Promise<string> => {
  const bucket = bucketOf(folder);

  const key = `${folder}/${Date.now()}-${file.originalname}-${file.stream}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );
  const url= `${process.env.MINIO_ENDPOINT}/${bucket}/${key}`

  console.log("+__+__+__+__+".bgBrightMagenta,url)
  return url ;
};

// Take the files our server received and put them ALL into MinIO.
export const uploadFileService = async (
  files?: Express.Multer.File[],
  folder = "profile",
) => {
  if (!files || files.length === 0) {
    throw new AppError(400, "file is required");
  }

  if (!folders.includes(folder as folderType)) {
    throw new AppError(400, `folder must be one of [${folders}]`);
  }

  // Upload them at the same time, not one after another
  const fileUrls = await Promise.all(
    files.map((file) => uploadOne(file, folder as folderType)),
  );
  console.log("+__+__+__+__+".bgBrightMagenta,fileUrls)

  return { fileUrls };
};
