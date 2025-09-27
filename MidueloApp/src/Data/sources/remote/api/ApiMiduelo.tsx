import axios from "axios";

const API_Miduelo = axios.create({
  baseURL: "http://172.208.48.88:3000",
  headers: { "Content-Type": "application/json" }
});

API_Miduelo.post("/login", {
  email: '',
  password: ''
})
.then(res => {
  console.log("✅ Login:", res.data);
})
.catch(err => {
  console.error("Error en login:", err.response?.data || err.message);
});

API_Miduelo.post("/register", {
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  codigo_psicologo: '',
  telefono: '',
  email: '',
  password: ''
})
.then(res => {
  console.log("✅ Registro exitoso:", res.data);
})
.catch(err => {
  console.error("❌ Error en registro:", err.response?.data || err.message);
});



export {API_Miduelo};
