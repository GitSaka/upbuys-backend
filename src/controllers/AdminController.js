const { scrapeFacebook } = require('../services/scraper');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

exports.scrape = async (req, res) => {
  try {
    const { url } = req.body; // L'URL envoyée par Postman

    if (!url) {
      return res.status(400).json({ message: "Veuillez fournir une URL Facebook" });
    }

    console.log("🚀 Lancement de l'aspiration pour :", url);

    // --- ICI SE FAIT LA LIAISON ---
    const results = await scrapeFacebook(url); 

    res.status(200).json({
      success: true,
      message: `${results.length} posts aspirés et enregistrés !`,
      data: results
    });
    console.log(results)

  } catch (error) {
    console.error("❌ Erreur Controller:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "L'aspiration a échoué", 
      error: error.message 
    });
  }
};







