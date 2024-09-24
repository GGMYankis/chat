import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatSoporte } from './chatsoporte';

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatSoporte]
})
export class ChatModule { }
