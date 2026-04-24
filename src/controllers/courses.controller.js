const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const sanitizeHtml = require('sanitize-html');
const mongoose = require('mongoose');



exports.createCourse = async (req, res) => {
  try {
    const adminId = req.user.id;
    // On extrait lessons et productType pour les traiter séparément
    const { lessons, descriptionLong, productType, ...courseData } = req.body;
    

    // 1. 🔒 Sécurisation HTML TipTap
    const cleanDescription = sanitizeHtml(descriptionLong || '', {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'span']),
      allowedAttributes: {
        '*': ['style', 'class'],
        'img': ['src', 'alt']
      }
    });

    // 2. Création initiale de l'Empire (Course)
    const course = await Course.create({
      ...courseData,
      descriptionLong: cleanDescription,
      productType: productType || 'Metier',
      createdBy: adminId,
      lessons: [] // Initialement vide
    });

    // 3. 🔁 LOGIQUE CONDITIONNELLE POUR LES LEÇONS
    // On ne crée des leçons QUE si on est en mode 'Metier' ET qu'il y a des leçons fournies
    if (productType === 'Metier' && Array.isArray(lessons) && lessons.length > 0) {
      
      const lessonDocs = await Promise.all(
        lessons.map((lesson, index) =>
          Lesson.create({
            ...lesson,
            courseId: course._id,
            order: index + 1,
          })
        )
      );

      // On lie les IDs des leçons créées au cours
      course.lessons = lessonDocs.map((l) => l._id);
      await course.save();
    }

    // 4. RÉPONSE AU FRONTEND
    res.status(201).json({
      success: true,
      courseId: course._id,
      message: productType === 'Outil' 
        ? "Pack digital créé avec succès 📦" 
        : "Formation métier créée avec succès 🎓"
    });

  } catch (err) {
    console.error("❌ Erreur CreateCourse:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// All courses 
exports.getAllCourses = async (req, res) => {
  try {
    const adminId = req.user._id; // ⚠️ IMPORTANT si on a attaché le user depuis la DB

    const courses = await Course.find({ createdBy: adminId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'lessons',
        options: { sort: { order: 1 } },
      });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des formations",
      error: error.message
    });
  }
};


// single courses
exports.getSingleCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const course = await Course.findOne({
      _id: id,
      createdBy: adminId
    })
    .populate({ path: 'lessons', options: { sort: { order: 1 } } })
    .populate('user');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Formation introuvable ou accès refusé ❌"
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de la formation",
      error: error.message
    });
  }
};



exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Vérifier ID Mongo
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de cours invalide"
      });
    }

    // Vérifier si le cours existe ET appartient à l'utilisateur connecté
    const course = await Course.findOne({ _id: id, createdBy: adminId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Formation introuvable ou accès refusé ❌"
      });
    }

    // Supprimer les leçons liées
    await Lesson.deleteMany({ courseId: id });

    // Supprimer le cours
    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: "Formation et leçons supprimées avec succès"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression",
      error: error.message
    });
  }
};


exports.toggleCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Nouveau statut
    const adminId = req.user.id;
    console.log(adminId,id)

    // Validation du statut
    if (!['Actif', 'Brouillon'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Statut invalide ❌" 
      });
    }

    // Vérifier que le cours existe ET appartient à l'admin connecté
    const course = await Course.findOne({ _id: id, createdBy: adminId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Cours introuvable ou accès refusé ❌"
      });
    }

    // Mise à jour du statut
    course.status = status;
    await course.save();

    res.status(200).json({
      success: true,
      data: course,
      message: `Statut mis à jour : ${status} ✅`
    });

  } catch (error) {
    console.error("❌ TOGGLE STATUS ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur ❌", 
      error: error.message 
    });
  }
};


exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const { lessons = [], descriptionLong, ...courseData } = req.body;

    // Vérifier que le cours existe et appartient à l'utilisateur connecté
    const course = await Course.findOne({ _id: id, createdBy: adminId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Formation introuvable ou accès refusé ❌",
      });
    }

    // Sécuriser la description longue
    courseData.descriptionLong = sanitizeHtml(descriptionLong || '', {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    });

    // Mise à jour du cours
    await Course.findByIdAndUpdate(id, courseData, { new: true });

    // ==========================
    // GESTION DES LEÇONS
    // ==========================

    const incomingLessonIds = lessons
      .filter(l => l._id)
      .map(l => l._id.toString());

    // Supprimer les leçons supprimées côté front
    await Lesson.deleteMany({
      courseId: id,
      _id: { $nin: incomingLessonIds }
    });

    // Créer / Mettre à jour les leçons
    const lessonDocs = await Promise.all(
      lessons.map(async (lesson, index) => {
        if (lesson._id) {
          // UPDATE
          return Lesson.findByIdAndUpdate(
            lesson._id,
            {
              ...lesson,
              order: index + 1,
            },
            { new: true }
          );
        } else {
          // CREATE
          return Lesson.create({
            ...lesson,
            courseId: id,
            order: index + 1,
          });
        }
      })
    );

    // Synchroniser les références dans Course
    course.lessons = lessonDocs.map(l => l._id);
    await course.save();

    res.status(200).json({
      success: true,
      message: "Formation mise à jour avec succès ✅",
    });

  } catch (err) {
    console.error("❌ UPDATE COURSE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du cours",
      error: err.message,
    });
  }
};



