import type { Interval } from "luxon";
import type { RawLesson } from "./lesson";

export type RawHomework = {
    aktivitet: RawLesson;
    lektier: string;
};

export type Homework = {
    homework: string;
    lesson: {
        id: string;
        name: string;
        class: string;
        interval: Interval;
    };
};