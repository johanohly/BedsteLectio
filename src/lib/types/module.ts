import type { Lesson, RawLesson } from "./lesson"

export type Module = {
    lesson: Lesson;
    homework: string | null;
    note: string | null;
    presentation: string | null;
    otherContent: string | null;
}

export type RawModule = {
    aktivitet: RawLesson;
    lektier: string | null;
    note: string | null;
    "præsentation": string | null;
    "øvrigt_indhold": string | null;
}