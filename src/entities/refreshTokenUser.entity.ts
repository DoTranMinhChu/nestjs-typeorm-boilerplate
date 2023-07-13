import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: 'refresh_token_user' })
export class RefreshTokenUser {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id!: string;

    @Column({ type: 'timestamp', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column({ type: 'timestamp', name: 'updated_at', nullable: true })
    updatedAt!: Date;

    @Column({ type: 'timestamp', name: 'deleted_at', nullable: true })
    deletedAt!: Date;

    @Column({ type: 'varchar', name: 'refresh_token', nullable: true })
    refreshToken!: string;

    @OneToOne(() => User, (user) => user.refreshToken)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'varchar', unique: true, name: 'user_id' })
    userId!: string;
}
