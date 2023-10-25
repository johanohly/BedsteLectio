CREATE TABLE IF NOT EXISTS "settings" (
	"id" text PRIMARY KEY NOT NULL,
	"convert_class_names" boolean DEFAULT false,
	"custom_colors" jsonb DEFAULT '{}'::jsonb
);
