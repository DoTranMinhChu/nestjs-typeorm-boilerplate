import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiQueryInfoPrisma, QueryInfoPrisma } from '@decorators/queryInfoPrisma/queryInfoPrisma.decorator';
import { QueryInfoPrismaDto } from '@decorators/queryInfoPrisma/queryInfoPisma.dto';

@ApiTags("User")
@Controller('api/v1/user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) { }

    @Get()
    @ApiQueryInfoPrisma()
    getHello(
        @QueryInfoPrisma() queryInfo: QueryInfoPrismaDto,
    ) {
        return this.userService.findAll(queryInfo);
    }
}
