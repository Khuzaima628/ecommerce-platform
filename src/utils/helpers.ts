import bcrypt from "bcryptjs";
import crypto from "crypto";

const generateRandomString = (length = 32): string => crypto.randomBytes(length).toString("hex");

const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, 12);

const comparePassword = (password: string, hashedPassword: string): Promise<boolean> =>
  bcrypt.compare(password, hashedPassword);

const formatDate = (date: string | Date): string =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

export { comparePassword, formatDate, generateRandomString, hashPassword, slugify };
