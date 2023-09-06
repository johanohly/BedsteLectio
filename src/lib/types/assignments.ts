import type { DateTime } from "luxon";

type RawUser = {
    bruger_id: string;
    navn: string;
}

type RawDocument = {
    tidspunkt: string;
    dokument: string;
    "indlæg": string;
    bruger: RawUser;
}

export type RawAssignment = {
    oplysninger: {
        i_undervisningsbeskrivelse: "Nej" | "Ja";
        opgavebeskrivelse: string | null;
        afleveringsfrist: string;
        karakterskala: string;
        opgavetitel: string;
        ansvarlig: RawUser;
        opgavenote: string;
        elevtid: string;
        hold: string;
    };
    afleveres_af: {
        "status_fravær": string;
        karakternote: string;
        afsluttet: boolean;
        afventer: string;
        elevnote: string;
        karakter: string;
        elev: RawUser;
    };
    "opgave_indlæg": RawDocument[];
    gruppemedlemmer: RawUser[];
};

type User = {
    name: string;
    id: string;
}

type Document = {
    name: string | null;
    url: string | null;
    date: DateTime;
    user: User;
};

export type Assignment = {
    documents: Document[];
    participants: User[];
    description: string;
    billedTime: string;
    details: string;
    status: string;
    date: DateTime;
    title: string;
    class: string;
};

export type SimpleAssignment = {
    status: "Afleveret" | "Mangler" | "Venter";
    description: string;
    date: DateTime;
    title: string;
    hold: string;
    link: string;
};

export type RawSimpleAssignment = {
    status: "Afleveret" | "Mangler" | "Venter";
    afventer: "Lærer" | "Elev" | "";
    opgavetitel: string;
    "elev-tid": string;
    exerciseid: string;
    opgavenote: string;
    elevnote: string;
    "fravær": string;
    karakter: string;
    frist: string;
    hold: string;
    uge: string;
}