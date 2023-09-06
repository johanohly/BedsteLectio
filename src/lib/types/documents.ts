import type { DateTime } from "luxon";

export type RawDocument = {
    afsender: string;
    dato: string;
    navn: string;
    id: string;
}

export type Document = {
    author: string;
    date: DateTime;
    title: string;
    id: number;
}