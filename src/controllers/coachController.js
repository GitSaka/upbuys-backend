const Transaction = require('../models/Transaction');
const Fan = require('../models/Fan');
const mongoose = require('mongoose');
const Course = require('../models/Course');
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


exports.getCoachDashboardData = async (req, res) => {
  try {
    // 🛡️ 1. Sécurité : Vérification de l'existence de l'ID
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Session invalide" });
    }

    // 🛡️ 2. Cast sécurisé de l'ID (évite le crash 500 si l'ID est mal formé)
    const coachId = new mongoose.Types.ObjectId(String(req.user.id));
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 🚀 3. Agrégation optimisée
    const statsData = await Transaction.aggregate([
      { 
        $match: { 
          coachId: coachId, 
          status: "approved" 
        } 
      },
      {
        $facet: {
          totals: [
            { $group: { _id: null, revenue: { $sum: "$amount" }, salesCount: { $sum: 1 } } }
          ],
          dailySales: [
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Format ISO pour tri facile au front
                sales: { $sum: "$amount" },
                ventes: { $sum: 1 }
              }
            },
            { $sort: { "_id": 1 } }
          ],
          topCourses: [
            { $group: { _id: "$courseId", sales: { $sum: 1 } } },
            { $sort: { sales: -1 } },
            { $limit: 3 },
            { 
              $lookup: { 
                from: 'courses', 
                localField: '_id', 
                foreignField: '_id', 
                as: 'info' 
              } 
            },
            { $unwind: { path: "$info", preserveNullAndEmptyArrays: true } },
            { $project: { name: { $ifNull: ["$info.title", "Cours supprimé"] }, sales: 1 } }
          ]
        }
      }
    ]);

    // 🛡️ 4. Extraction ultra-sécurisée (Zero-Crash Logic)
    // On vérifie chaque niveau pour éviter "Cannot read properties of undefined"
    const result = statsData[0] || {};
    
    const finalTotals = (result.totals && result.totals[0]) 
      ? result.totals[0] 
      : { revenue: 0, salesCount: 0 };

    const finalDailySales = result.dailySales || [];
    const finalTopCourses = result.topCourses || [];

    // 5. Comptage parallèle des fans
    const totalFans = await Fan.countDocuments({ coachId: coachId });

    // ✅ 6. Réponse propre et constante
    return res.status(200).json({
      success: true,
      data: {
        totalRevenue: finalTotals.revenue || 0,
        totalSales: finalTotals.salesCount || 0,
        totalFans: totalFans || 0,
        chartData: finalDailySales,
        topCourses: finalTopCourses
      }
    });

  } catch (error) {
    // Log précis pour le développeur sur Render
    console.error("CRITICAL DASHBOARD ERROR:", error.message);
    
    // Réponse propre pour le client (pas de crash 500 brut)
    res.status(200).json({ 
      success: false, 
      data: {
        totalRevenue: 0,
        totalSales: 0,
        totalFans: 0,
        chartData: [],
        topCourses: []
      },
      message: "Initialisation des statistiques..." 
    });
  }
};




