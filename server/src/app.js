import express from "express";
import cors from "cors";
import morgan from "morgan"; 
import indexRoutes from "./routes/index.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from './routes/user.routes.js'

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable('x-powered-by'); 

app.use(indexRoutes);
app.use(authRoutes);
app.use(userRoutes);


app.use ((err, req, res, next)=>{
    console.log(err);
    res.status(err.status|| 500).send(err.stack); 

} );



export default app;