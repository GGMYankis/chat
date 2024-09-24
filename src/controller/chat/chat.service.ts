import { Injectable } from '@nestjs/common';
import { MessageDto } from './dto/message';
import { connectToDatabase } from 'src/db/Connection';
import * as sql from 'mssql';
import * as moment from 'moment';
@Injectable()
export class ChatService {

    //METODO PARA LA AUTENTICACION DE LOS USUARIOS 
    async saveMessage(messageDto: MessageDto) {

        const pool = await connectToDatabase();
        try {
            const result = await pool.request()
                .input('idUser', sql.Int, messageDto.idUser)
                .input('typeMessage', sql.Int, messageDto.typeMessage)
                .input('message', sql.VarChar(100), messageDto.message)
                .input('room', sql.VarChar(100), messageDto.room)
                .execute('sp_InsertMessage');

            return {
                status: true,
                value: result.recordset[0].InsertedMessageId,  // ID del mensaje insertado
                mensajeerror: null
            };

        } catch (err) {
            console.log(err.message)
            return {
                status: false,
                value: null,
                message: err.message
            }
        }
    }

    //METODO PARA LA AUTENTICACION DE LOS USUARIOS 
    async GetMessages(room: string) {

        const pool = await connectToDatabase();
        const query = `
           SELECT * FROM messages
           WHERE room = @room
          `;

        const result = await pool.request()
            .input('room', sql.VarChar, room)  // Parámetro de entrada
            .query(query);


        // Mapea el resultado al formato que necesitas
        const transformedMessages = result.recordset.map(message => ({
            date: moment(message.sendDate).format('hh:mm A'),  // Formateo de la hora usando moment.js
            idUser: message.idUser,
            message: message.message,  // El campo 'message' original
            type: "text",  // Siempre será de tipo "text" en tu ejemplo
        }));

        return transformedMessages;


    }
}



