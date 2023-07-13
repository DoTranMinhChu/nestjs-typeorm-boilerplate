
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { QueryInfoPrismaDto } from '@decorators/queryInfoPrisma/queryInfoPisma.dto';


@Injectable()
export class UserService {
    constructor(private userRepository: UserRepository) { }

    async findAll(queryInfo: QueryInfoPrismaDto) {
        return await this.userRepository.findMany(queryInfo);
    }
}