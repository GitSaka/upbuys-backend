const mongoose = require('mongoose');

const FanSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  
  // 📱 TELEPHONE : Plus de 'required: true' pour laisser le choix
  // Mais on garde 'sparse: true' pour que l'index unique ignore les valeurs nulles
  phoneNumber: { 
    type: String, 
    trim: true, 
    
    sparse: true 
  }, 
  
  countryCode: { type: String, default: "+225" },

  // 📧 EMAIL : Devient un identifiant possible
  email: { 
    type: String, 
    trim: true, 
    lowercase: true, 
    
    sparse: true 
  },

  password: {
    type: String,
    required: true
  },

  avatar: { type: String, default: "" },
  city: { type: String, default: "" },
  
  status: { 
    type: String, 
    enum: ['Prospect', 'Client'], 
    default: 'Prospect' 
  },

  // 🏰 L'EMPIRE : Indispensable pour savoir chez quel coach il est
  coachId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  purchasedCourses: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course' 
  }],

  lastVisit: { type: Date, default: Date.now }
}, { timestamps: true });

// 🔒 INDEX COMPOSÉ : Un fan est unique PAR COACH pour son email ou tel
// Cela permet à un même client d'exister dans plusieurs "Empires" différents
// sans créer de conflit de base de données globale.

module.exports = mongoose.model('Fan', FanSchema);
