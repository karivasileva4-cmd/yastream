import { existsSync, readFileSync, writeFileSync } from "fs";
import * as jose from "jose";

export async function setupDatabaseSecurity() {
  let publicKey;
  let privateKey;
  const privateKeyPath = "src/db/key/private-key.pem";
  const publicKeyPath = "src/db/key/public-key.pem";

  // 1. Check if keys already exist to avoid overwriting them
  if (existsSync(privateKeyPath) && existsSync(publicKeyPath)) {
    console.log("Keys found. Loading existing keys...");
    const privateKeyPem = readFileSync(privateKeyPath, "utf-8");
    const publicKeyPem = readFileSync(publicKeyPath, "utf-8");

    privateKey = await jose.importPKCS8(privateKeyPem, "Ed25519");
    publicKey = await jose.importSPKI(publicKeyPem, "Ed25519");
  } else {
    console.log("No keys found. Generating new Ed25519 key pair...");
    const keys = await jose.generateKeyPair("EdDSA", {
      extractable: true,
      crv: "Ed25519",
    });
    privateKey = keys.privateKey;
    publicKey = keys.publicKey;

    // Export and save Private Key (SECRET)
    const pkcs8Pem = await jose.exportPKCS8(privateKey);
    writeFileSync(privateKeyPath, pkcs8Pem);

    // Export and save Public Key (Share this with sqld)
    const spkiPem = await jose.exportSPKI(publicKey);
    writeFileSync(publicKeyPath, spkiPem);

    console.log("Keys saved: private-key.pem and public-key.pem");
  }

  // 2. Helper to sign tokens
  const createToken = async (access: "ro" | "rw") => {
    return await new jose.SignJWT({ a: access })
      .setProtectedHeader({ alg: "EdDSA" })
      .setIssuedAt()
      .setExpirationTime("1y") // Valid for 1 year
      .sign(privateKey);
  };

  // 3. Generate the tokens
  const roToken = await createToken("ro");
  const rwToken = await createToken("rw");

  console.log("\n--- TOKEN STRINGS ---");
  console.log(`READ_ONLY_TOKEN: ${roToken}`);
  console.log(`READ_WRITE_TOKEN: ${rwToken}`);
}

setupDatabaseSecurity().catch(console.error);
