import pool from "../db/db.js";
import { encryptMessage, decryptMessage } from "../utils/cryptoUtils.js";

export const ForoMensajeModel = {
  // 📥 Obtener mensajes (descifra si aplica, tolera mensajes antiguos)
  async getByTema(id_tema) {
    const [rows] = await pool.query(
      `
      SELECT 
        mf.id_mensaje_foro,
        mf.id_tema,
        mf.tipo_usuario,
        mf.id_paciente,
        mf.id_psicologo,
        mf.contenido,
        mf.fecha_envio AS fecha_creacion,  -- ✅ ALIAS para compatibilidad con frontend
        COALESCE(p.nombre, ps.nombre) AS autor_nombre,
        COALESCE(p.apellido, ps.apellido) AS autor_apellido  -- ✅ AGREGADO
      FROM mensaje_foro mf
      LEFT JOIN paciente p ON p.id_paciente = mf.id_paciente
      LEFT JOIN psicologo ps ON ps.id_psicologo = mf.id_psicologo
      WHERE mf.id_tema = ?
      ORDER BY mf.fecha_envio ASC;
      `,
      [id_tema]
    );

    console.log(`📩 Mensajes obtenidos del tema ${id_tema}:`, rows.length);

    // ✅ Procesar y descifrar
    return rows.map((msg) => {
        let contenidoDescifrado = "[Mensaje ilegible]";
        try {
            const texto = msg.contenido || ""; // evita null
            if (texto && texto.includes(":")) {
              contenidoDescifrado = decryptMessage(texto);
            } else {
              contenidoDescifrado = texto || "[Mensaje vacío]";
            }
        } catch (err) {
            console.error("⚠️ Error al descifrar mensaje:", err.message);
            contenidoDescifrado = msg.contenido || "[Mensaje ilegible]";
        }

        // ✅ Formato compatible con el frontend
        return {
            id_mensaje: msg.id_mensaje_foro,  // ✅ Frontend espera 'id_mensaje'
            id_tema: msg.id_tema,
            id_paciente: msg.id_paciente,
            id_psicologo: msg.id_psicologo,
            tipo_usuario: msg.tipo_usuario,
            contenido: contenidoDescifrado,
            fecha_creacion: msg.fecha_creacion,  // ✅ Ya está con alias
            autor_nombre: msg.autor_nombre && msg.autor_apellido 
              ? `${msg.autor_nombre} ${msg.autor_apellido}` 
              : msg.autor_nombre || 'Usuario',
        };
    });
  },

  // 📤 Crear mensaje cifrado
  async create({ id_tema, tipo_usuario, id_paciente, id_psicologo, contenido }) {
    try {
      console.log("📤 Creando mensaje cifrado:", { id_tema, tipo_usuario });

      // Cifrar antes de guardar
      const contenidoCifrado = encryptMessage(contenido);

      const [res] = await pool.query(
        `
        INSERT INTO mensaje_foro 
          (id_tema, tipo_usuario, id_paciente, id_psicologo, contenido, fecha_envio)
        VALUES (?, ?, ?, ?, ?, NOW())
        `,
        [id_tema, tipo_usuario, id_paciente, id_psicologo, contenidoCifrado]
      );

      console.log("✅ Mensaje creado con ID:", res.insertId);

      // ✅ Obtener el mensaje completo con datos del autor
      const [newMessage] = await pool.query(
        `
        SELECT 
          mf.id_mensaje_foro,
          mf.id_tema,
          mf.tipo_usuario,
          mf.id_paciente,
          mf.id_psicologo,
          mf.contenido,
          mf.fecha_envio AS fecha_creacion,
          COALESCE(p.nombre, ps.nombre) AS autor_nombre,
          COALESCE(p.apellido, ps.apellido) AS autor_apellido
        FROM mensaje_foro mf
        LEFT JOIN paciente p ON p.id_paciente = mf.id_paciente
        LEFT JOIN psicologo ps ON ps.id_psicologo = mf.id_psicologo
        WHERE mf.id_mensaje_foro = ?
        `,
        [res.insertId]
      );

      const mensaje = newMessage[0];

      // ✅ Retornar en formato compatible con frontend
      return {
        id_mensaje: mensaje.id_mensaje_foro,
        id_tema: mensaje.id_tema,
        tipo_usuario: mensaje.tipo_usuario,
        id_paciente: mensaje.id_paciente,
        id_psicologo: mensaje.id_psicologo,
        contenido: contenido, // ✅ Texto plano para mostrar al frontend (SIN cifrar)
        fecha_creacion: mensaje.fecha_creacion,
        autor_nombre: mensaje.autor_nombre && mensaje.autor_apellido 
          ? `${mensaje.autor_nombre} ${mensaje.autor_apellido}` 
          : mensaje.autor_nombre || 'Usuario',
      };
    } catch (error) {
      console.error("❌ Error creando mensaje cifrado:", error);
      throw error;
    }
  },
};