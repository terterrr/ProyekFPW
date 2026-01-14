const express = require("express");
const router = express.Router();
const { 
  registerSeminar, 
  getMySeminars, 
  submitProof,
  getSeminarParticipants,
  updateCertificate,
  verifyHistory,
  deleteHistory,
  attendSeminar
} = require("../controllers/history");
const verifyJWT = require("../middlewares/verifyJWT");
const upload = require("../middlewares/upload");

router.post("/register", registerSeminar);
router.delete("/:id", verifyJWT, deleteHistory);
router.get("/user/:user_id", getMySeminars);

router.post("/submit", verifyJWT, upload.single("file"), submitProof);
router.post("/attend", verifyJWT, attendSeminar);

// Manager Routes
router.get("/seminar/:seminar_id", verifyJWT, getSeminarParticipants);
router.post("/update-certificate", verifyJWT, upload.single("file"), updateCertificate);
router.post("/verify", verifyJWT, verifyHistory);

module.exports = router;
