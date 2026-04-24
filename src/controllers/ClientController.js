const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

/**
 * RÉCUPÉRER TOUS LES COURS PUBLIÉS (Pour le Store)
 * Route: GET /api/courses/all-active
 */

exports.getAllActiveCourses = async (req, res) => {
  try {
    const { slug } = req.params;

    // 1️⃣ Trouver le coach via le slug
    const coach = await User.findOne({ slug });
    

    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach introuvable"
      });
    }
    

    // 2️⃣ Récupérer ses cours actifs uniquement
    const courses = await Course.find({
      status: 'Actif',
      createdBy: coach._id
    })
    .populate({path: 'createdBy',select: 'slug storeName bio avatar banner userName createdAt',}) 
    .sort({ createdAt: -1 });
    

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });

  } catch (error) {
    console.error("Erreur getActiveCoursesByCoach:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
};

/**
 * RÉCUPÉRER LES DÉTAILS D'UN COURS (Pour la Page Détails/Landing Page)
 * Route: GET /api/courses/details/:id
 */
exports.getCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // On récupère le cours avec TOUTES ses leçons (pour afficher le sommaire)
    const course = await Course.findOne({ _id: id, status: 'Actif' })
      .populate({path: 'createdBy',select: 'slug storeName bio avatar banner userName createdAt',})
      .populate({
        path: 'lessons',
        select: 'title type duration isFree order description' // On ne prend pas le mediaUrl ici (protection)
      })

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: "Désolé, cet Empire est introuvable ou n'est plus disponible." 
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// On cherche un utilisateur (Coach) par son slug unique
exports.getUserBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(slug)

    // 🔍 RECHERCHE : On filtre pour ne pas envoyer le password ou l'email (SÉCURITÉ)
    const user = await User.findOne({ slug })
      .select('_id storeName slogan bioLongue avatar slug bio bioHtml banner category role createdAt');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "Cet Empire n'existe pas encore... 🏰" 
      });
    }

    // ✅ RÉPONSE SOUVERAINE
    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error("Erreur Profil Public :", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération du profil ❌" 
    });
  }
};



exports.getUsersByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const users = await User.find({ category })
      .select('banner avatar slug userName storeName');

    res.status(200).json(users);

  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

exports.getMyCourseInventory = async (req, res) => {
  try {
    // 🕵️ EXTRACTION DEPUIS LE MIDDLEWARE (req.user injecté par le Token)
    const userId = req.user.id;
    const coachId = req.user.coachId; 
   console.log(userId,coachId)
    // 1. On cherche ses accès payants CHEZ CE COACH PRÉCIS
    const enrolls = await Enrollment.find({ 
      student: userId, 
      coach: coachId, 
      status: 'active' 
    }).populate('course');

    const paidCourses = enrolls.map(e => e.course).filter(c => c);

    // 2. On cherche les cours gratuits DU MÊME COACH
    const freeCourses = await Course.find({ 
      createdBy: coachId, 
      isFree: true 
    });

    // 3. Fusion Souveraine sans doublons
    const allMyCourses = [...new Map(
      [...paidCourses, ...freeCourses].map(c => [c._id.toString(), c])
    ).values()];

    res.status(200).json({
      success: true,
      data: allMyCourses
    });

  } catch (error) {
    console.error("Erreur Inventaire ❌", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};