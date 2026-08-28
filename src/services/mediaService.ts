import {
  PutObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CopyObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, BUCKET } from "@src/config/s3";
import type { presignedUrlType } from "@src/types/mediaTypes";

const EXPIRES_IN = 300;

export const presignedUrlService = async (body: presignedUrlType) => {
  const key = `${body.folder}/${Date.now()}-${body.fileName}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: body.fileType,
    ContentLength: body.fileSize,
  });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: EXPIRES_IN });
  const fileUrl = `${process.env.MINIO_ENDPOINT}/${BUCKET}/${key}`;
  // const check = await s3.send(
  //   new ListObjectsV2Command({
  //     Bucket: BUCKET,
  //     Prefix: "product/",
  //     MaxKeys: 5,
  //   }),
  // );
  // const size = await s3.send(
  //   new HeadObjectCommand({
  //     Bucket: BUCKET,
  //     Key: "profile/1787597566594-a.png",
  //   }),
  // );
  // const oldKey = "profile/1787597566594-a.png";
  // const newKey = "profile/avatar.png";
  // const prefix = "product/muhammad/";
  // const newKeyFun = await s3.send(
  //   new CopyObjectCommand({
  //     Bucket: BUCKET,
  //     Key: key,
  //     CopySource: `${BUCKET}/${oldKey}`,
  //   }),
  // );
  // // 1. find every file inside that folder
  // const list = await s3.send(
  //   new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix }),
  // );

  // // 2. delete them all together
  // const deleteFun = await s3.send(
  //   new DeleteObjectsCommand({
  //     Bucket: BUCKET,
  //     Delete: {
  //       Objects: (list.Contents ?? []).map((file) => ({ Key: file.Key })),
  //     },
  //   }),
  // );
  // // console.log("Bucket Checks".bgBrightWhite,check)
  // console.log("Bucket Checks".bgBrightWhite, deleteFun);
  // // console.log("Bucket Checks".bgBrightWhite,newKeyFun)
  // // console.log("Bucket Size Checks".bgBrightWhite,size.ContentLength)
  return { uploadUrl, fileUrl };
};
