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
require('dotenv').config();

const app = express();
connectDB();

// Middlewares de sécurité et logs
app.use(helmet({
  crossOriginResourcePolicy: false
}));
// app.use(cors());
app.use(cors({
  origin: [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL
],
  credentials: true
}));
app.use(express.json()); // Pour lire le JSON que le Frontend envoie
app.use(morgan('dev'));





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
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});