import type { Writable } from "svelte/store";

import { localStorageStore } from "./utilities";

export const authStore: Writable<{ lastLogin: string | null; username: string; password: string; cookie: string; school: number; }> = localStorageStore("auth", {
    cookie: "",
    lastLogin: null,
    password: "",
    school: 0,
    username: "",
});