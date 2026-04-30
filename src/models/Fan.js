const mongoose = require('mongoose');

const FanSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  
  // On enlève unique: true ici
  phoneNumber: { 
    type: String, 
    trim: true, 
    sparse: true 
  }, 
  
  countryCode: { type: String, default: "+225" },

  // On enlève unique: true ici aussi
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

// 🎯 LES LIGNES MANQUANTES SONT ICI :
// Ces index remplacent le "unique: true" global par un "unique par coach"
FanSchema.index({ phoneNumber: 1, coachId: 1 }, { unique: true, sparse: true });
FanSchema.index({ email: 1, coachId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Fan', FanSchema);
