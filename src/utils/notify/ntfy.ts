import { ENV } from "../env.js";
import axios from "axios";

export async function ntfy(title: string, message: string) {
  if (ENV.NTFY_URL) {
    axios.post(
      ENV.NTFY_URL,
      `**${title}**
       ${message}`,
      { headers: { Markdown: "yes" } },
    );
  }
}
