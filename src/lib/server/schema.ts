import { boolean, jsonb, pgTable, text } from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
    id: text("id").primaryKey(),
    convertClassNames: boolean("convert_class_names").default(false),
    customColors: jsonb("custom_colors").default({}),
})