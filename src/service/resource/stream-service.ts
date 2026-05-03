import { Stream } from "@stremio-addon/sdk";
import {
  getCountStream,
  getStream,
  getStreamsJoinProvider,
} from "../../db/queries.js";
import { UserConfig } from "../../lib/manifest.js";
import { API, ONETOUCHTV_HOST, STREAMS } from "../../utils/constant.js";
import { getOrigin } from "../../utils/domain.js";
import { formatStreamTitle } from "../../utils/format.js";
import { parseInfo, probeStreamInfo, StreamInfo } from "../../utils/info.js";

class StreamService {
  static async getStream(id: string) {
    return getStream(id);
  }

  static async getDbStreams(
    id: string,
    season: number,
    episode: number,
    displayName: string,
    config: UserConfig,
  ): Promise<Stream[]> {
    const streamsAndProvider = await getStreamsJoinProvider(
      id,
      season ?? 1,
      episode ?? 1,
    );
    if (streamsAndProvider && streamsAndProvider.length > 0) {
      const streams = await Promise.all(
        streamsAndProvider.map(async (stream, index) => {
          let url = stream.streams.url;
          if (stream.streams.playlist) {
            // Violate Cloudflare's ToS if serve m3u8 stream
            // url = StreamService.getStreamUrl(stream.streams.id);
            url = stream.streams.url;
            const isExpired =
              stream.streams.createdAt + (stream.streams.ttl ?? 0) < Date.now();
            if (url.includes(ONETOUCHTV_HOST) && isExpired) {
              return;
            }
          }
          let info: StreamInfo = parseInfo(stream.streams);
          if (config.info) {
            const probeInfo = await probeStreamInfo(url);
            info = probeInfo || info;
          }
          const formatTitle = formatStreamTitle(
            stream.provider_content.title,
            stream.provider_content.year,
            season,
            episode,
            info,
          );
          const filename = `${formatTitle}-${stream.provider_content.provider}`;
          return {
            url: url,
            name: displayName,
            title: formatTitle,
            behaviorHints: {
              notWebReady: true,
              bingeGroup: `${displayName}-${index}`,
              filename: filename,
            },
          };
        }),
      );
      return streams.filter((stream) => stream !== undefined);
    }
    return [];
  }

  static getStreamUrl(id: string) {
    return `${getOrigin()}/${API}/${STREAMS}/${id}.m3u8`;
  }

  static async getTotalStreams() {
    const streams = await getCountStream();
    if (!streams) return 0;
    const total = streams[0]?.count ?? 0;
    return total;
  }
}

export default StreamService;
