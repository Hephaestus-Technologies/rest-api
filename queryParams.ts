// noinspection JSUnusedGlobalSymbols
export default class QueryParams {

    private readonly _params: {[p: string]: string};

    constructor(params: {[p: string]: string}) {
        this._params = params;
    }

    public getString(key: string): string {
        return this._params[key];
    }

    public getNumber(key: string): number {
        return Number(this._params[key]);
    }

    public getBool(key: string): boolean {
        return Boolean(this._params[key]);
    }

    public getEnum<EnumType extends number>(key: string): EnumType {
        return Number(this._params[key]) as EnumType;
    }

}
