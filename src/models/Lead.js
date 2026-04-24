const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  whatsapp: { type: String, required: true }, // Identifiant unique
  interest: [{ 
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    date: { type: Date, default: Date.now }
  }],
  lastVisit: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Lead', LeadSchema);