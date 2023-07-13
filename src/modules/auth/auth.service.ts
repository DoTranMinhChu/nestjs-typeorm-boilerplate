
import { EAccountType } from '@common/enums/accountType.enum';
import { IAccessToken } from '@common/interfaces/auth/accessToken.interface';
import { LoginInAppRequest } from '@common/requests/auth/loginInApp.request';
import { LoginSNSRequest } from '@common/requests/auth/loginSNS.request';
import { RegisterInAppRequest } from '@common/requests/auth/registerInApp.request';
import { LoginResponse } from '@common/responses/auth/login.response';
import { BcryptUtil } from '@common/utils/bcrypt.util';
import { TokenUtil } from '@common/utils/token.util';
import { RequesterDTO } from '@decorators/auth/requester.decorator';
import { User } from '@entities/user.entity';
import { ELoginType } from '@enums/loginType.enum';
import { BadRequestException } from '@exceptions/badRequest.exception';
import { EXCEPTION } from '@exceptions/exception';
import { NotFoundException } from '@exceptions/notFound.exception';
import { GoogleService } from '@modules/google/google.service';
import { RefreshTokenUserRepository } from '@modules/refreshTokenUser/refreshTokenUser.repository';
import { UserRepository } from '@modules/user/user.repository';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';


@Injectable()
export class AuthService {
    constructor(
        private readonly googleService: GoogleService,
        private readonly userRepository: UserRepository,
        private readonly configService: ConfigService,
        private readonly refreshTokenUserRepository: RefreshTokenUserRepository
    ) { }

    async userRegisterInApp(
        registerRequest: RegisterInAppRequest
    ): Promise<LoginResponse> {
        const reqLogin: LoginInAppRequest = {
            ...registerRequest,
        };
        const existedUser = await this.userRepository.findByUsername(
            registerRequest.username
        );

        if (existedUser) {
            throw new BadRequestException(
                EXCEPTION.USERNAME_ALREADY_REGISTERED
            );
        }
        reqLogin.password = await BcryptUtil.hashData(registerRequest.password);
        await this.userRepository.create(reqLogin);

        return await this.userLoginInApp({
            ...reqLogin,
            password: registerRequest.password,
        });
    }


    async userLoginInApp(reqLogin: LoginInAppRequest): Promise<LoginResponse> {
        const { username, password } = reqLogin;
        if (!username || !password) {
            throw new BadRequestException();
        }
        let user = await this.userRepository.findOne({
            where: {
                username,
            },
        });
        if (!user) {
            throw new NotFoundException(
                EXCEPTION.USERNAME_DOES_NOT_EXIST
            );
        }
        if (user.loginType != ELoginType.INAPP) {
            switch (user.loginType) {
                case ELoginType.GOOGLE: {
                    throw new BadRequestException(
                        EXCEPTION.THIS_ACCOUNT_IS_GOOGLE
                    );
                }
                case ELoginType.APPLE: {
                    throw new BadRequestException(
                        EXCEPTION.THIS_ACCOUNT_IS_APPLE
                    );
                }
                case ELoginType.KAKAO: {
                    throw new BadRequestException(
                        EXCEPTION.THIS_ACCOUNT_IS_KAKAOTALK
                    );
                }
            }
        }

        if (!(await BcryptUtil.compareDataWithHash(password, user?.password!!))) {
            throw new NotFoundException(
                EXCEPTION.PASSWORD_OR_USERNAME_INCORRECT
            );
        }
        const accessTokenPayload: IAccessToken = {
            id: user?.id!,
            loginType: user?.loginType!,
            type: EAccountType.USER,
        };

        return {
            accessToken: await this.generateAccessToken(accessTokenPayload),
            refreshToken: await this.generateRefreshTokenUser(accessTokenPayload.id),
        };
    }

    async userLoginSNS(loginSnsRequest: LoginSNSRequest & { ipv4?: string }): Promise<LoginResponse> {

        const { loginType, token, ipv4 } = loginSnsRequest;
        let isNewSignup = false;
        let url: string;
        let response: any = {};
        let dataFromSocial: any = {};
        let username = null;
        let name = null;
        let avatarUrl = null;
        let email = null;
        let dob = null;
        let phone = null;
        switch (loginType) {
            case ELoginType.GOOGLE:
                const payload = await this.googleService.getUserInfoWithAccessToken(token);
                email = payload.email;
                username = email;
                avatarUrl = payload.picture;
                name = payload.name;
                break;
            case ELoginType.FACEBOOK:
                url = `https://graph.facebook.com/me?access_token=${token}&fields=id,name,picture.width(300).height(300)`;
                response = await axios.get(url);
                dataFromSocial = response.data;
                username = dataFromSocial.id;
                name = dataFromSocial.name;
                avatarUrl = dataFromSocial.picture.data.url;
                break;
            case ELoginType.APPLE:
                url = "com.chu.appname";
                username = dataFromSocial.email;
                email = dataFromSocial.email;
                break;
            case ELoginType.PHONE:
                //dataFromSocial = await firebaseService.verifyIdToken(token);
                username = dataFromSocial.phone_number;
                phone = dataFromSocial.phone_number;
                break;

            default:
                throw new BadRequestException(
                    EXCEPTION.LOGIN_METHOD_NOT_SUPPORTED
                );
                break;
        }
        let user: User | null = await this.userRepository.findOne({
            where: {
                loginType,
                username,
            },
        });
        if (!user) {
            const body: any = {
                name,
                username,
                email,
                avatarUrl,
                loginType,
                dob,
                phone,
                ipv4
            };
            user = await this.userRepository.create(body);
            isNewSignup = true;
        }

        const accessTokenPayload: IAccessToken = {
            id: user.id,
            loginType: user.loginType,
            type: EAccountType.USER,
        };

        return {
            accessToken: await this.generateAccessToken(accessTokenPayload),
            refreshToken: await this.generateRefreshTokenUser(accessTokenPayload.id),
            isNewSignup,
        };

    }

    async generateAccessToken(accessTokenPayload: IAccessToken): Promise<string> {
        return await TokenUtil.generateToken(accessTokenPayload, {
            exp: "60 days",
            secret: this.configService.get("server.secret") || "secret"
        });
    }

    async generateRefreshTokenUser(userId: string): Promise<string> {
        const refreshTokenUser = await this.refreshTokenUserRepository.findOneByUserId(
            userId
        );
        if (refreshTokenUser) {
            try {
                TokenUtil.decodeToken(refreshTokenUser.refreshToken!!);
                return refreshTokenUser.refreshToken!!;
            } catch (e) {
                const refreshToken = await TokenUtil.generateToken(
                    {},
                    { exp: "1 years" }
                );
                const newRefreshTokenAdmin =
                    await this.refreshTokenUserRepository.updateByUserId(userId, {
                        refreshToken
                    });
                return newRefreshTokenAdmin?.refreshToken!!;
            }
        }
        const refreshToken = await TokenUtil.generateToken(
            {},
            {
                exp: "1 years",
                secret: this.configService.get("server.secret") || "secret"
            }
        );

        const newRefreshTokenUser = await this.refreshTokenUserRepository.create({
            userId,
            refreshToken,
        });
        return newRefreshTokenUser.refreshToken!!;
    }

    async getInfo(requester: RequesterDTO) {
        return await this.userRepository.findOne({
            where: {
                id: requester.id
            }
        })
    }
}