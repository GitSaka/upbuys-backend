const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 50000, // Attendre 50s pour la sélection du serveur
  socketTimeoutMS: 45000,          // Fermer la socket après 45s d'inactivité
});
    console.log(`🍃 MongoDB Connecté : ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erreur : ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;



