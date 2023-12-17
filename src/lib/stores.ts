import { writable, type Writable } from "svelte/store";

import { localStorageStore } from "./utilities";
import type { Settings } from "./types/settings";

export const authStore = localStorageStore("auth", {
    cookie: "",
    lastLogin: null,
    password: "",
    school: 0,
    username: "",
});

export const settingsStore: Writable<{ age: string | null; settings: Settings }> = localStorageStore("settings", {
    age: null,
    settings: {
        customColors: {},
        classNames: {}
    }
});
export const SETTINGS_CACHE_DURATION = 7; // days

export const calendarStore: Writable<{ date: string; onlyMandatory: boolean }> = localStorageStore("calendar", {
    date: new Date().toISOString(),
    onlyMandatory: false,
});

export const avatarStore: Writable<Record<string, string>> = writable({});