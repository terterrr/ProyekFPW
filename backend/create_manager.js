const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Users = require("./src/models/Users");
require("dotenv").config();

const createManager = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to MongoDB");

    const email = "manager@bpsdm.jatim.go.id";
    const password = "manager123";
    
    // Check if exists
    const existing = await Users.findOne({ email });
    if(existing) {
        console.log("Manager already exists, updating password...");
        existing.password = await bcrypt.hash(password, 10);
        existing.role = "manager";
        await existing.save();
    } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        await Users.create({
            email,
            password: hashedPassword,
            role: "manager",
            nik: "9999999999999999",
            nama: "Manager BPSDM",
            kota: "Surabaya",
            usia: 40,
            kelamin: "Laki-laki",
            tanggal_lahir: new Date("1985-01-01"),
            profile_picture: "https://placehold.co/150", 
        });
        console.log("Manager created.");
    }

    console.log(`Login with: ${email} / ${password}`);

  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
};

createManager();
