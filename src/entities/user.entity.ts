import { ELoginType } from "@enums/loginType.enum";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { RefreshTokenUser } from "./refreshTokenUser.entity";
import { EGender } from "@enums/gender.enum";

@Entity({ name: 'user' })
export class User {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id!: string;

    @Column({ type: 'timestamp', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column({ type: 'timestamp', name: 'updated_at', nullable: true })
    updatedAt!: Date;

    @Column({ type: 'timestamp', name: 'deleted_at', nullable: true })
    deletedAt!: Date;

    @Column({ type: 'varchar', length: 80, name: 'slug', nullable: true })
    slug!: string;

    @Column({ type: 'varchar', length: 80, name: 'name', nullable: true })
    name!: string;

    @Column({ type: 'varchar', length: 80, name: 'username', nullable: true })
    username!: string;

    @Column({ type: 'timestamp', name: 'dob', nullable: true })
    dob!: Date;

    @Column({ type: 'enum', enum: EGender, default: EGender.ORTHER, name: 'gender' })
    gender!: EGender;

    @Column({ type: 'varchar', name: 'phone', nullable: true })
    phone!: string;

    @Column({ type: 'varchar', name: 'email', nullable: true })
    email!: string;

    @Column({ type: 'varchar', name: 'password', nullable: true })
    password!: string;

    @Column({ type: 'enum', enum: ELoginType, default: ELoginType.INAPP, name: 'login_type' })
    loginType!: ELoginType;

    @Column({ type: 'varchar', name: 'avatar_url', nullable: true })
    avatarUrl!: string;

    @Column({ type: 'char', length: 40, name: 'ipv4', nullable: true })
    ipv4!: string;

    @OneToOne(() => RefreshTokenUser, (refreshTokenUser) => refreshTokenUser.user)
    refreshToken!: RefreshTokenUser;
}
