export interface User {
    id?:               number;
    nombre:           string;
    apellido_paterno: string;
    apellido_materno: string;
    fecha_nacimiento: string;
    telefono:         string;
    email:            string;
    password:         string;
    codigo_psicologo: string;
    sesion_token?:   string;
    creado_en?:      string;
    actualizado_en?: string;
}