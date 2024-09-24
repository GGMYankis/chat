import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login';
import { connectToDatabase } from 'src/db/Connection';
import * as sql from 'mssql';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LoginService {

    constructor(private jwtService: JwtService) { }

    //METODO PARA LA AUTENTICACION DE LOS USUARIOS 
    async login(loginDto: LoginDto) {

        const pool = await connectToDatabase();
        try {
            const result = await pool.request()
                .input('Email', sql.VarChar(100), loginDto.email)
                .input('Password', sql.VarChar(100), loginDto.password)
                .execute('sp_UserLogin');

            const user = result.recordset[0];
            const payload = { email: user.email, sub: user.id };
            const token = this.jwtService.sign(payload);

            return {
                status: true,
                token: token,
                value: result.recordset[0],
                message: ''
            }
        } catch (err) {
            return {
                status: false,
                value: null,
                message: err.message
            }
        }
    }

}
