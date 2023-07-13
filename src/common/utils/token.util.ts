
import jsonwebtoken from "jsonwebtoken"

import { IAccessToken } from "@common/interfaces/auth/accessToken.interface";


export interface IGenerateTokenOption {
    exp?: string;
    secret?: string;
}
export interface IDecodeTokenOption {
    secret?: string;
}


export interface IToken {
    payload: any
    exp: Date
    option?: IGenerateTokenOption | unknown | undefined
}

export class TokenUtil {
    constructor() { }
    static async generateToken(
        payload: any,
        option: IGenerateTokenOption = {
            exp: "60 days",
            secret: "secret"
        }
    ) {
        const secret: string = option.secret || "secret";

        return jsonwebtoken.sign(payload, secret, { expiresIn: option.exp })
    }
    static decodeToken(token: string, option?: IDecodeTokenOption): IAccessToken | undefined {
        try {
            const secret = (option && option.secret) || "secret";
            return jsonwebtoken.verify(token, secret).valueOf() as IAccessToken;
        } catch (err) {
            // throw errorService.auth.badToken();
            return undefined
        }

    }

}
