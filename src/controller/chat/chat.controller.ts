import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
    constructor(
        private chatService: ChatService,
    ) { }

    @Get('GetMessages/:room')
    GetMessages(@Param('room') room: string) {
        return this.chatService.GetMessages(room);
    }


}
