import app from "./app.js";
import { PORT } from "./config.js";

app.listen(PORT, '192.168.1.72'||'localhost' );
console.log("Server running on port " + PORT);