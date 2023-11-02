export function nameBlacklisted(name: string) {
    // TODO: Check notes for "frivillig" string
    if (name == null) {
        return false;
    }
    name = name.toLowerCase();

    if (["obligatorisk"].some((x) => name.includes(x))) {
        return false;
    }
    if (
        [
            "café",
            "cafe",
            "klub",
            "club",
            "fri",
            "konkurrence",
            "mesterskab",
            "kemi ol",
            "kemi-ol"
        ].some((x) => name.includes(x))
    ) {
        return true;
    }
    return false;
}