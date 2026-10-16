CREATE TABLE `reminder_copy` (
	`day` text PRIMARY KEY NOT NULL,
	`message` text,
	`status` text NOT NULL,
	`created_at` text NOT NULL
);
