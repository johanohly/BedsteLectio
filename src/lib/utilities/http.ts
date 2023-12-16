import { constructNonceURL } from "./nonce";
import { authStore } from "$lib/stores";
import posthog from "posthog-js";
import { get } from "svelte/store";
import { decodeUserID } from "./cookie";

export const clearAuthStore = () => {
    authStore.update((store) => {
        return {
            ...store,
            cookie: "",
            password: "",
            username: "",
        };
    });
};

export const autoLogin = async () => {
    const $authStore = get(authStore);
    const response = await fetch(constructNonceURL("https://api.bedstelectio.dk/auth"), {
        headers: {
            adgangskode: $authStore.password,
            brugernavn: $authStore.username,
            skoleid: String($authStore.school),
        },
    });
    if (response.ok) {
        posthog.identify(
            decodeUserID($authStore.cookie),
            {},
            {
                username: $authStore.username,
                school: $authStore.school,
            },
        );
        authStore.update((store) => {
            return {
                ...store,
                cookie: response.headers.get("set-lectio-cookie") ?? "",
            };
        })
        return true;
    }
    return false;
};