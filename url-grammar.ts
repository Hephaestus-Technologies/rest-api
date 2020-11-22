export const identifier = "[a-zA-z_][a-zA-Z0-9_]*";

export const integer = "[+-]?[0-9]+";

export const sQuote = "%22";

export const dQuote = "%27";

export const sString = `(?:${sQuote}.*?${sQuote})`;

export const dString = `(?:${dQuote}.*?${dQuote})`;
