import { localStorageStore } from "./utilities";
import type { Writable } from "svelte/store";

export const authStore: Writable<{ cookie: string; lastLogin: null | string; school: number; username: string; password: string; }> = localStorageStore("auth", {
    cookie: "",
    lastLogin: null,
    school: 0,
    username: "",
    password: "",
});