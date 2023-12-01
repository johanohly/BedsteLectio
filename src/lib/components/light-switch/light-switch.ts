import { localStorageStore } from "$lib/utilities";

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
