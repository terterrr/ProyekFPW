const express = require("express");
const router = express.Router();
const { getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require("../controllers/announcements");
const verifyJWT = require("../middlewares/verifyJWT");
const upload = require("../middlewares/upload");

router.get("/", getAllAnnouncements);
router.post("/", verifyJWT, upload.single("thumbnail"), createAnnouncement);
router.put("/:id", verifyJWT, upload.single("thumbnail"), updateAnnouncement);
router.delete("/:id", verifyJWT, deleteAnnouncement);

module.exports = router;
