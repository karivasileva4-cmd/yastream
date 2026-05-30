import { Subtitle } from "@stremio-addon/sdk";
import {
  getCountSubtitles,
  getSubtitle,
  getSubtitlesJoinProvider,
} from "../../db/queries.js";
import { API, SUBTITLES } from "../../utils/constant.js";
import { getOrigin } from "../../utils/domain.js";
import { cache } from "../../utils/cache.js";
import { ONETOUCHTV_HOST } from "../../source/onetouchtv.js";

class SubtitleService {
  static async getSubtitle(id: string) {
    const subtitle = await getSubtitle(id);
    if (!subtitle) return undefined;
    const cacheKey = `subtitle:service:${subtitle.id}`;
    const cacheResult = await cache.get(cacheKey);
    if (cacheResult) return cacheResult;
    return subtitle;
  }
  static async getSubtitlesFromDb(
    id: string,
    season: number,
    episode: number,
  ): Promise<Subtitle[]> {
    const subtitlesAndProvider = await getSubtitlesJoinProvider(
      id,
      season ?? 1,
      episode ?? 1,
    );
    if (subtitlesAndProvider && subtitlesAndProvider.length > 0) {
      const subtitles = subtitlesAndProvider.map((subtitle) => {
        let url = subtitle.subtitles.url;
        if (subtitle.subtitles.subtitle) {
          url = SubtitleService.getSubtitleUrl(subtitle.subtitles.id);
        }
        const isExpired =
          subtitle.subtitles.createdAt + (subtitle.subtitles.ttl ?? 0) <
          Date.now();
        if (url.includes(ONETOUCHTV_HOST) && isExpired) {
          return;
        }
        return {
          id: id,
          label: subtitle.provider_content.provider,
          lang: subtitle.subtitles.lang,
          url: url,
        };
      });
      return subtitles.filter((subtitle) => subtitle !== undefined);
    }
    return [];
  }
  static getSubtitleUrl(id: string) {
    return `${getOrigin()}/${API}/${SUBTITLES}/${id}.vtt`;
  }

  static async getTotalSubtitles() {
    const subtitles = await getCountSubtitles();
    if (!subtitles) return 0;
    const total = subtitles[0]?.count ?? 0;
    return total;
  }
}
export default SubtitleService;
