CREATE TABLE IF NOT EXISTS "settings" (
	"id" text PRIMARY KEY NOT NULL,
	"class_names" jsonb DEFAULT '{}'::jsonb,
	"custom_colors" jsonb DEFAULT '{}'::jsonb
);
