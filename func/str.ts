export function ucfirst(str: string) {
    let firstLetter = str.slice(0, 1),
        exp = new RegExp("^" + firstLetter);
    return str.replace(exp, firstLetter.toUpperCase());
}