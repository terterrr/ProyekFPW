const mongoose = require("mongoose");
const Users = require("./src/models/Users");
require("dotenv").config();

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to MongoDB");

    const users = await Users.find({}, "email nama role");
    
    console.log("\n=== DAFTAR USER UTAMA ===");
    const randoms = users.filter(u => u.email !== "admin@bpsdm.jatim.go.id" && u.email !== "manager@bpsdm.jatim.go.id" && u.email !== "peserta@bpsdm.jatim.go.id");
    
    randoms.forEach(u => {
        const firstName = u.nama.split(" ")[0];
        console.log(`Email: ${u.email}`);
        console.log(`Role:  ${u.role}`);
        console.log(`Pass:  ${firstName}123  (Perhatikan Huruf Besar!)`);
        console.log("-------------------------");
    });

  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
};

listUsers();
