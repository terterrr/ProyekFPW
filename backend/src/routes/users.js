const express = require("express");
const router = express.Router();
const { getUserById, getAllUsers, updateUser, deleteUser, createUser } = require("../controllers/users");
const verifyJWT = require("../middlewares/verifyJWT");

router.get("/", verifyJWT, getAllUsers);
router.post("/", verifyJWT, createUser);
router.get("/:id", verifyJWT, getUserById);
router.put("/:id", verifyJWT, updateUser);
router.delete("/:id", verifyJWT, deleteUser);

module.exports = router;
