const identifier = "[a-zA-z_][a-zA-Z0-9_]*";
const integer = "[+-]?[0-9]+";
const sQuote = "%22";
const dQuote = "%27";
const sString = `(?:${sQuote}.*?${sQuote})`;
const dString = `(?:${dQuote}.*?${dQuote})`;

export const prefixRegexOf = (url: string): RegExp => {
    return new RegExp(`^/?${regexOf(url)}`);
};

export  const routeRegexOf = (url: string): RegExp => {
    return new RegExp(`^/?${regexOf(url)}$`);
};

const regexOf = (url: string): string => {
    return  url
        .split("/")
        .filter(Boolean)
        .map(toParamRegex)
        .join("/");
};

const toParamRegex = (urlPart) => {
    const regex = new RegExp(`{(${identifier})(?::(${identifier}))?}`, "gi");
    return urlPart.replaceAll(regex, replacer);
};

const replacer = (_, paramName, paramType) => {
    const realType = parseType(paramType);
    const groupName = `?<${paramName}_${realType || "string"}>`;
    switch (realType) {
        case "float":
            return `(${groupName}${integer}\\.[0-9]+(?:[eE]${integer})?)`;
        case "number":
            return `(${groupName}${integer}(?:\\.[0-9]+)?(?:[eE]${integer})?)`;
        case "boolean":
            return `(${groupName}${anyCaseOf(["true","false","on","off","yes","no"])}|0|1)`
        case "integer":
            return `(${groupName}${integer}(?:[eE]\\+?[0-9]+)?)`;
        case "string":
            return `(${groupName}${sString}|${dString})`;
        default:
            return `(${groupName}${identifier})`
    }
};

const parseType = (paramType: string): string => {
    if (paramType == null) return "string";
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(paramType)) throw invalidType(paramType);
    const lower = paramType.toLowerCase();
    switch (lower) {
        case "bool": return "boolean";
        case "int": return "integer";
        case "integer":
        case "boolean":
        case "string":
        case "float":
        case "number": return lower;
        default: return paramType;
    }
}

const invalidType = (paramType: string): Error => {
    return new TypeError(`Invalid parameter type "${paramType}"`);
}

const anyCaseOf = (strings: string[]): string => {
    return strings.map(casesOfString).join("|");
};

const casesOfString = (str: string): string => {
    const lower = str.toLowerCase();
    const upper = str.toUpperCase();
    const camel = str[0].toUpperCase() + str.substr(1).toLowerCase();
    return `(?:${lower})|(?:${upper})|(?:${camel})`
};
