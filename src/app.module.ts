import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginModule } from './controller/login/login.module';
import { ChatModule } from './controller/chat/chat.module';


@Module({
  imports: [LoginModule, ChatModule],
  controllers: [AppController,],
  providers: [AppService],
})
export class AppModule { }
