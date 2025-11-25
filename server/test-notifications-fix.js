// test-notifications-fix.js
import { enviarPush } from './src/utils/push.service.js';

async function test() {
  console.log('🧪 TESTEO DE NOTIFICACIONES CORREGIDAS');
  
  // 🔥 REEMPLAZA ESTO con un token REAL de tu app
  // Obtén el token de tu base de datos o de la app
  const testToken = 'ExponentPushToken[xxxxxxxxxxxxxx]';
  
  console.log('📱 Token de prueba:', testToken);
  
  const result = await enviarPush(
    testToken,
    '🔥 TEST - Notificaciones Corregidas',
    'Si ves esto, el fix funcionó! 🎉'
  );
  
  console.log('📋 Resultado del test:', result);
}

test();