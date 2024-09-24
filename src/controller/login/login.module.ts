import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'your-secret-key', // Cambia esto a una clave más segura
      signOptions: { expiresIn: '1h' }, // El token expirará en 1 hora
    }),
  ],
  controllers: [LoginController],
  providers: [LoginService]
})
export class LoginModule { }
