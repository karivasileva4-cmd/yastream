PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_streams` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_content_id` text NOT NULL,
	`provider` text NOT NULL,
	`external_id` text,
	`season` text NOT NULL,
	`episode` text NOT NULL,
	`url` text NOT NULL,
	`playlist` text,
	`hash` text,
	`resolution` text,
	`size` text,
	`duration` text,
	`created_at` integer NOT NULL,
	`ttl` integer,
	FOREIGN KEY (`provider_content_id`) REFERENCES `provider_content`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_streams`("id", "provider_content_id", "provider", "external_id", "season", "episode", "url", "playlist", "hash", "resolution", "size", "duration", "created_at", "ttl") SELECT "id", "provider_content_id", "provider", "external_id", "season", "episode", "url", "playlist", "hash", "resolution", "size", "duration", "created_at", "ttl" FROM `streams`;--> statement-breakpoint
DROP TABLE `streams`;--> statement-breakpoint
ALTER TABLE `__new_streams` RENAME TO `streams`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_streams_provider_id` ON `streams` (`provider_content_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_streams_url` ON `streams` (`url`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_streams_hash` ON `streams` (`hash`);