require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/db')
const authRoutes = require('./src/routes/AuthRoutes')
const routesFan = require("./src/routes/fanRoute")
// const adminRoutes = require('./src/routes/adminRoutes');
const CoursesRoutes = require('./src/routes/courses.routes');
const ClientRoutes = require('./src/routes/ClientRoutes');
const lessonRoutes = require('./src/routes/lessonRoutes');
const feedRoutes =  require("./src/routes/feedRoutes")
const payementRoutes =  require("./src/routes/paymentRoute")


const app = express();
// connectDB();

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Erreur MongoDB :", err);
  });

// Middlewares de sécurité et logs
app.use(helmet({
  crossOriginResourcePolicy: false
}));
// app.use(cors());
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://up-buys-vudv.vercel.app",
  "https://up-buys-potkg7cmx-sakas-projects-72448c3c.vercel.app/"
];

app.use(cors({
  origin: function (origin, callback) {
    // autorise les requêtes sans origin (Postman, mobile, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json()); // Pour lire le JSON que le Frontend envoie
app.use(morgan('dev'));



app.get("/", (req, res) => {
  res.send("API UpBuys backend is running 🚀");
});

// Route de test
app.use('/api/fans', 
routesFan,
);
app.use('/api/auth', authRoutes);
// app.use('/api/admin', adminRoutes);
app.use('/api/admin', CoursesRoutes);
app.use('/api/client', ClientRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/payments', payementRoutes);

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});