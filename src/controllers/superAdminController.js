const Withdrawal = require('../models/Withdrawal');

// 1. Voir toutes les demandes de tous les coachs
exports.getAllWithdrawals = async (req, res) => {
  try {
    const list = await Withdrawal.find().populate('coachId', 'storeName email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Valider un retrait (Quand tu as fait le transfert)
exports.validateWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId, note } = req.body; // ID de transaction MTN/Orange

    const withdrawal = await Withdrawal.findByIdAndUpdate(
      id,
      { 
        status: 'completed', 
        transactionId: transactionId,
        adminNote: note ,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.status(200).json({ success: true, message: "Retrait marqué comme payé ! ✅", data: withdrawal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
