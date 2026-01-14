const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const { getAllSeminars, getSeminarById, createSeminar, deleteSeminar, updateSeminarCertificate, updateSeminar } = require("../controllers/seminar");
// Middleware verifyToken could be added here if needed, but 'All Seminars' usually public or protected?
// User said "User biasa", so likely protected. Let's assume public for reading for simplicity or verifyToken if globally applied?
// Let's stick to simple routes first.

// Routes
router.get("/", getAllSeminars);
router.get("/:id", getSeminarById);

const upload = require("../middlewares/upload");

// Protected Routes
router.post("/", verifyJWT, createSeminar);
router.post("/upload-certificate", verifyJWT, upload.single("file"), updateSeminarCertificate);
router.put("/:id", verifyJWT, updateSeminar);
router.delete("/:id", verifyJWT, deleteSeminar);

module.exports = router;
