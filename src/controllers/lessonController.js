// controllers/lessonController.js
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

/**
 * 🎬 REGARDER UNE LEÇON (SÉCURISÉ)
 * Route: GET /api/lessons/:lessonId/watch
 */

exports.watchLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.id; // L'élève qui demande

    // 1️⃣ RÉCUPÉRER LA LEÇON ET LE COURS
    const lesson = await Lesson.findOne({ _id: lessonId, courseId });
    const course = await Course.findById(courseId);

    if (!lesson || !course) {
      return res.status(404).json({ message: "Contenu introuvable" });
    }

    // 2️⃣ 🔍 VÉRIFICATION DU PASS (ENROLLMENT)
    const hasPaid = await Enrollment.findOne({ 
      student: userId, 
      course: courseId, 
      status: 'active' 
    });

    // 3️⃣ 🔐 LOGIQUE D'ACCÈS SOUVERAINE
    // Accès accordé SI :
    // - Le cours est entièrement gratuit (isFree)
    // - OU l'élève a payé (hasPaid)
    // - OU cette leçon précise est un "Extrait Gratuit" (lesson.isFree)
    const canWatch = course.isFree || hasPaid || lesson.isFree;

    if (!canWatch) {
      return res.status(403).json({ 
        success: false,
        message: "Maîtrise verrouillée. Procédez au paiement pour débloquer ce savoir. 🔐" 
      });
    }

    // 4️⃣ AUTORISÉ → ENVOI DES DONNÉES
    return res.status(200).json({
      success: true,
       lesson: {
        _id: lesson._id,
        title: lesson.title,
        type: lesson.type,
        mediaUrl: lesson.mediaUrl,
        duration: lesson.duration,
        description: lesson.description,
        attachmentUrl: lesson.attachmentUrl,
        attachmentName: lesson.attachmentName,
      },
    });
    console.log(lesson)

  } catch (error) {
    console.error("Erreur lecture leçon:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



