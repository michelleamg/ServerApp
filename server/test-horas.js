console.log('🕐 DIAGNÓSTICO DE HORAS');

const ahoraServidor = new Date();
console.log('⏰ Hora del servidor:', ahoraServidor.toString());

const horaMX = new Intl.DateTimeFormat("es-MX", {
  timeZone: "America/Mexico_City",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
}).format(new Date());

console.log('🇲🇽 Hora MX (formato CRON):', horaMX);

const mysql = require('mysql2/promise');

async function verificarRecordatorios() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root', 
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'miduelo'
    });

    console.log('\n🔍 BUSCANDO RECORDATORIOS PARA HORA ACTUAL:', horaMX);
    
    const [rows] = await connection.execute(
      `SELECT r.id_paciente, r.hora, t.push_token
       FROM paciente_recordatorios r
       LEFT JOIN paciente_push_tokens t ON r.id_paciente = t.id_paciente
       WHERE TIME_FORMAT(r.hora, '%H:%i') = ?`,
      [horaMX]
    );

    console.log(`📋 Recordatorios encontrados para ${horaMX}:`, rows.length);
    
    if (rows.length > 0) {
      console.log('🎯 Detalles:', rows);
    } else {
      console.log('❌ No hay recordatorios para esta hora');
      
      const [todos] = await connection.execute(
        'SELECT id_paciente, hora FROM paciente_recordatorios ORDER BY hora'
      );
      console.log('📅 TODOS los recordatorios en BD:');
      console.log(todos);
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verificarRecordatorios();