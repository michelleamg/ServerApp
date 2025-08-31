import axios from "axios";

const API_Miduelo = axios.create({
  baseURL: "https://192.168.1.72:3000/api",
  headers: {
    "Content-Type": "application/json",
    
  },
});

export default API_Miduelo;
