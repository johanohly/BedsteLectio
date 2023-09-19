import type { DateTime } from "luxon";

export type RawSimpleDocument = {
    afsender: string;
    dato: string;
    id: string;
    navn: string;
}

export type SimpleDocument = {
    author: string;
    date: DateTime;
    id: number;
    title: string;
}

export type FileTree = {
    type: "file" | "folder";
    name: string;
    open: boolean;
    children?: FileTree[]
}