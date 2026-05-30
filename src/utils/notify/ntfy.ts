import axios from "axios";
import { ENV } from "../env.js";

type Priority = "min" | "low" | "default" | "high" | "max";
export async function ntfy(
  title: string,
  message: string,
  priority: Priority = "default",
) {
  if (ENV.NTFY_URL) {
    axios.post(
      ENV.NTFY_URL,
      `**${title}**
       ${message}`,
      { headers: { Markdown: "yes", Priority: priority } },
    );
  }
}
