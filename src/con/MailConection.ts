import SMTPTransport = require("nodemailer/lib/smtp-transport");
import nodemailer from "nodemailer";
import { Callbk, Callvar } from "../config/const";

export default class MailConection {
  private mailTransport() {
    return nodemailer.createTransport({
      host: <string>process.env.MAILER_HOST,
      secureConnection: process.env.MAILER_SECURE_CONECTION,
      port: process.env.MAILER_PORT,
      auth: {
        user: process.env.CLIENT_MESSAGES_SENDER_MAIL,
        pass: process.env.CLIENT_MESSAGES_SENDER_PASSWORD
      },
      tls: {
        ciphers: <string>process.env.MAILER_TLS_CIPHERS
      }
    } as SMTPTransport.Options);
  }

  private sendMyMailPlease(email: string, message: string, callback: Callbk) {
    const mailer = this.mailTransport();

    const mailOptions = {
      from: `Aeduca <${process.env.CLIENT_MESSAGES_SENDER_MAIL}>`,
      to: email,
      subject: "Tu plataforma virtual te ha enviado un mensaje",
      html: message
    };

    mailer.sendMail(mailOptions, callback);
  }

  public sendRecoverPassword(newcode: string, email: string, callback: Callvar): void {
    const myMessage = `
          <div>
            <h3>Aeduca 3.0 - mensaje de seguridad<h3/>
            <p>
               ¡Hola! Has solicitado la recuperación de tu clave de acceso a tu aula virtual. 
                Aqui te enviamos tu nueva contraseña: ${newcode}
            <p/>
            <hr/>
            <i>
              Por seguridad, elimina este mensaje despues de cambiar tu contraseña. Si no fuiste tu comunicate con el soporte. 
            <i/>
          </div>
        `;

    this.sendMyMailPlease(email, myMessage, callback);
  }

  public sendVerificationCode(code: string, email: string, callback: Callvar): void {
    const myMessage = `
          <div>
            <h3>Aeduca 3.0 - ¡Hola! Has solicitado cambiar tu correo anterior por este<h3/>
            <p>
              Por ello te hemos enviado el siguiente código de verificación: ${code}.
            <p/>
            <hr/>
            <i>
            Si no fuiste tu omite este mensaje
            <i/>
          </div>
        `;

    this.sendMyMailPlease(email, myMessage, callback);
  }
}
