const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },

  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Fan', 
    required: true 
  },

  coachId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  amount: { 
    type: Number, 
    required: true 
  },

  status: { 
    type: String, 
    enum: ['pending', 'approved', 'canceled', 'declined'], 
    default: 'pending' 
  },

  // ID officiel de la transaction côté FedaPay
  fedaTransactionId: { 
    type: String 
  },

  // Carte, MobileMoney, etc.
  paymentMethod: {
    type: String,
    default: 'unknown'
  },

  mode: { 
    type: String, 
    enum: ['sandbox', 'live'],
    default: 'sandbox'
  }

}, { timestamps: true });


// 🔒 Protection contre double paiement en attente
TransactionSchema.index(
  { courseId: 1, customerId: 1, status: 1 },
  { partialFilterExpression: { status: 'pending' } }
);

module.exports = mongoose.model('Transaction', TransactionSchema);