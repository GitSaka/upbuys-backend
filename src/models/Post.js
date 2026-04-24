const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({

  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }, 

  authorName: { 
    type: String, 
    required: true 
  },

  // 🔥 AJOUTÉ
  authorId: { 
    type: String, 
    required: true 
  },

  // 🔥 AJOUTÉ
  authorType: { 
    type: String, 
    enum: ['admin', 'fan'], 
    required: true 
  },

  content: { 
    type: String, 
    required: true 
  },

  imageUrl: { 
    type: String 
  },

  mediaType: { 
    type: String, 
    enum: ['image', 'video', 'none'], 
    default: 'none' 
  },

  likes: [{ 
    type: String, 
    default: [] 
  }],

  comments: [{
    author: String,
    fanId: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],

  isVerify: { 
    type: Boolean, 
    default: false 
  }

}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);