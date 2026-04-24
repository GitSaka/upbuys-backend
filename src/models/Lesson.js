// models/Lesson.js
const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true, // 🔥 très important pour la perf
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ['video', 'audio', 'text'],
      default: 'video',
    },

    mediaUrl: {
      type: String,
      trim: true,
    },

    duration: {
      type: String,
      trim: true,
    },
      // 🖇️ LE FICHIER JOINT (Le patron, la recette, la liste de prompts IA)
    attachmentUrl: { type: String }, 
    attachmentName: { type: String }, // Ex: "Patron_Jupe_Sirène.pdf"

    description: {
      type: String, // HTML TipTap
    },

    isFree: {
      type: Boolean,
      default: false,
    },

    order: {
      type: Number,
      required: true,
      default: 0
    },
    likes:{type:Number, default:0},
    comments:[
      {
        user: String,
        text: String,
        createdAt: {type: Date, default: Date.now}
      }
    ]
  },
  { timestamps: true }
);

/* 🔒 Validation intelligente */
lessonSchema.pre('save', function () {
  if (this.title) this.title = this.title.trim();
  if (this.mediaUrl) this.mediaUrl = this.mediaUrl.trim();
});


module.exports = mongoose.model('Lesson', lessonSchema);
