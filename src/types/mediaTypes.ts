// The folders our app allows. Add a new one here and it works everywhere.
export const folders = ["profile", "product", "banner"] as const;

export type folderType = (typeof folders)[number];

// Only these image types are allowed
export const allowedTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

// Biggest file we accept: 5 MB
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
