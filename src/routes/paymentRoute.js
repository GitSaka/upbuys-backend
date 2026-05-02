// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const fanMiddleware = require('../middlewares/fanMiddleware');

// 1. Initier le paiement (Générer le lien FedaPay)
router.post('/initiate', fanMiddleware, paymentController.initiatePayment);
router.post('/webhook', paymentController.fedapayWebhook);
// 2. Vérifier le statut (Après redirection de l'élève)
router.get('/callback/:transactionId', paymentController.verifyPayment);
router.get('/check/:courseId', fanMiddleware, paymentController.check);
router.get('/details/:transactionId', fanMiddleware, paymentController.getTransactionDetails);
// La route pour recevoir les signaux automatiques de FedaPay



module.exports = router;