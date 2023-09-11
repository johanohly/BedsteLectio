import type { Lesson, RawLesson } from "./lesson";

export type RawHomework = {
    aktivitet: RawLesson;
    lektier: {
        beskrivelse: string;
        link: string;
    };
    note: string;
};

export type Homework = {
    homework: string;
    lesson: Lesson;
};