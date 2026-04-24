// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      trim: true,
    },

    thumbnail: {
      type: String,
      required: true,
      trim: true,
    },

    // 1. DISTINCTION PRIORITAIRE
    productType: { 
      type: String, 
      enum: ['Metier', 'Outil'],
      default: 'Metier' 
    },

    // 2. CATÉGORIES
    category: {
      type: String,
      enum: [
        'Mode & Design',
        'Art Culinaire',
        'Agro-Business',
        'Beauté & Soins',
        'E-books & Guides',
        'Boîte à Outils',
        'Autres',
        'Business & IA'
      ],
      required: true,
      default:'Mode & Design'
    },

    // 3. MÉTIERS
    materials: [{
      name: String,
      isMandatory: { type: Boolean, default: true }
    }],

    whatsappSupport: { 
      type: Boolean, 
      default: false 
    },

    // 4. DIGITAL
    downloadableFile: { 
      type: String 
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    pricingType:{
      type: String,
      enum:['Unique','Mensuel'],
      default:'Unique'
    },
    
    isFree:{
      type: Boolean,
      default: false
    },

    comparePrice: {
      type: Number,
      validate: {
        validator(value) {
          return value == null || value >= this.price;
        },
        message: 'Le prix barré doit être supérieur au prix réel',
      },
    },

    descriptionLong: {
      type: String,
      default:''
    },

    // 🔐 OWNER PRINCIPAL (à utiliser dans toutes les requêtes sécurisées)
    createdBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref:'User',
      required: true,
      index: true // 🔥 important pour filtrage sécurisé rapide
    },

    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],

    salesCount: {
      type: Number,
      default: 0,
    },

    totalLikes: {
      type: Number,
      default: 0,
    },

    // ⚠️ On garde ce champ mais on le rend cohérent
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      index: true
    },

    status:{
      type:String, 
      enum: ['Actif','Brouillon'], 
      default:'Actif'
    }
  },
  { timestamps: true }
);


// 🔒 Middleware de cohérence sécurité
courseSchema.pre('save', function () {
  if (!this.user && this.createdBy) {
    this.user = this.createdBy;
  }

  if (!this.createdBy && this.user) {
    this.createdBy = this.user;
  }
});


// 🔥 Index composite pour accélérer vérifications owner + status
courseSchema.index({ createdBy: 1, status: 1 });

module.exports = mongoose.model('Course', courseSchema);
