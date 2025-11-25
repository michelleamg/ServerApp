import { Expo } from 'expo-server-sdk';

// Crea una instancia de Expo
const expo = new Expo();

export async function enviarPush(token, title, body) {
  console.log("-------------------------------------------------");
  console.log("📱 Enviando notificación...");
  console.log("➡️ Token usado:", token);
  console.log("➡️ Título:", title);
  console.log("➡️ Cuerpo:", body);

  if (!token) {
    console.warn("⚠️ No se envió push porque token es null/undefined");
    console.log("-------------------------------------------------");
    return { error: "Token vacío" };
  }

  // Verifica que el token sea válido
  if (!Expo.isExpoPushToken(token)) {
    console.error("❌ Token de Expo inválido:", token);
    console.log("-------------------------------------------------");
    return { error: "Token de Expo inválido" };
  }

  try {
    const message = {
      to: token, // ✅ CORREGIDO: string individual, NO array
      sound: 'default',
      title: title || '🌿 Recordatorio',
      body: body || 'No olvides revisar tus actividades 💚',
      data: { 
        _displayInForeground: true,
        timestamp: new Date().toISOString()
      },
    };

    console.log("📦 Payload corregido:");
    console.log(JSON.stringify(message, null, 2));

    // ✅ Usa el SDK oficial de Expo
    const chunks = expo.chunkPushNotifications([message]);
    const tickets = [];
    
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log('✅ Tickets recibidos:', ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('❌ Error en chunk:', error);
      }
    }

    // Verifica los resultados
    if (tickets.length > 0) {
      const ticket = tickets[0];
      if (ticket.status === 'ok') {
        console.log('🎯 Notificación aceptada por Expo');
      } else if (ticket.status === 'error') {
        console.error('🚨 Error de Expo:', ticket.details?.error);
      }
    }

    return { tickets, success: true };

  } catch (error) {
    console.error('💥 Error crítico enviando push:', error);
    return { error: error.message };
  } finally {
    console.log("-------------------------------------------------");
  }
}