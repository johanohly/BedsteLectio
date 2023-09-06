import type { Lesson, RawLesson } from "./lesson";

export type RawHomework = {
    aktivitet: RawLesson;
    note: string;
    lektier: {
        beskrivelse: string;
        link: string;
    };
};

export type Homework = {
    lesson: Lesson;
    homework: string;
};