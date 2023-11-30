import { localStorageStore } from "$lib/utilities"
import { get } from "svelte/store";

type Theme = "light" | "dark";
export const themeCurrent = localStorageStore<Theme>("theme", "light");

export function setModeCurrent(value: Theme) {
	const elemHtmlClasses = document.documentElement.classList;
	const classDark = `dark`;
	value === "light"
		? elemHtmlClasses.remove(classDark)
		: elemHtmlClasses.add(classDark);
	themeCurrent.set(value);
}

export function setInitialClassState() {
	const elemHtmlClasses = document.documentElement.classList;
	const classDark = `dark`;
	const theme = get(themeCurrent);
	theme === "light"
		? elemHtmlClasses.remove(classDark)
		: elemHtmlClasses.add(classDark);
}