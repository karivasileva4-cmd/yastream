import { Logger } from "./logger.js";

export class RateLimitError extends Error {
  constructor(message: string) {
    super(`${ErrorName.RATE_LIMIT} | ${message}`);
    this.name = ErrorName.RATE_LIMIT;
  }
}

export class TmdbError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ErrorName.TMDB;
  }
}
export class TvdbError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ErrorName.TVDB;
  }
}
export class FuseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ErrorName.FUSE;
  }
}

export class MatchingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ErrorName.MATCHING;
  }
}
export class ProbeInfoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ErrorName.PROBE_INFO;
  }
}

export class KisskhDetailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ErrorName.KISSKH_DETAIL;
  }
}
export class KisskhEpisodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ErrorName.KISSKH_EPISODE;
  }
}
export class KisskhTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ErrorName.KISSKH_TOKEN;
  }
}
// Onetouch
export class OnetouchSearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ErrorName.ONETOUCHTV_SEARCH;
  }
}
export class OnetouchDetailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ErrorName.ONETOUCHTV_DETAIL;
  }
}
export class OnetouchEpisodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ErrorName.ONETOUCHTV_EPISODE;
  }
}
enum ErrorName {
  ERROR = "Error",
  RATE_LIMIT = "Rate Limit",
  FUSE = "Fuse Error",
  MATCHING = "Matching Error",
  UNKNOWN = "Unknown Error",
  // PROBE
  PROBE_INFO = "Probe Info Error",
  // DB
  DB_LOCK = "DB Lock Error",
  DB_FOREIGN_KEY = "DB Foreign Key Error",
  DB_UNIQUE = "DB Unique Error",
  // Meta
  TMDB = "TMDB Error",
  TVDB = "TVDB Error",
  // KISSKH
  KISSKH_DETAIL = "[Kisskh] Detail Error",
  KISSKH_EPISODE = "[Kisskh] Episode Error",
  KISSKH_TOKEN = "[Kisskh] Token Error",
  // ONETOUCHTV
  ONETOUCHTV_SEARCH = "[Onetouchtv] Search Error",
  ONETOUCHTV_DETAIL = "[Onetouchtv] Detail Error",
  ONETOUCHTV_EPISODE = "[Onetouchtv] Episode Error",
}

export function handleError(
  error: Error | any,
  logger: Logger = new Logger("ERROR"),
  message: string = "",
): Error | null {
  switch (true) {
    case error instanceof RateLimitError:
    case error instanceof FuseError:
    case error instanceof MatchingError:
    case error instanceof ProbeInfoError:
    case error instanceof TmdbError:
    case error instanceof TvdbError:
    case error instanceof KisskhDetailError:
    case error instanceof KisskhEpisodeError:
    case error instanceof OnetouchSearchError:
    case error instanceof OnetouchDetailError:
    case error instanceof OnetouchEpisodeError:
      logger.warn(`${message} | ${error.message}`);
      return error;
    case error instanceof KisskhTokenError:
      logger.error(`${message} | ${error.message}`);
      return error;
    case error instanceof Error:
      if (error.message.includes("lock")) {
        logger.error(`${message} | ${error.message}`);
        error.name = ErrorName.DB_LOCK;
        return error;
      }
      if (error.message.includes("FOREIGN KEY")) {
        logger.warn(`${message} | ${error.message}`);
        error.name = ErrorName.DB_FOREIGN_KEY;
        return error;
      }
      if (error.message.includes("UNIQUE")) {
        logger.warn(`${message} | ${error.message}`);
        error.name = ErrorName.DB_UNIQUE;
        return error;
      }
      error.name = ErrorName.ERROR;
      logger.error(`${message} | ${error.message}`);
      return error;
    default:
      error.name = ErrorName.UNKNOWN;
      logger.error(`${message} | ${error}`);
      return error;
  }
}
