const Fan = require('../models/Fan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

// src/controllers/fanController.js
const generateToken = (fan) => {
  return jwt.sign(
    {
      id: fan._id,
      phoneNumber: fan.phoneNumber
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.verifyOTP = async (req, res) => {
  try {
    
    const { phoneNumber, otpCode } = req.body;

    // 1. Trouver le fan
    const fan = await Fan.findOne({ phoneNumber });
    
    if (!fan) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // 2. Comparer le code
    if (fan.otpCode === otpCode) {
      // ✅ SUCCESS : Le code est bon
      // fan.otpCode = null; // On efface le code pour qu'il ne soit plus réutilisable
      await fan.save();
      // En 2026, on génère ici un Token JWT pour que l'utilisateur reste connecté
       // 🎟️ Génération du token
      const token = generateToken(fan);
      res.status(200).json({ 
        message: "Connexion réussie !", 
        success: true,
        token,
        fan: {
          id: fan._id,
          phoneNumber: fan.phoneNumber
        }
      });
    } else {
      // ❌ ERREUR : Mauvais code
      res.status(400).json({ message: "Code incorrect. Réessayez." });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.registerOrLogin = async (req, res) => {
  try {
    const { phoneNumber, countryCode,name} = req.body;
    const fullNumber = countryCode + phoneNumber;
    

        if (!phoneNumber || !countryCode) {
        return res.status(400).json({
            message: "Numéro de téléphone invalide"
        });
        }

    // 1. Chercher si le fan existe déjà
    let fan = await Fan.findOne({ phoneNumber: fullNumber });

    if (fan) {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        console.log(otp)
            // fan.otpExpiresAt = Date.now() + 5 * 60 * 1000; // 5 min
      // CAS : DÉJÀ INSCRIT -> On simule l'envoi d'un code OTP
      //const fakeOTP = "1234"; // En 2026, on générera un vrai code ici
      fan.otpCode = otp;
      await fan.save();

      return res.status(200).json({ 
        status: "EXISTING_USER", 
        message: "Bon retour ! Code envoyé sur WhatsApp.",
        phoneNumber: fullNumber 
      });
    }

    // CAS : NOUVEAU -> Inscription automatique
    fan = new Fan({ phoneNumber: fullNumber, countryCode });
    await fan.save();
    const token = generateToken(fan);
    res.status(201).json({ 
      status: "NEW_USER", 
      message: "Bienvenue dans l'Empire !", 
      fan,
      token
    });

  } catch (error) {
    res.status(500).json({ message: "Erreur", error: error.message });
  }
};



// --- FONCTION 1 : LE RADAR (Appelé par handleCheckPhone) ---
// exports.authCheck = async (req, res) => {
//   try {
//     const { phoneNumber, countryCode, coachSlug, coachId } = req.body;

//     const fullPhone = countryCode + phoneNumber;

//     let coach;

//     if (coachId) {
//       coach = await User.findById(coachId);
//     } else if (coachSlug) {
//       coach = await User.findOne({ slug: coachSlug });
//     }

//     if (!coach) {
//       return res.status(404).json({ message: "Coach introuvable" });
//     }

//     // 🔥 Recherche par (phone + coach)
//     const fan = await Fan.findOne({
//       phoneNumber: fullPhone,
//       coachId: coach._id
//     });

//     if (!fan) {
//       return res.status(200).json({ action: "NEED_INFO" });
//     } else {
//       return res.status(200).json({ action: "NEED_PASSWORD" });
//     }

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

exports.authCheck = async (req, res) => {
  try {

    
    const { identifier, type, countryCode, coachId } = req.body;
    
    // On initialise la base de la requête avec le coach
    let query = { coachId: coachId };
    
    if (type === 'EMAIL') {
      // .trim() est crucial pour éviter les espaces invisibles
      query.email = identifier.trim().toLowerCase();
    } else {
      // Nettoyage : On enlève les espaces du countryCode et du numéro
      const cleanCode = countryCode.trim();
      const cleanPhone = identifier.trim();
      query.phoneNumber = cleanCode + cleanPhone;
    }

    console.log("🔍 Recherche avec la requête :", query); // Debugging

    const fan = await Fan.findOne(query);

    if (!fan) {
      return res.status(200).json({ action: "NEED_INFO" });
    } else {
      return res.status(200).json({ action: "NEED_PASSWORD" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// --- FONCTION 2 : LE MOTEUR (Appelé par handleFinalAuth) ---
// exports.handleAuth = async (req, res) => {
//   try {
//     const {
//       phoneNumber,
//       countryCode,
//       name,
//       password,
//       isExistingUser,
//       coachSlug,
//       coachId
//     } = req.body;

//     const fullPhone = countryCode + phoneNumber;

//     // =========================
//     // 🔎 1️⃣ Trouver le coach
//     // =========================
//     let coach;

//     if (coachId) {
//       coach = await User.findById(coachId);
//     } else if (coachSlug) {
//       coach = await User.findOne({ slug: coachSlug });
//     }

//     if (!coach) {
//       return res.status(404).json({ message: "Coach introuvable" });
//     }

//     // =========================
//     // 🔐 2️⃣ CAS LOGIN
//     // =========================
//     if (isExistingUser) {

//       // 🔥 Recherche par (phone + coach)
//       const fan = await Fan.findOne({
//         phoneNumber: fullPhone,
//         coachId: coach._id
//       }).select("password coachId name");
      
//       if (!fan) {
//         return res.status(404).json({ message: "Compte introuvable dans cet empire" });
//       }

//       const isMatch = await bcrypt.compare(password, fan.password);
      
//       if (!isMatch) {
//         return res.status(401).json({ message: "Mot de passe incorrect" });
//       }

//       const token = jwt.sign(
//         {
//           id: fan._id,
//           coachId: coach._id,
//           name: fan.name,
//           role:'fan'
//         },
//         process.env.JWT_SECRET,
//         { expiresIn: "30d" }
//       );

//       return res.status(200).json({
//         success: true,
//         token,
//         fanName: fan.name,
//         tel: phoneNumber,
//         id: fan._id
//       });
//     }

//     // =========================
//     // 🆕 3️⃣ CAS REGISTER
//     // =========================
//     else {

//       // 🔥 Vérifie si le numéro existe déjà DANS CET EMPIRE
//       const existingFan = await Fan.findOne({
//         phoneNumber: fullPhone,
//         coachId: coach._id
//       });

//       if (existingFan) {
//         return res.status(400).json({
//           message: "Ce numéro est déjà utilisé dans cet empire"
//         });
//       }

//       const hashedPassword = await bcrypt.hash(password, 10);

//       const newFan = new Fan({
//         name,
//         phoneNumber: fullPhone,
//         password: hashedPassword,
//         status: "Prospect",
//         coachId: coach._id
//       });

//       await newFan.save();

//       const token = jwt.sign(
//         {
//           id: newFan._id,
//           coachId: coach._id,
//           name: newFan.name,
//           role:'fan'
//         },
//         process.env.JWT_SECRET,
//         { expiresIn: "30d" }
//       );

//       return res.status(201).json({
//         success: true,
//         token,
//         fanName: name,
//         tel: phoneNumber,
//         id: newFan._id
//       });
//     }

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

exports.handleAuth = async (req, res) => {
  try {
    const { identifier, type, countryCode, name, email, password, isExistingUser, coachId } = req.body;

    // 1. Définir l'identifiant de recherche (FullPhone ou Email)
    const searchIdentifier = type === 'EMAIL' ? identifier.toLowerCase() : countryCode + identifier;
    const searchField = type === 'EMAIL' ? 'email' : 'phoneNumber';

    // 2. CAS LOGIN
    if (isExistingUser) {
      const fan = await Fan.findOne({ [searchField]: searchIdentifier, coachId });
      
      if (!fan) return res.status(404).json({ message: "Compte introuvable" });

      const isMatch = await bcrypt.compare(password, fan.password);
      if (!isMatch) return res.status(401).json({ message: "Mot de passe incorrect" });

      const token = jwt.sign({ id: fan._id, coachId, name: fan.name, role: 'fan' }, process.env.JWT_SECRET, { expiresIn: "30d" });

      return res.status(200).json({ success: true, token, fanName: fan.name, id: fan._id });
    } 

    // 3. CAS REGISTER
    else {
      // Vérifier si l'utilisateur existe déjà sous l'une des deux formes
      const existing = await Fan.findOne({
        coachId,
        $or: [
          { email: type === 'EMAIL' ? identifier.toLowerCase() : email.toLowerCase() },
          { phoneNumber: type === 'PHONE' ? searchIdentifier : undefined }
        ].filter(Boolean)
      });

      if (existing) return res.status(400).json({ message: "Cet email ou numéro est déjà utilisé ici" });

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newFan = new Fan({
        name,
        // On s'assure d'avoir TOUJOURS l'email pour les futurs paiements
        email: type === 'EMAIL' ? identifier.toLowerCase() : email.toLowerCase(),
        phoneNumber: type === 'PHONE' ? searchIdentifier : null,
        countryCode: type === 'PHONE' ? countryCode : null,
        password: hashedPassword,
        status: "Prospect",
        coachId
      });

      await newFan.save();

      const token = jwt.sign({ id: newFan._id, coachId, name: newFan.name, role: 'fan' }, process.env.JWT_SECRET, { expiresIn: "30d" });

      return res.status(201).json({ success: true, token, fanName: name, id: newFan._id });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateMe = async (req, res) => {
  try {
    const fanId = req.user.id;
    const coachId = req.user.coachId;

    const allowedFields = ["name", "email", "city", "avatar"];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedFan = await Fan.findByIdAndUpdate(
       { _id: fanId, coachId: coachId },
      updates,
      { new: true, runValidators: true }
    ).select("-password -otpCode");

    res.status(200).json({
      success: true,
      data: updatedFan
    });

  } catch (error) {
    console.error("Erreur updateMe:", error);
    res.status(500).json({ message: "Erreur de mise à jour ❌" });
  }
};




exports.getMe = async (req, res) => {
  try {
    // 1. On récupère d'abord le compte actuel pour avoir le numéro de téléphone
    const currentFan = await Fan.findById(req.user.id);
    
    if (!currentFan) {
      return res.status(404).json({ success: false, message: "Session expirée ❌" });
    }

    // 2. 🕵️ RECHERCHE GLOBALE PAR NUMÉRO
    // On cherche tous les documents "Fan" qui ont le même numéro de téléphone
    const allMyAccounts = await Fan.find({ 
      phoneNumber: currentFan.phoneNumber 
    }).populate({
      path: 'coachId', 
      select: 'storeName userName slug avatar category' 
    });

    // 3. EXTRACTION DES MAÎTRES AVEC STATUT DYNAMIQUE
    // On crée une liste propre qui dit si c'est un "Prospect" ou un "Client" chez chaque coach
    const masters = allMyAccounts
      .filter(acc => acc.coachId) // Sécurité si un coach a été supprimé
      .map(acc => ({
        ...acc.coachId._doc, // On déballe les infos du coach
        userStatus: acc.status, // 💎 'Prospect' ou 'Client' (ton enum)
        fanIdInThisEmpire: acc._id // 🆔 Très important pour le Switch plus tard
      }));

    res.status(200).json({
      success: true,
      data: {
        profile: currentFan,
        masters: masters // 🌍 TOUT son réseau de Maîtres
      }
    });

  } catch (error) {
    console.error("Erreur Réseau Maîtres :", error);
    res.status(500).json({ message: "Erreur serveur ❌" });
  }
};

exports.switchEmpire = async (req, res) => {
  try {
    const { targetCoachId } = req.body;
    const fanId = req.user.id; // 🕵️ Extrait de ton Token actuel
  
    // 1. On vérifie que le Fan existe toujours
    const fan = await Fan.findById(fanId);
    if (!fan) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // 2. 🪄 GÉNÉRATION DU NOUVEAU TOKEN (Avec le nouveau CoachId)
    // On utilise la même fonction de création de token que d'habitude
    const token = jwt.sign(
      { id: fan._id, coachId: targetCoachId, role: 'fan',name: fan.name, }, // On change juste le coachId
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
     

    

    res.status(200).json({
      success: true,
      token,
      message: "Voyage entre Empires réussi 🏰✨",
      fanName: fan.name,
      tel: fan.phoneNumber,
      id: fan._id
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur de voyage ❌" });
  }
};

