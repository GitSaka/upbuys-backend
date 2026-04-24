const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // --- IDENTIFIANTS ---
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  fullPhone:{type:String,required:true,unique:true},
  userName: { type: String, unique: true }, // Le Slug (ex: aicha-digital)
  
  // --- IDENTITÉ VISUELLE ---
  storeName: { type: String, required: true }, // Nom de la boutique
  slug:{type:String, unique:true,lowercase:true,trim:true,index:true},
  slogan: { type: String, default: "Bienvenue dans mon Empire" },
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" }, // URL de l'image
  banner: { type: String, default: "" }, // URL de la bannière
  category:{type: String,required:true,lowercase:true},
  bioHtml:{type: String, default:''},
  
  // --- BUSINESS ---
  
  countryCode: { type: String, default: "+225" },
  currency: { type: String, default: "XOF" },
  tiktok: { type: String, default: "" },
  instagram: { type: String, default: "" },
  facebook: { type: String, default: "" },
  
  // --- PARAMÈTRES ---
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);