const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [5000, 'Le montant minimum de retrait est de 5000 CFA'] // Sécurité pour éviter les micros-retraits
  },
  paymentMethod: {
    type: String,
    enum: ['MTN', 'Orange', 'Moov', 'Wave'],
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'rejected'],
    default: 'pending'
  },
  transactionProof: {
    type: String, 
    default: "" // Optionnel : pour mettre l'ID de transaction Mobile Money plus tard
  },
  adminNote: {
    type: String,
    default: "" // Si tu rejettes la demande, tu expliques pourquoi ici
  }
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', WithdrawalSchema);
