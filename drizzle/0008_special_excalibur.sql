CREATE TABLE `job` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`type` text NOT NULL,
	`data` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mkvdrama` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_content_id` text NOT NULL,
	`ouo_id` text,
	`resolution` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`ttl` integer,
	FOREIGN KEY (`provider_content_id`) REFERENCES `provider_content`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ouo_id`) REFERENCES `ouo`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mkvdrama_ouo_id_unique` ON `mkvdrama` (`ouo_id`);--> statement-breakpoint
CREATE TABLE `ouo` (
	`id` text PRIMARY KEY NOT NULL,
	`original_url` text NOT NULL,
	`redirected_url` text,
	`created_at` integer NOT NULL
);
