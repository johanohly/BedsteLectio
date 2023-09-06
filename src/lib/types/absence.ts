import type { RawLesson } from "./lesson";

export type RawAbsence = {
    generalt: {
        hold: string;
        heleåret_fravær_moduler: string;
        heleåret_fravær_procent: string;
        opgjort_fravær_moduler: string;
        opgjort_fravær_procent: string;
    }[];
    grafisk_oversigt: string;
    moduler: {
        manglende_fraværsårsager: {
            aktivitet: RawLesson;
            fravær: string;
            fraværstype: string;
            lærer: string;
            registreret: string;
            type: "Lektion" | string;
            uge: string;
        }[];
        oversigt: {
            aktivitet: RawLesson;
            bemærkning: string;
            fravær: string;
            fraværstype: string;
            lærer: string;
            registreret: string;
            type: "Lektion" | string;
            uge: string;
            årsag: "Sygdom" | "Private forhold" | "Kom for sent" | "Skolerelaterede aktiviteter" | "Anden";
            årsagsnote: string;
        }[];
    };
}