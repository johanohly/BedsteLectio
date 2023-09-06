import type { RawLesson, Lesson } from "./lesson"

export type Module = {
    presentation: string | null;
    otherContent: string | null;
    homework: string | null;
    note: string | null;
    lesson: Lesson;
}

export type RawModule = {
    "øvrigt_indhold": string | null;
    "præsentation": string | null;
    lektier: string | null;
    aktivitet: RawLesson;
    note: string | null;
}