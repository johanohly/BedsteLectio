import { jsonb, pgTable, text } from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
    id: text("id").primaryKey(),
    classNames: jsonb("class_names").default({}),
    customColors: jsonb("custom_colors").default({}),
})