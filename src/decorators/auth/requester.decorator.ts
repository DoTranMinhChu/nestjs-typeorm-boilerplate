import { EAccountType } from '@common/enums/accountType.enum';
import { ELoginType } from '@enums/loginType.enum';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface RequesterDTO {
    id: string,
    loginType: ELoginType,
    type: EAccountType
}
export const Requester = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.requester;
    },
);