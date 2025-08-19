import express from "express";
import cors from "cors";
import indexRoutes from "./routes/index.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from './routes/user.routes.js'

const app = express();
app.use(cors());
app.use(express.json());

app.use(indexRoutes);
app.use(authRoutes);
app.use(userRoutes);


export default app;