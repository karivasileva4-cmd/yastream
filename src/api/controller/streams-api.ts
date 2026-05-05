import { Context } from "hono";
import StreamService from "../../service/resource/stream-service.js";
import { TTL_SECS } from "../../utils/cache.js";
import { toAbsoluteM3u8 } from "../../utils/playlist.js";

export async function streamApiHandler(c: Context) {
  const id = c.req.param("id");
  if (!id) {
    return c.text("Missing parameters", 400);
  }
  const streamId = id.endsWith(".m3u8") ? id.slice(0, -5) : id;
  try {
    const stream = await StreamService.getStream(streamId);
    if (!stream || !stream.playlist) {
      return c.text("No streams found", 404);
    }
    const playlist = toAbsoluteM3u8(stream.url, stream.playlist);
    stream.playlist = playlist;
    return c.text(stream.playlist, 200, {
      "Content-Type": "application/vnd.apple.mpegurl",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": `max-age=${TTL_SECS.stream}, public`,
    });
  } catch {
    return c.text("Invalid request", 400);
  }
}
