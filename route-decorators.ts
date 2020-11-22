import {HttpVerb} from "./http-verb";
import RouteTable from "./route-table";
import RouteConfig from "./route-config";
import {dQuote, dString, identifier, integer, sQuote, sString} from "./url-grammar";

// noinspection JSUnusedGlobalSymbols
export const routePrefix = (routePrefix: string) => (Class) => {
    const routeTable = Class.prototype.__routeTable__ as RouteTable;
    routeTable.setPrefix(prefixRegexOf(routePrefix));
};

// noinspection JSUnusedGlobalSymbols
export const GET = (route: string) => (proto: any, propertyKey: string) => {
    proto.__routeTable__ = proto.__routeTable__ || new RouteTable()
    const table = proto.__routeTable__ as RouteTable;
    const config = configOf(HttpVerb.HTTP_GET, route, propertyKey);
    table.add(config);
};

const configOf = (verb: HttpVerb, route: string, method: string): RouteConfig => {
    return {verb, regex: routeRegexOf(route), methodName: method};
};

const prefixRegexOf = (url: string): RegExp => {
    return new RegExp(`^/?${regexOf(url)}/?(.*)$`);
};

const routeRegexOf = (url: string): RegExp => {
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
