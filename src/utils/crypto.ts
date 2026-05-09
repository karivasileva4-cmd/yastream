import { createHash } from "crypto";

export function hashSHA256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
export function hashMD5(input: string): string {
  return createHash("md5").update(input).digest("hex");
}
