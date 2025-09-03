// app.js
import express from "express";
import cors from "cors";
import morgan from "morgan"; 
// importa tus rutas
import indexRoutes from "./routes/index.routes.js";
import authRoutes from "./routes/auth.routes.js";


const app = express(); // inicializar app

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.disable("x-powered-by"); 

// Rutas
app.use(authRoutes); // sin /api/auth
app.use(indexRoutes);
//app.use(authRoutes);
//app.use(userRoutes);

// Manejo de errores


export default app;
