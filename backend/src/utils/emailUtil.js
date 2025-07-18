const nodemailer = require("nodemailer");
require("dotenv").config(); // Asegura que cargue las variables .env

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // ✅ mejor que usar "service: gmail"
    port: 465,
    secure: true, // true para 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const enviarCodigoVerificacion = async (correo, codigo) => {
    try {
        await transporter.sendMail({
            from: `"MiBodeguita" <${process.env.EMAIL_USER}>`,
            to: correo,
            subject: "Código de verificación de correo",
            text: `Tu código de verificación es: ${codigo}`,
            html: `<p>Tu código de verificación es: <strong>${codigo}</strong></p>`, // ✅ bonus
        });
        console.log(`📧 Código enviado a ${correo}`);
    } catch (error) {
        console.error("❌ Error al enviar el correo:", error);
        throw error;
    }
};

module.exports = { enviarCodigoVerificacion };