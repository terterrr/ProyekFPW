const Users = require("../models/Users");
const bcrypt = require("bcrypt");

const getUserById = async (req, res) => {
  try {
    const user = await Users.findById(req.params.id).select("-password -refresh_token");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserById,
  getAllUsers: async (req, res) => {
    try {
        const users = await Users.find().select("-password -refresh_token");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  },
  updateUser: async (req, res) => {
      try {
          const { password, ...updateData } = req.body;
          // Prevent password update via this generic route if needed, or hash it if allowed. 
          // For now assuming non-password updates or password is not sent here.
          
          const user = await Users.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password -refresh_token");
          if (!user) return res.status(404).json({ message: "User not found" });
          res.json(user);
      } catch (error) {
          res.status(500).json({ message: error.message });
      }
  },
  deleteUser: async (req, res) => {
      try {
          const user = await Users.findByIdAndDelete(req.params.id);
          if (!user) return res.status(404).json({ message: "User not found" });
          res.json({ message: "User deleted successfully" });
      } catch (error) {
          res.status(500).json({ message: error.message });
      }
  },
  createUser: async (req, res) => {
    try {
        const { email, password, role, nik, nama, kota, usia, kelamin, tanggal_lahir } = req.body;
        if (!email || !password || !nik || !nama) return res.status(400).json({ message: "Data tidak lengkap" });
        
        const existingUser = await Users.findOne({ email });
        if (existingUser) return res.status(409).json({ message: "Email sudah digunakan" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await Users.create({
            email, password: hashedPassword, role: role || "peserta", nik, nama, kota, usia, kelamin, tanggal_lahir
        });
        res.status(201).json({ message: "User created successfully", user: { id: user._id, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  }
};
