declare global {
    interface String {
        containsAny(chars: string[]): boolean;
        toTitleCase(): string;
    }
}

String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};

String.prototype.containsAny = function (chars: string[]) {
    return chars.some((char) => this.includes(char));
}

export {};