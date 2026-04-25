const { FedaPay, Transaction: FedaTransaction } = require('fedapay');
const Transaction = require('../models/Transaction');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
require('dotenv').config(); // pour charger .env
FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY);
FedaPay.setEnvironment('sandbox'); // Sandbox pour test

exports.initiatePayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // 1️⃣ Vérifier que le cours existe
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Cours introuvable" });
    }

    // Vérifier que le cours a bien un coach
    const coachId = course.coach || course.createdBy;
    if (!coachId) {
      return res.status(400).json({ message: "Le cours n'a pas de coach défini" });
    }

    // 2️⃣ Vérifier que l'utilisateur n'a pas déjà accès
    const existingEnrollment = await Enrollment.findOne({
      student: userId,
      course: courseId,
      status: 'active'
    });
    if (existingEnrollment) {
      return res.status(400).json({ message: "Vous avez déjà accès à ce cours" });
    }

    // 3️⃣ Vérifier s'il y a déjà une transaction pending pour ce cours
    let existingPending = await Transaction.findOne({
      courseId,
      customerId: userId,
      status: 'pending'
    });

    let token;

    if (existingPending) {
      // ⚠️ Transaction existante pendante
      if (existingPending.fedaTransactionId) {
        // Récupérer la transaction FedaPay déjà créée
        const fedaTx = await FedaTransaction.retrieve(existingPending.fedaTransactionId);
        token = await fedaTx.generateToken();
      } else {
        // Créer maintenant la transaction FedaPay si elle n'existe pas
        const fedaTx = await FedaTransaction.create({
          amount: existingPending.amount,
          currency: { iso: 'XOF' },
          description: `Achat du cours : ${course.title}`,
          customer: {
            firstname: req.user.name || "Client",
            lastname: "Empire",
            email: req.user.email || 'saka@gmail.com',
          },
          callback_url: `${process.env.BACKEND_URL}/api/payments/callback/${existingPending._id}`
        });
        token = await fedaTx.generateToken();

        // Sauvegarder l'ID FedaPay pour cette transaction
        existingPending.fedaTransactionId = fedaTx.id;
        await existingPending.save();
      }

      console.log("Transaction Mongo ID:", existingPending._id);
      console.log("Feda Transaction ID:", existingPending.fedaTransactionId);

      return res.status(200).json({
        message: "Un paiement est déjà en cours",
        paymentUrl: token.url,
        transactionId: existingPending._id
      });
    }

    // 4️⃣ Créer transaction locale pour nouveau paiement
    const localTx = await Transaction.create({
      courseId,
      customerId: userId,
      coachId,
      amount: course.price,
      status: 'pending',
      mode: 'sandbox',
      paymentMethod: 'unknown'
    });

    // 5️⃣ Créer transaction FedaPay
    const fedaTx = await FedaTransaction.create({
      amount: course.price,
      currency: { iso: 'XOF' },
      description: `Achat du cours : ${course.title}`,
      customer: {
        firstname: req.user.name || "Client",
        lastname: "Empire",
        email: req.user.email || 'saka@gmail.com',
      },
      callback_url: `${process.env.BACKEND_URL}/api/payments/callback/${localTx._id}`
    });

    token = await fedaTx.generateToken();

    // 6️⃣ Sauvegarder ID FedaPay
    localTx.fedaTransactionId = fedaTx.id;
    await localTx.save();

    console.log("Nouvelle Transaction Mongo ID:", localTx._id);
    console.log("Feda Transaction ID:", localTx.fedaTransactionId);

    // 7️⃣ Retourner URL au frontend
    return res.status(200).json({
      success: true,
      paymentUrl: token.url,
      transactionId: localTx._id
    });

  } catch (error) {
    console.error("Initiate Payment Error:", error);
    return res.status(500).json({
      message: "Erreur lors de l'initiation du paiement"
    });
  }
};


exports.verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { id: fedaTransactionId } = req.query;

    // 🔹 Vérification des paramètres
    if (!transactionId) {
      return res.status(400).json({ message: "Transaction ID manquant" });
    }
    if (!fedaTransactionId) {
      return res.status(400).json({ message: "Feda transaction ID manquant" });
    }

    // 🔹 Récupérer la transaction locale
    const localTx = await Transaction.findById(transactionId);
    if (!localTx) {
      return res.status(404).json({ message: "Transaction introuvable" });
    }

    // 🔹 Vérification réelle auprès de FedaPay
    const fedaTx = await FedaTransaction.retrieve(fedaTransactionId);
    console.log("FedaPay Transaction:", fedaTx);

    // 🔹 Mettre à jour le statut exact renvoyé par FedaPay
    localTx.status = fedaTx.status;
    localTx.fedaTransactionId = fedaTransactionId;
    await localTx.save();

    // 🔹 Paiement approuvé → activer l’accès au cours
    if (fedaTx.status === "approved") {
      const enrollment = await Enrollment.findOneAndUpdate(
        { student: localTx.customerId, course: localTx.courseId },
        {
          student: localTx.customerId,
          course: localTx.courseId,
          coach: localTx.coachId,
          transaction: localTx._id,
          status: "active"
        },
        { upsert: true, new: true }
      );
      console.log("Enrollment updated:", enrollment._id);

      return res.redirect(
        `${process.env.FRONTEND_VERSEL_URL}/empire/success/${transactionId}?status=approved&id=${fedaTransactionId}`
      );
    }

    // 🔹 Paiement refusé ou autre statut → rediriger vers failed
    return res.redirect(
      `${process.env.FRONTEND_VERSEL_URL}/empire/failed/${transactionId}?status=${fedaTx.status}&id=${fedaTransactionId}`
    );

  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// routes/enrollmentRoutes.js
exports.check = async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log(courseId)
    const userId = req.user?.id;
   
    if (!userId) {
      return res.status(401).json({ success: false, hasAccess: false, message: "Utilisateur non authentifié" });
    }

    if (!courseId) {
      return res.status(400).json({ success: false, hasAccess: false, message: "ID du cours manquant" });
    }

    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId,
      status: 'active'
    });

    return res.status(200).json({
      success: true,
      hasAccess: Boolean(enrollment)
    });

  } catch (error) {
    console.error("Check access error:", error);
    return res.status(500).json({ success: false, hasAccess: false, message: "Erreur serveur" });
  }
};