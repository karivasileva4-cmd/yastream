import { Logger } from "./logger.js";

export class RateLimitError extends Error {
  constructor(message: string) {
    const name = ErrorName.RATE_LIMIT;
    super(`${name} | ${message}`);
    this.name = name;
  }
}

export class TmdbError extends Error {
  constructor(message: string) {
    const name = ErrorName.TMDB;
    super(`${name} | ${message}`);
    this.name = name;
  }
}
export class TvdbError extends Error {
  constructor(message: string) {
    const name = ErrorName.TVDB;
    super(`${name} | ${message}`);
    this.name = name;
  }
}
export class FuseError extends Error {
  constructor(message: string) {
    const name = ErrorName.FUSE;
    super(`${name} | ${message}`);
    this.name = name;
  }
}

export class MatchingError extends Error {
  constructor(message: string) {
    const name = ErrorName.MATCHING;
    super(`${name} | ${message}`);
    this.name = name;
  }
}
export class ProbeInfoError extends Error {
  constructor(message: string) {
    const name = ErrorName.PROBE_INFO;
    super(`${name} | ${message}`);
    this.name = name;
  }
}
// FLARESOLVERR
export class FlareSolverrError extends Error {
  constructor(message: string) {
    const name = ErrorName.FLARESOLVERR;
    super(`${name} | ${message}`);
    this.name = name;
  }
}
// DEBRID
export class TorboxError extends Error {
  constructor(message: string) {
    const name = ErrorName.TORBOX;
    super(`${name} | ${message}`);
    this.name = name;
  }
}

// OUO
export class OuoError extends Error {
  constructor(message: string) {
    const name = ErrorName.OUO;
    super(`${name} | ${message}`);
    this.name = name;
  }
}

// KISSKH

export class KisskhDetailError extends Error {
  constructor(message: string) {
    const name = ErrorName.KISSKH_DETAIL;
    super(`${name} | ${message}`);
    this.name = name;
  }
}
export class KisskhEpisodeError extends Error {
  constructor(message: string) {
    const name = ErrorName.KISSKH_EPISODE;
    super(`${name} | ${message}`);
    this.name = name;
  }
}
export class KisskhTokenError extends Error {
  constructor(message: string) {
    const name = ErrorName.KISSKH_TOKEN;
    super(`${name} | ${message}`);
    this.name = name;
  }
}
// Onetouch
export class OnetouchSearchError extends Error {
  constructor(message: string) {
    const name = ErrorName.ONETOUCHTV_SEARCH;
    super(`${name} | ${message}`);
    this.name = name;
  }
}
export class OnetouchDetailError extends Error {
  constructor(message: string) {
    const name = ErrorName.ONETOUCHTV_DETAIL;
    super(`${name} | ${message}`);
    this.name = name;
  }
}
export class OnetouchEpisodeError extends Error {
  constructor(message: string) {
    const name = ErrorName.ONETOUCHTV_EPISODE;
    super(`${name} | ${message}`);
    this.name = name;
  }
}

// MKVDRAMA
export class MkvdramaError extends Error {
  constructor(message: string) {
    const name = ErrorName.MKVDRAMA;
    super(`${name} | ${message}`);
    this.name = name;
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
  // FlareSolverr
  FLARESOLVERR = "[FlareSolverr] Error",
  // TORBOX
  TORBOX = "[Torbox] Error",
  // OUO
  OUO = "[Ouo] Error",
  // KISSKH
  KISSKH_DETAIL = "[Kisskh] Detail Error",
  KISSKH_EPISODE = "[Kisskh] Episode Error",
  KISSKH_TOKEN = "[Kisskh] Token Error",
  // ONETOUCHTV
  ONETOUCHTV_SEARCH = "[Onetouchtv] Search Error",
  ONETOUCHTV_DETAIL = "[Onetouchtv] Detail Error",
  ONETOUCHTV_EPISODE = "[Onetouchtv] Episode Error",
  // MKVDRAMA
  MKVDRAMA = "[Mkvdrama] Error",
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
      logger.error(`${message} | ${JSON.stringify(error.message)}`);
      return error;
    default:
      error.name = ErrorName.UNKNOWN;
      logger.error(`${message} | ${JSON.stringify(error)}`);
      return error;
  }
}
