const jwt = require('jsonwebtoken');
const Fan = require('../models/Fan');
const User = require('../models/User');



const fanMiddleware = (req, res, next) => {
  try {
    // 1️⃣ Récupérer le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Accès refusé. Token manquant." });
    } 
    console.log(authHeader)

    // 2️⃣ Extraire le token
    const token = authHeader.split(" ")[1];

    // 3️⃣ Décoder et vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   
    // 4️⃣ Injecter le token décodé dans la requête
    req.user = decoded; // contient au moins { id: ..., coachId: ... } selon ton token
     
    // 5️⃣ Passer à la suite
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide ou expiré." });
  }
};


module.exports = fanMiddleware;
