import type { DateTime } from "luxon";
import type { RawLesson } from "./lesson";

export type RawHomework = {
    aktivitet: RawLesson;
    lektier: string;
};

export type Homework = {
    homework: string;
    lesson: {
        name: string;
        class: string;
        interval: DateTime;
    };
};