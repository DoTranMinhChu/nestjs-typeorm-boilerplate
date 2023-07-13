import { User } from '@entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async findAndCountAll(): Promise<{ row: User[]; count: number }> {
        const [row, count] = await this.userRepository.findAndCount();
        return { row, count };
    }

    async upsertById(userCreateInput: User): Promise<User> {
        return await this.userRepository.save(userCreateInput);
    }

    async updateById(id: string, userUpdateInput: User): Promise<User | null> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (user) {
            Object.assign(user, userUpdateInput);
            return await this.userRepository.save(user);
        }
        return null;
    }

    async updateMany(userUpdateInput: any, query: any): Promise<any> {
        return await this.userRepository.update(query, userUpdateInput);
    }

    async create(userCreateInput: any): Promise<User> {
        return await this.userRepository.save(userCreateInput);
    }

    async findOne(query?: any): Promise<User | null> {
        return await this.userRepository.findOne(query);
    }

    async findMany(query?: any): Promise<User[]> {
        return await this.userRepository.find(query);
    }

    async deleteById(id: string): Promise<User | null> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (user) {
            await this.userRepository.remove(user);
        }
        return user;
    }

    async deleteMany(userWhereInput: any): Promise<any> {
        return await this.userRepository.delete(userWhereInput);
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { email } });
    }

    async findByUsername(username: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { username } });
    }
}
