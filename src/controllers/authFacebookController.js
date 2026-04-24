const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // ton modèle MongoDB
require("dotenv").config();

exports.facebookRedirect = (req, res) => {
  const clientId = process.env.FB_APP_ID;
  const redirectUri = encodeURIComponent(process.env.FB_REDIRECT_URI);
  const scope = "email,public_profile";

  const facebookUrl = `https://www.facebook.com/v16.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

  res.redirect(facebookUrl);
};

exports.facebookCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Code Facebook manquant");

  try {
    // 1️⃣ Échanger le code contre un access_token
    const tokenRes = await axios.get(
      "https://graph.facebook.com/v16.0/oauth/access_token",
      {
        params: {
          client_id: process.env.FB_APP_ID,
          client_secret: process.env.FB_APP_SECRET,
          redirect_uri: process.env.FB_REDIRECT_URI,
          code,
        },
      }
    );

    const accessToken = tokenRes.data.access_token;

    // 2️⃣ Récupérer les infos utilisateur
    const userRes = await axios.get("https://graph.facebook.com/me", {
      params: {
        fields: "id,name,email",
        access_token: accessToken,
      },
    });

    const fbUser = userRes.data;

    // 3️⃣ Vérifier si l’utilisateur existe
    let user = await User.findOne({ email: fbUser.email });
    if (!user) {
      user = new User({
        userName: fbUser.name,
        email: fbUser.email,
        facebookId: fbUser.id,
      });
      await user.save();
    }

    // 4️⃣ Générer le JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 5️⃣ Rediriger vers le frontend avec le token
    const frontendUrl = `${process.env.FRONTEND_URL}/auth/facebook/success?token=${token}`;
    res.redirect(frontendUrl);
  } catch (err) {
    console.error("Erreur Facebook Login:", err.message);
    res.status(500).send("Erreur login Facebook");
  }
};
