import nodemailer from "nodemailer";
import { SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from '../db/config'

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true, 
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS, 
  },
});
