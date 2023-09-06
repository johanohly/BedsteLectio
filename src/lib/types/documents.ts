import type { DateTime } from "luxon";

export type RawDocument = {
    afsender: string;
    dato: string;
    id: string;
    navn: string;
}

export type Document = {
    author: string;
    date: DateTime;
    id: number;
    title: string;
}