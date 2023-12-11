import type { Settings } from "$lib/types/settings";

export const translateExamName = (name: string, classNameTranslations: Settings["classNames"]) => {
    for (const [key, value] of Object.entries(classNameTranslations)) {
        name = name.replace(key, value);
    }
    return name.replace('mdt.', 'mundtlig').replace('skr.', 'skriftlig')
        .replace('prv.', 'prøve')
        .replace('eks.', 'eksamen')
};