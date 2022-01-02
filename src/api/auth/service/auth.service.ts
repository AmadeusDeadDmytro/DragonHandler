import {Injectable} from "@nestjs/common";
import {SALT_ROUNDS} from "../../../configuration/user.config";
import {IUser} from "../../user/model/user.interface";
import {JwtService} from "@nestjs/jwt";

const bcrypt = require('bcrypt')

@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService
    ) {
    }

    async generateJwt(user: IUser): Promise<string> {
        return this.jwtService.signAsync({user})
    }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, SALT_ROUNDS);
    }

    async validatePassword(
        password: string,
        hashedPassword: string,
    ): Promise<any> {
        return bcrypt.compare(password, hashedPassword);
    }
}
