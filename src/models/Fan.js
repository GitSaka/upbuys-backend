const mongoose = require('mongoose');

const FanSchema = new mongoose.Schema({
  // --- IDENTITÉ (L'essentiel) ---
  name: { type: String, trim: true },
  phoneNumber: { type: String, required: true, unique: true }, // Identifiant Unique (WhatsApp)
  countryCode: { type: String, default: "+229" },
  password:{
    type: String,
    required:true
  },

    // 💎 AJOUTS LUXE POUR LE PROFIL
  email: { type: String, trim: true, lowercase: true,default:"" }, // Pour les factures 📧
  avatar: { type: String, default: "" },               // URL Cloudinary 📸
  city: { type: String, default: "" },                 // Localisation 🌍
  
  // --- SÉCURITÉ ---
  otpCode: { type: String, default: null }, // Pour la connexion sans mot de passe
  emergencyContact: { type: String, default: "" }, 

  // --- BUSINESS INTELLIGENCE (L'ancien Lead) ---
  status: { 
    type: String, 
    enum: ['Prospect', 'Client'], 
    default: 'Prospect' 
  },
  coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // On traque ce qu'il a regardé ou voulu regarder
  interests: [{ 
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    date: { type: Date, default: Date.now }
  }],
  
  // On traque ce qu'il a RÉELLEMENT payé
  purchasedCourses: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course' 
  }],

  lastVisit: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Fan', FanSchema);