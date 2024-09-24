import * as sql from 'mssql';

export const sqlConfig: sql.config = {
    user: 'developer', // Usuario de tu base de datos
    password: 'developer_pwd#2024', // Contraseña de tu base de datos
    database: 'chat_soporte',
    server: 'DEVELOPER', // Cambia esto si no estás en un servidor local
    options: {
        encrypt: false, // Si no usas conexiones seguras (TLS/SSL), deja esto en false
        trustServerCertificate: true,
        enableArithAbort: false
    },
    pool: {
        max: 100,
        min: 0,
        idleTimeoutMillis: 300000,
    },
};
/* 
export const sqlConfig: sql.config = {
    user: 'db_aaabc4_enfasis_admin', // Usuario de tu base de datos
    password: 'enfasisdb2004', // Contraseña de tu base de datos
    database: 'db_aaabc4_enfasis',
    server: 'SQL8005.site4now.net', // Cambia esto si no estás en un servidor local
    options: {
        encrypt: false, // Si no usas conexiones seguras (TLS/SSL), deja esto en false
        trustServerCertificate: true,
        enableArithAbort: false
    },
    pool: {
        max: 100,
        min: 0,
        idleTimeoutMillis: 300000,
    },
}; */

export async function connectToDatabase() {
    try {
        return await sql.connect(sqlConfig);
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err);
    }
}
