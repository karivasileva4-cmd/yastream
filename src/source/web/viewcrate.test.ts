import * as crypto from "crypto";
import { describe, expect, it } from "vitest";
import {
  getUrlsFromViewcrate,
  parseJkAndCryptedFromHtml,
} from "./viewcrate.js";

describe("Viewcrate Hoster", () => {
  it.skip("get viewcrate urls", async () => {
    const urls = await getUrlsFromViewcrate(
      "https://viewcrate.cc/c/3e6b3ababeb772cfe42ac72afd962fef",
    );
    console.log("urls", urls);
    expect(urls).not.toBeNull();
  }, 30000);

  it.skip("decrypt", async () => {
    const response = `<html>

<head>
    <meta name="color-scheme" content="light dark">
    <meta charset="utf-8">
</head>

<body>
    <pre>{"crypted":"MfQR3yzdUBaa/ppjUnvLBnIYxs0gxrWYAvde+MLy4ipFcDnYfDiNzBWrmRrUk8HZQE9y7AUytKX+qd6z/vnLsb0NeKGJ557lyr83QuXTaqo+41xMgQWFMuqUj6oSffO5RYvj98swbNzWg27/8A5FgWndHNA09SqRBiQYTj7f9hqJnqaFtqGMWd9HxzciAHw36LgOUd8mZVNhNUV/o9/FAeNd1RtlfZWm5boAfAO/83BAXj/RXLVxGfBogttpcl7/S8FlJadSOyiaPE+XRCdQu3O+aKW/7Lzj2tP0DtXn5OYz/xaM1mg1Qa2iXaMjiPFcABEYRxpPT8KwjHIdd34DjCof/BdUt1iL/AEpbo/5YWWcMtmThayvfCuHfOuNWzw5Y9nr2DNnMfVdkiyazZWEXnCYX50uDnjHf8AO0On1ogGPYlChBk2KqTijf8ZtF8k3jR9f/P62dgsPNTEiWnd9rtf4SN9X9iWh5Ijlknf33fCTx+xi4C9X4IAQtTKeZHNWvpIWNMmguL+AYjZSDaOVfuY8qI69ho8IpcG+tnauL/35S0ei7AsU/1qBPU7bjwggodzJFiLH7mSPRZfehufJMUN9ZaXDo7mTcR+IHZrmn4TkL2wVUUCRUDMA4kbPFLtGdwG6n2xvZm04TXKG7krL5L6nGXBtnxPyHiXu0pKrrtG97/qX7zE2ZhJU7leV80LydrRjcTquSD8NaX/JwFwy4ekanTnWc8gesQEu+HN3nps6gNT9sNlkyZh0CDk/QR/pSMkVQ3356Wuovd+6Btl/0fZ4+UHrI12k55aqfWakvnGbUzUYz/Q/KdAOZRpUUZoYBlA4NovJulBBs34w2eRDfmqcB8YUbBwdZ0jIVW3sGHwDeDk8u3ZEVgalEEbn7Fl4czlpvBNYxds94CBg6zYG2dOEXsogT5Yofn08bMmfiUFvs6l8OZvUsxQvx+nF/qRFK29laqbxAPqGeqi9QhEnT1IUCVRUtfLljQACDqnQoKY=","jk":"function f(){ return 'c94304ee9e39313ae97c5ed6f390b6dd'; }","package":"Perfect Crown S01 1080p WEB-DL DSNP"}</pre>
    <div class="json-formatter-container"></div>
</body>

</html>`;
    const { crypted, jk } = parseJkAndCryptedFromHtml(response);
    console.log("crypted", crypted);
    console.log("jk", jk);
    const key = Buffer.from(jk, "hex");
    const encrypted = Buffer.from(crypted, "base64");
    const decipher = crypto.createDecipheriv(
      "aes-128-cbc",
      key,
      Buffer.alloc(16, 0),
    );
    decipher.setAutoPadding(false);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    const text = decrypted.toString("utf8");
    const links = text.match(/https?:\/\/[^\s"'<>]+/g) || [];
    console.log("links", links);
  }, 15000);
});
