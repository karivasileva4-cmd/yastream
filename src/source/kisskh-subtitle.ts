import { AxiosRequestConfig } from "axios";
import { Buffer } from "buffer";
import * as crypto from "crypto";
import { axiosGet } from "../utils/axios.js";
import { cache } from "../utils/cache.js";
import { ENV } from "../utils/env.js";
import { Logger } from "../utils/logger.js";

const logger = new Logger("SUB");

interface DecryptionKeys {
  [key: string]: {
    key: Buffer;
    iv: Buffer;
  };
}

const DECRYPT_KEYS: DecryptionKeys = {
  txt: {
    key: Buffer.from("8056483646328763"),
    iv: Buffer.from("6852612370185273"),
  },
  txt1: {
    key: Buffer.from("AmSmZVcH93UQUezi"),
    iv: Buffer.from("ReBKWW8cqdjPEnF6"),
  },
  default: {
    key: Buffer.from("sWODXX04QRTkHdlZ"),
    iv: Buffer.from("8pwhapJeC4hrS9hO"),
  },
};
function isEncrypted(line: string) {
  return /^[A-Za-z0-9+/]+={0,2}$/.test(line.trim()) && line.length > 4;
}

function decrypt(data: string, key: Buffer, iv: Buffer): string {
  const normalizedData = data
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace('"', "");
  const lines = normalizedData.split(/\r?\n/);
  const decryptedLines = lines
    .map((line) => {
      if (isEncrypted(line)) {
        try {
          const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
          let decryptedLine = decipher.update(line, "base64", "utf8");
          decryptedLine += decipher.final("utf8");
          return decryptedLine;
        } catch (error) {
          logger.warn(`Fail to decrypt | ${line}`);
          return line;
        }
      }
      return line;
    })
    .join("\n");
  return decryptedLines;
}

function getKeyForFormat(format: string): { key: Buffer; iv: Buffer } {
  return (DECRYPT_KEYS[format] || DECRYPT_KEYS.default) as {
    key: Buffer;
    iv: Buffer;
  };
}

function detectFormat(url: string): string {
  const lowerUrl = url.split("?")[0]?.toLowerCase() || url.toLowerCase();
  if (lowerUrl.endsWith(".txt1")) {
    return "txt1";
  } else if (lowerUrl.endsWith(".txt")) {
    return "txt";
  }
  return "default";
}

export async function getSetDecryptedSubtitle(
  subtitleUrl: string,
): Promise<string | null> {
  const decryptSubKey = `decrypt_sub:${subtitleUrl}`;

  const cached = cache.get(decryptSubKey);
  if (cached !== null) {
    return cached;
  }

  try {
    const url = ENV.PROXY_KISSKH_SUBTITLE
      ? `${ENV.PROXY_URL}:${ENV.PROXY_PORT}/${subtitleUrl}`
      : subtitleUrl;
    const config: AxiosRequestConfig = {
      responseType: "text",
      timeout: 20000,
    };
    let encryptedData = await axiosGet<string>(subtitleUrl, config);
    if (!encryptedData) {
      encryptedData = await axiosGet<string>(url, config);
    }
    if (!encryptedData) return null;
    logger.log(`Decrypt | ${url}`);
    const format = detectFormat(url);
    const { key, iv } = getKeyForFormat(format);
    const decrypted = decrypt(encryptedData, key, iv);
    cache.set(decryptSubKey, decrypted);
    return decrypted;
  } catch (error: any) {
    logger.error(`Failed to decrypt | ${error.message}`);
    return null;
  }
}

export { detectFormat };
