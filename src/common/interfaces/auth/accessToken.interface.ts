import { EAccountType } from "@common/enums/accountType.enum"
import { ELoginType } from "@enums/loginType.enum"


export interface IAccessToken {
    id: string
    loginType: ELoginType,
    type: EAccountType,
    [key: string]: any
}