const Post = require('../models/Post');
const User = require('../models/User');


// =============================
// CREATE POST
// =============================
exports.createPost = async (req, res) => {
  try {

    const { content, imageUrl, mediaType } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Le contenu est obligatoire ❌"
      });
    }

    // 🔥 On prend les infos depuis le middleware
    
    const coachId = req.user.coachId;
    const authorId = req.user.id;
    const authorName = req.user.name;
    const authorType = req.user.role || "fan";

    const newPost = new Post({
      coachId,
      authorName,
      authorId,
      authorType,
      content,
      imageUrl: imageUrl || null,
      mediaType: mediaType || "none"
    });

    const savedPost = await newPost.save();

    res.status(201).json({
      success: true,
      post: savedPost
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la publication ❌"
    });
  }
};


// =============================
// GET COACH FEED
// =============================
exports.getCoachFeed = async (req, res) => {
  try {
    const { slug } = req.params;
 
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug manquant ❌"
      });
    }

    // 1️⃣ Trouver le coach via slug
    const coach = await User.findOne({ slug });
     
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach introuvable ❌"
      });
    }

    // 2️⃣ Utiliser son _id pour récupérer les posts
    const posts = await Post.find({ coachId: coach._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      coach,
      data: posts
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Impossible de charger le feed ❌"
    });
  }
};


// =============================
// ADD COMMENT
// =============================
exports.addComment = async (req, res) => {
  try {
    const { postId, author, text, fanId } = req.body;
    console.log(req.body)

    if (!postId || !author || !text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Commentaire invalide ❌"
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            author,
            fanId,
            text: text.trim(),
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: "Post introuvable ❌"
      });
    }

    const lastComment =
      updatedPost.comments[updatedPost.comments.length - 1];

    res.status(201).json({
      success: true,
      comment: lastComment
    });

  } catch (err) {
    console.error("Erreur Commentaire :", err);
    res.status(500).json({
      success: false,
      message: "Erreur serveur 💬"
    });
  }
};



// =============================
// TOGGLE LIKE
// =============================
exports.likePost = async (req, res) => {
  try {
    const { postId, userId } = req.body;

    if (!postId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Données invalides"
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post introuvable"
      });
    }

    const hasLiked = post.likes.includes(userId);

    const update = hasLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      update,
      { new: true }
    );

    res.status(200).json({
      success: true,
      likesCount: updatedPost.likes.length,
      hasLiked: !hasLiked
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Erreur technique ❤️"
    });
  }
};


exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post introuvable" });
    }

    // 🔐 Vérification : seul l'auteur peut supprimer
    if (post.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    await post.deleteOne();

    res.status(200).json({ message: "Post supprimé avec succès" });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

