import type { DateTime } from "luxon";

export type RawSimpleForm = {
    titel: string;
    anonym: "Ja" | "Nej";
    ejer: string;
    id: string;
    svarfrist: string;
}

export type SimpleForm = {
    title: string;
    deadline: DateTime;
    anonymous: boolean;
    owner: string;
    id: string;
}