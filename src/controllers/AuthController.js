const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Enlève les accents
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')     // Remplace espaces par -
    .replace(/[^\w-]+/g, '')  // Enlève caractères spéciaux
    .replace(/--+/g, '-');    // Évite doubles tirets
};

exports.register = async (req, res) => {

  
  try {
    const { email, password,category, userName, storeName, telephone, countryCode } = req.body;
    const fullPhone = countryCode + telephone;
    console.log(req.body);

   // 2. ⚡ GÉNÉRATION DU SLUG SOUVERAIN
    const baseSlug = slugify(storeName);
    

    const phoneSuffix = telephone.slice(-4); // On prend les 4 derniers chiffres
    const finalSlug = `${baseSlug}-${phoneSuffix}`;


    // 1. Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ $or: [{ email }, { userName }] });
    if (userExists) {
      return res.status(400).json({ message: "L'email ou le nom d'empire est déjà utilisé" });
    }

    // 2. Crypter le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Créer l'influenceuse
    const user = new User({
      email,
      password: hashedPassword,
      userName,
      storeName,
      fullPhone,
      countryCode,
      slug:finalSlug,
      category
    });

    await user.save();

    // 4. Générer le Token de connexion immédiate
    const token = jwt.sign({id:user._id,coachId:user._id , name: user.userName, role:"admin"}, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      message: "Empire créé avec succès ! 👑",
      token,
      user: { id: user._id, userName: user.userName, storeName: user.storeName }
    });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });
    }

    // 2️⃣ Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });
    }
  
  
    // 3️⃣ Générer le token JWT
    const token = jwt.sign(
      {id:user._id, coachId: user._id , name: user.userName, role:"admin"}, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' } // tu peux ajuster la durée
    );

    // 4️⃣ Répondre avec l'objet user et le token
    res.status(200).json({
      message: "Connexion réussie ! 👑",
      token,
      user: {
        id: user._id,
        userName: user.userName,
        storeName: user.storeName,
        email: user.email,
        whatsapp: user.whatsapp,
        countryCode: user.countryCode
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { slug } = req.params;
    const allowedFields = ['slogan','storeName', 'bioHtml','bio', 'avatar', 'banner', 'tiktok', 'currency', 'telephone'];
    const filteredData = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));

    const user = await User.findOneAndUpdate(
      { slug, _id: req.user.id },
      { $set: filteredData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Mise à jour impossible. Profil introuvable ou non autorisé. 🏰"
      });
    }

    res.status(200).json({
      success: true,
      message: "L'Empire a été mis à jour avec succès ! ✨",
      data: user
    });

  } catch (error) {
    console.error("Erreur Update :", error);
    res.status(500).json({ success: false, message: "Erreur serveur ❌" });
  }
};


exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id; // récupéré depuis le middleware auth (JWT)
    
    const user = await User.findById(userId).select('-password'); // on exclut le password
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    }

    // ⚡ On renvoie TOUTES les infos utiles
    res.status(200).json({
      success: true,
      data: user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};




// exports.facebookRedirect = (req, res) => {
//   const clientId = process.env.FB_APP_ID;
//   const redirectUri = encodeURIComponent(process.env.FB_REDIRECT_URI);
//   const scope = "email,public_profile";

//   const facebookUrl = `https://www.facebook.com/v16.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

//   res.redirect(facebookUrl);
// };


// exports.facebookCallback = async (req, res) => {
//   const code = req.query.code;
//   if (!code) return res.status(400).send("Code Facebook manquant");

//   try {
//     // 1️⃣ Échanger le code contre un access_token
//     const tokenRes = await axios.get(
//       "https://graph.facebook.com/v16.0/oauth/access_token",
//       {
//         params: {
//           client_id: process.env.FB_APP_ID,
//           client_secret: process.env.FB_APP_SECRET,
//           redirect_uri: process.env.FB_REDIRECT_URI,
//           code,
//         },
//       }
//     );

//     const accessToken = tokenRes.data.access_token;

//     // 2️⃣ Récupérer les infos utilisateur
//     const userRes = await axios.get("https://graph.facebook.com/me", {
//       params: {
//         fields: "id,name,email",
//         access_token: accessToken,
//       },
//     });

//     const fbUser = userRes.data;

//     // 3️⃣ Vérifier si l’utilisateur existe
//     let user = await User.findOne({ email: fbUser.email });
//     if (!user) {
//       user = new User({
//         userName: fbUser.name,
//         email: fbUser.email,
//         facebookId: fbUser.id,
//       });
//       await user.save();
//     }

//     // 4️⃣ Générer le JWT
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     // 5️⃣ Rediriger vers le frontend avec le token
//     const frontendUrl = `${process.env.FRONTEND_URL}/auth/facebook/success?token=${token}`;
//     res.redirect(frontendUrl);
//   } catch (err) {
//     console.error("Erreur Facebook Login:", err.message);
//     res.status(500).send("Erreur login Facebook");
//   }
// };


