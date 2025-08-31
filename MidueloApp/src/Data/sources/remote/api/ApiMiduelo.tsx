import axios from "axios";

const API_Miduelo = axios.create({
  baseURL: "https://192.168.1.72:3000/login",
  headers: {
    "Content-Type": "application/json",

  },
});

export {API_Miduelo};
