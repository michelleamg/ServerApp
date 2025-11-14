import { Actividad } from "../models/actividadesModel.js";

export const getActividadesPorModulo = async (req, res) => {
  try {
    const { id_modulo } = req.params;

    if (!id_modulo) {
      return res.status(400).json({
        success: false,
        error: "El id_modulo es requerido"
      });
    }

    const actividades = await Actividad.getByModulo(id_modulo);

    return res.status(200).json({
      success: true,
      actividades
    });

  } catch (error) {
    console.error("Error getActividadesPorModulo:", error);
    return res.status(500).json({
      success: false,
      error: "Error al obtener actividades del módulo"
    });
  }
};
