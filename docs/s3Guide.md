# S3 / MinIO — Easy Guide

Written in simple English, for this project. S3 is Amazon's file storage.
MinIO is the same thing you can run on your own computer — **same commands**,
so everything here works for both.

---

## 1. The 3 words you must know

| Word | Simple meaning | Real life |
|---|---|---|
| **Bucket** | a big box that holds files | a drawer |
| **Key** | the full name of one file | the label on the paper |
| **Object** | the file itself | the paper |

```
Bucket: e-commerce
Key:    profile/1787-cat.png
```

Together they make the address:

```
http://127.0.0.1:9000/e-commerce/profile/1787-cat.png
                      └─bucket──┘└──────key───────┘
```

---

## 2. Folders are FAKE 📁❌

This is the thing most beginners get wrong.

S3 has **no folders**. `profile/cat.png` is just a **file name that contains a
slash**. The console draws it like a folder to be nice.

```ts
const key = `${folder}/${Date.now()}-${fileName}`;
// "profile/1787-cat.png"
```

What this means:

- You never "create" a folder. ✅
- A folder can never be "missing". ✅
- An empty folder cannot exist — if the file is deleted, the folder disappears.

But **buckets are real** — they must exist before you use them.

---

## 3. The client — made one time

```ts
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT, // only for MinIO, not AWS
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY as string,
    secretAccessKey: process.env.MINIO_SECRET_KEY as string,
  },
  forcePathStyle: true, // MinIO needs this. AWS does not.
});
```

| Option | Why |
|---|---|
| `endpoint` | where MinIO lives. Remove it for real AWS. |
| `region` | AWS needs it. MinIO ignores it, but the SDK asks for it. |
| `credentials` | your user and password |
| `forcePathStyle` | MinIO puts the bucket in the **path**, AWS puts it in the **domain** |

---

## 4. Every command has the same shape

```ts
await s3.send(new SomeCommand({ ...options }));
```

You **make** a command, then you **send** it. Always these two steps.

### The commands you will use

| Command | Job |
|---|---|
| `PutObjectCommand` | upload a file |
| `GetObjectCommand` | download / read a file |
| `DeleteObjectCommand` | delete one file |
| `DeleteObjectsCommand` | delete many at once |
| `ListObjectsV2Command` | see what is inside |
| `HeadObjectCommand` | ask size/type **without** downloading |
| `CopyObjectCommand` | copy a file to a new key |

### Upload

```ts
await s3.send(
  new PutObjectCommand({
    Bucket: BUCKET,
    Key: "profile/cat.png",
    Body: file.buffer,        // the real bytes
    ContentType: "image/png", // so the browser knows it is a picture
  }),
);
```

> If `ContentType` is wrong, the browser **downloads** the file instead of
> showing it. A very common bug.

### Delete

```ts
await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
```

⚠️ Deleting a key that does not exist gives **no error**. S3 says "ok" anyway.

### List one folder

```ts
const out = await s3.send(
  new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: "profile/",  // only names starting with this
    MaxKeys: 100,
  }),
);

out.Contents?.forEach((o) => console.log(o.Key, o.Size));
```

`Prefix` is how you "open a folder" — you filter by the start of the name.

### Check without downloading

```ts
const info = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
console.log(info.ContentLength, info.ContentType);
```

Cheap and fast — use this to check a file really exists.

---

## 5. Presigned URLs — the important part

A **presigned URL** is a normal link with a **signature** added to the end.
The signature says: *"the server allowed this exact action, until this time."*

```ts
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const command = new PutObjectCommand({ Bucket, Key, ContentType });
const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // seconds
```

### Why we use it

Without it, the file must pass **through** your server — slow and expensive.
With it, the frontend sends the file **straight to storage**.

```
Frontend → your server   : "I want to upload cat.png"
your server → Frontend   : here is a signed link (5 minutes)
Frontend → S3/MinIO      : the real file          ← server not involved
Frontend → your server   : "save this link in my profile"
```

### 4 things go inside the signature

1. the **bucket**
2. the **key**
3. the **method** (`PUT` = upload, `GET` = view)
4. the **time** it dies

Change **any** of them when using the link → `SignatureDoesNotMatch`.

That is why sending `GET` on an upload link fails: the method is part of the
signature.

### Facts from the real AWS docs

- The link uses **your** permissions — anyone holding it can use it.
  AWS calls it a *"bearer token"*. Keep it private.
- It can be used **many times** until it expires, not only once.
- Max life: **7 days** with the SDK, 12 hours from the AWS console.
- If your credentials die first, the link dies with them.
- Same key uploaded twice → the old file is **replaced**. That is why we put
  `Date.now()` in the key.

### Locking the size

If you sign only bucket + key, a user can promise "1 MB" and upload 500 MB.
Signing the length stops that:

```ts
new PutObjectCommand({
  Bucket, Key, ContentType,
  ContentLength: body.fileSize, // now the real bytes must match exactly
});
```

---

## 6. Public vs private buckets

| | Private | Public |
|---|---|---|
| Plain link | ❌ AccessDenied | ✅ works |
| Signed link | ✅ works | ✅ works |
| Expires | ⏱️ yes | never |
| Good for | invoices, ID cards | product images |

Buckets start **private**. To view a private file you make a signed **GET**
link — same idea as upload, different command:

```ts
const command = new GetObjectCommand({ Bucket, Key });
const viewUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
```

Put `viewUrl` into `<img src="...">` and the picture shows.

---

## 7. Errors and what they really mean

| Error | Real reason |
|---|---|
| `SignatureDoesNotMatch` | method, headers, or size changed after signing — or your clock is wrong |
| `AccessDenied` | bucket is private and the link has no signature |
| `NoSuchBucket` | the bucket was never created |
| `NoSuchKey` | that file name does not exist |
| `EntityTooLarge` | bigger than the signed `ContentLength` |
| `ECONNREFUSED 127.0.0.1:9000` | MinIO is not running — start it |

---

## 8. MinIO → real AWS S3

When you move to Amazon, change only these:

```diff
- endpoint: process.env.MINIO_ENDPOINT,
- forcePathStyle: true,
  region: "eu-north-1",          // your real region
```

Everything else — commands, presigned URLs, keys — stays **exactly the same**.
That is why learning with MinIO is safe: no bill, same code.

---

## 9. Words to search when you read the real docs

```
S3 presigned URL
S3 object key naming
S3 bucket policy
S3 multipart upload        ← for very big files
S3 lifecycle rule          ← auto-delete old files
S3 CORS configuration      ← needed when the browser uploads
```

Official pages:

- <https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html>
- <https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html>
- <https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/>
