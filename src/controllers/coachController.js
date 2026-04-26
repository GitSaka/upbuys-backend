const Transaction = require('../models/Transaction');
// const Enrollment = require('../models/Enrollment');

exports.getCoachEarnings = async (req, res) => {
  try {
    const coachId = req.user.id;

    const result = await Transaction.aggregate([
      {
        $match: {
          coachId: coachId,
          status: "approved"
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      totalEarnings: result[0]?.total || 0
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};