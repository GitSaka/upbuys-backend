const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },

  coach: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  transaction: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Transaction'
  },

  // 🔒 Snapshot du prix au moment de l'achat
  paidAmount: {
    type: Number
  },

  progress: { 
    type: Number, 
    default: 0 
  },

  status: { 
    type: String, 
    enum: ['active', 'completed', 'suspended'], 
    default: 'active' 
  }

}, { timestamps: true });

EnrollmentSchema.index(
  { student: 1, course: 1 }, 
  { unique: true }
);

module.exports = mongoose.model('Enrollment', EnrollmentSchema);