// controllers/ConsentimientoController.js
import Consentimiento from '../models/consentimientoModel.js';

export const ConsentimientoController = {
  // Guardar consentimientos
  async saveConsentimientos(req, res) {
    try {
      const { id_paciente, aviso, terminos } = req.body;

      console.log("📥 Guardando consentimientos:", { id_paciente, aviso, terminos });

      if (!id_paciente || aviso === undefined || terminos === undefined) {
        return res.status(400).json({ 
          message: "Faltan datos: id_paciente, aviso y terminos son requeridos" 
        });
      }

      // Convertir a números (1 o 0) para MySQL
      const aviso_privacidad = aviso ? 1 : 0;
      const terminos_condiciones = terminos ? 1 : 0;

      const result = await Consentimiento.saveOrUpdate(
        id_paciente, 
        aviso_privacidad, 
        terminos_condiciones
      );

      console.log("✅ Consentimientos guardados para paciente:", id_paciente);

      return res.status(200).json({
        message: "Consentimientos guardados exitosamente",
        consentimientos: {
          aviso_privacidad: aviso_privacidad === 1,
          terminos_condiciones: terminos_condiciones === 1
        }
      });

    } catch (err) {
      console.error("❌ Error en saveConsentimientos:", err);
      return res.status(500).json({ 
        message: "Error al guardar consentimientos", 
        error: err.message 
      });
    }
  },

  // Obtener consentimientos por paciente
  async getConsentimientos(req, res) {
    try {
      const { id_paciente } = req.params;

      console.log("📥 Obteniendo consentimientos para paciente:", id_paciente);

      if (!id_paciente) {
        return res.status(400).json({ message: "id_paciente es requerido" });
      }

      const consentimientos = await Consentimiento.findByPacienteId(id_paciente);

      return res.status(200).json({
        consentimientos: consentimientos || {
          aviso_privacidad: false,
          terminos_condiciones: false
        }
      });

    } catch (err) {
      console.error("❌ Error en getConsentimientos:", err);
      return res.status(500).json({ 
        message: "Error al obtener consentimientos", 
        error: err.message 
      });
    }
  }
};