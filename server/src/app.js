import express from "express";
import cors from "cors";
import morgan from "morgan"; 
import indexRoutes from "./routes/index.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from './routes/user.routes.js'

const app = express();
//app.use(logger('dev'));
app.use(cors());
app.use(express.json());
//app.use(express.urlencode({
  //  extended: true

//}));

//app.disable('x-powered-by'); 

app.use(indexRoutes);
app.use(authRoutes);
app.use(userRoutes);



export default app;