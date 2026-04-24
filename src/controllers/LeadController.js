const Lead = require('../models/Lead');

exports.captureLead = async (req, res) => {
  try {
    const { name, whatsapp, courseId } = req.body;

    // "Upsert" : Trouve par WhatsApp, sinon crée. 
    // On ajoute l'ID du cours dans le tableau des intérêts.
    const lead = await Lead.findOneAndUpdate(
      { whatsapp: whatsapp },
      { 
        $set: { name: name, lastVisit: Date.now() },
        $addToSet: { interest: { courseId: courseId } } // Ajoute sans doublon
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: "Accès autorisé",
      leadId: lead._id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};