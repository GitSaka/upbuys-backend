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
    const coachId = new mongoose.Types.ObjectId(req.user.id);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const statsData = await Transaction.aggregate([
      // 1. Filtrage : Uniquement les ventes RÉUSSIES de CE coach
      { 
        $match: { 
          coachId: coachId, 
          status: "approved" 
        } 
      },
      {
        $facet: {
          // A. Calcul des totaux
          totals: [
            { 
              $group: { 
                _id: null, 
                revenue: { $sum: "$amount" }, 
                salesCount: { $sum: 1 } 
              } 
            }
          ],
          // B. Données du graphique (AreaChart) - filtrées sur 7 jours
          dailySales: [
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
              $group: {
                _id: { $dateToString: { format: "%a", date: "$createdAt" } },
                sales: { $sum: "$amount" },
                ventes: { $sum: 1 }
              }
            },
            { $sort: { "_id": 1 } }
          ],
          // C. Top 3 des formations (BarChart)
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
            { $unwind: "$info" },
            { $project: { name: "$info.title", sales: 1 } }
          ]
        }
      }
    ]);

    // Extraction sécurisée des données de la facette
    const result = statsData[0];
    const totals = result.totals[0] || { revenue: 0, salesCount: 0 };
    
    // Comptage des leads (Fans)
    const totalFans = await Fan.countDocuments({ coachId: coachId });

    // Réponse propre pour le Frontend
    return res.status(200).json({
      success: true,
      data: {
        totalRevenue: totals.revenue || 0,
        totalSales: totals.salesCount || 0,
        totalFans: totalFans,
        chartData: result.dailySales || [], 
        topCourses: result.topCourses || []
      }
    });

  } catch (error) {
    console.error("Erreur Dashboard:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la génération des statistiques" 
    });
  }
};



