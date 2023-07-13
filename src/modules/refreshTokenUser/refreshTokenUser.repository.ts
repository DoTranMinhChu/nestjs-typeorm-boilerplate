import { RefreshTokenUser } from "@entities/refreshTokenUser.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class RefreshTokenUserRepository {
    constructor(
        @InjectRepository(RefreshTokenUser)
        private refreshTokenUserRepository: Repository<RefreshTokenUser>,
    ) { }

    async findAndCountAll(): Promise<{ row: RefreshTokenUser[]; count: number }> {
        const [row, count] = await this.refreshTokenUserRepository.findAndCount();
        return { row, count };
    }

    async upsertById(refreshTokenUserCreateInput: RefreshTokenUser): Promise<RefreshTokenUser> {
        return await this.refreshTokenUserRepository.save(refreshTokenUserCreateInput);
    }

    async updateById(id: string, refreshTokenUserUpdateInput: RefreshTokenUser): Promise<RefreshTokenUser | null> {
        const refreshTokenUser = await this.refreshTokenUserRepository.findOne({ where: { id } });
        if (refreshTokenUser) {
            Object.assign(refreshTokenUser, refreshTokenUserUpdateInput);
            return await this.refreshTokenUserRepository.save(refreshTokenUser);
        }
        return null;
    }

    async updateMany(refreshTokenUserUpdateInput: RefreshTokenUser, query: any): Promise<any> {
        return await this.refreshTokenUserRepository.update(query, refreshTokenUserUpdateInput);
    }

    async create(refreshTokenUserCreateInput: any): Promise<RefreshTokenUser> {
        return await this.refreshTokenUserRepository.save(refreshTokenUserCreateInput);
    }

    async findOne(query?: any): Promise<RefreshTokenUser | null> {
        return await this.refreshTokenUserRepository.findOne(query);
    }

    async findMany(query?: any): Promise<RefreshTokenUser[]> {
        return await this.refreshTokenUserRepository.find(query);
    }

    async deleteById(id: string): Promise<RefreshTokenUser | null> {
        const refreshTokenUser = await this.refreshTokenUserRepository.findOne({ where: { id } });
        if (refreshTokenUser) {
            await this.refreshTokenUserRepository.remove(refreshTokenUser);
            return refreshTokenUser;
        }
        return null;
    }

    async deleteMany(refreshTokenUserWhereInput: any): Promise<any> {
        return await this.refreshTokenUserRepository.delete(refreshTokenUserWhereInput);
    }

    async findOneByUserId(userId: string): Promise<RefreshTokenUser | null> {
        return await this.refreshTokenUserRepository.findOne({ where: { userId } });
    }

    async findOneByRefreshToken(refreshToken: string): Promise<RefreshTokenUser | null> {
        return await this.refreshTokenUserRepository.findOne({ where: { refreshToken } });
    }

    async updateByUserId(userId: string, refreshTokenUserUpdateInput: any): Promise<RefreshTokenUser | null> {
        const refreshTokenUser = await this.refreshTokenUserRepository.findOne({ where: { userId } });
        if (refreshTokenUser) {
            Object.assign(refreshTokenUser, refreshTokenUserUpdateInput);
            return await this.refreshTokenUserRepository.save(refreshTokenUser);
        }
        return null;
    }
}
