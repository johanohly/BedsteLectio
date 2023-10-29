import type { Writable } from "svelte/store";

import { localStorageStore } from "./utilities";

export const authStore: Writable<{ cookie: string; lastLogin: null | string; password: string; school: number; username: string; }> = localStorageStore("auth", {
    cookie: "",
    lastLogin: null,
    password: "",
    school: 0,
    username: "",
});

export const calendarStore: Writable<{ date: string; }> = localStorageStore("calendar", {
    date: new Date().toISOString(),
});