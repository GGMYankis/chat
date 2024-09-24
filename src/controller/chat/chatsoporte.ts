import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { MessageDto } from './dto/message';

@WebSocketGateway(81, {
    cors: { origin: '*' },
})
export class ChatSoporte
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    private waitingUsers: { [socketId: string]: { username: string, lastMessage: string, isAttended: boolean, idUser: number } } = {};
    private userRooms: { [socketId: string]: string[] } = {};
    private admins: Set<string> = new Set();

    constructor(
        private chatService: ChatService,
    ) { }
    afterInit(server: any) {
    }

    handleConnection(client: Socket) {
        client.emit('your_socket_id', client.id);
    }

    handleDisconnect(client: Socket) {
        const room = this.userRooms[client.id] || [];
        delete this.waitingUsers[client.id];
        this.updateWaitingUsers();
        if (room.length > 0) {
            this.server.to(room).emit('user_disconnected', room[0]);
            return;
        }
    }

    //METODO PARA  que EL USUARIO SOLICITE UN ADMINISTRADOR
    @SubscribeMessage('request_support')
    handleRequestSupport(client: Socket, { username, message, idUser }: { username: string, message: string; idUser: number }) {

        if (!this.waitingUsers[client.id]) {
            this.waitingUsers[client.id] = { username, lastMessage: message, isAttended: false, idUser };
            this.updateWaitingUsers();
        }
    }

    @SubscribeMessage('select_user')
    handleSelectUser(client: Socket, { userId, room, nameAdmin, date, idUser }: { userId: string, room: string, nameAdmin: string, date: string, idUser: number }) {
        // Asegurarse de que el admin abandone cualquier sala anterior
        const previousRoom = Array.from(client.rooms).find(r => r.startsWith('admin_room'));
        if (previousRoom) {
            client.leave(previousRoom);
        }

        client.join(room); // El admin se une a la nueva sala
        const userSocket = this.server.sockets.sockets.get(userId);

        if (userSocket) {
            userSocket.join(room); // El usuario se une a la misma sala
            userSocket.emit('start_chat', room, nameAdmin); // Notificar al usuario que el chat ha comenzado
            this.server.to(room).emit('new_message', { message: `Hola  soy ${nameAdmin} en que te puedo ayudar ?`, type: 'text', date, idUser });

            // Registrar la sala en la que está el usuario
            this.userRooms[userSocket.id] = this.userRooms[userSocket.id] || [];
            this.userRooms[userSocket.id].push(room);
            this.userRooms[client.id] = this.userRooms[client.id] || [];
            this.userRooms[client.id].push(room);
            delete this.waitingUsers[userId]; // Eliminar al usuario de la lista de espera     
            this.updateWaitingUsers();
        }
    }



    @SubscribeMessage('send_message')
    handleSendMessage(client: Socket, { room, message, idUser, type, date }: { room: string; message: string; idUser: number, type: string, date: string }) {
        console.log(message)
        const messageDto: MessageDto = {
            idUser: idUser,
            typeMessage: 1,
            message: message,
            room: room
        };

        this.chatService.saveMessage(messageDto);
        this.server.to(room).emit('new_message', { message, type, date, idUser });
    }

    //METODO PARA REGISTRAR A UNA ADMINISTRADOR
    @SubscribeMessage('admin_register')
    handleAdminRegister(client: Socket) {
        this.admins.add(client.id);
        this.updateWaitingUsers();
    }

    private updateWaitingUsers() {
        this.admins.forEach((adminId) => {
            const adminSocket = this.server.sockets.sockets.get(adminId);
            if (adminSocket) {
                adminSocket.emit('waiting_users', Object.entries(this.waitingUsers).map(([id, { username, lastMessage, idUser }]) => ({ id, username, lastMessage, idUser })));
            }
        });
    }


    @SubscribeMessage('leave_room')
    handleLeaveRoom(client: Socket, { room }: { room: string }) {
        client.leave(room);
    }

    @SubscribeMessage('typing')
    handleTyping(client: Socket, { room, isTyping }: { room: string; isTyping: boolean }) {
        client.to(room).emit('user_typing', { userId: client.id, isTyping });
    }



    @SubscribeMessage('leave_escribiendo')
    handleLLeaveTypingRoom(client: Socket, { room }: { room: string }) {
        this.server.to(room).emit('dejo_escribiendo');

    }

}
