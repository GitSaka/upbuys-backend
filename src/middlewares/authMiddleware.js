const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: "Accès refusé : token manquant ❌"
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔐 Vérification utilisateur en base
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur introuvable ❌"
      });
    }

    // Si tu as un champ status ou isActive
    if (user.status && user.status === 'Brouillon') {
      return res.status(403).json({
        success: false,
        message: "Compte désactivé ❌"
      });
    }

    req.user = user; // ✅ utilisateur réel en base

    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token invalide ou expiré ❌"
    });
  }
};
