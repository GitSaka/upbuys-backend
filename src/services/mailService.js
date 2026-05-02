// src/services/mailService.js
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendWelcomeEmail = async (email, customerName, courseTitle, loginUrl) => {
  try {
    await resend.emails.send({
      from: 'UpBuys <onboarding@resend.dev>', // Plus tard, tu mettras contact@upbuys.com
      to: email,
      subject: `Félicitations ! Accès débloqué : ${courseTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
          <h1 style="color: #7c3aed; font-style: italic;">Félicitations ${customerName} ! 👑</h1>
          <p>Ton investissement est validé. Tu as maintenant accès à la formation : <strong>${courseTitle}</strong>.</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${loginUrl}" style="background-color: #000; color: #fff; padding: 15px 25px; text-decoration: none; border-radius: 12px; font-weight: bold; text-transform: uppercase; font-size: 12px;">
              Accéder à mon espace membre
            </a>
          </div>

          <p style="font-size: 12px; color: #9ca3af;">Si tu as un problème d'accès, contacte directement le coach sur WhatsApp.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 10px; color: #d1d5db; text-align: center;">Propulsé par UpBuys - Ton Empire Digital</p>
        </div>
      `
    });
    console.log("Mail de bienvenue envoyé à", email);
  } catch (error) {
    console.error("Erreur envoi mail :", error);
  }
};
