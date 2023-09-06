import type { RawLesson, Lesson } from "./lesson";

export type RawHomework = {
    lektier: {
        beskrivelse: string;
        link: string;
    };
    aktivitet: RawLesson;
    note: string;
};

export type Homework = {
    homework: string;
    lesson: Lesson;
};