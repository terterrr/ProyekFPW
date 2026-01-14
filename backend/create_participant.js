const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Users = require("./src/models/Users");
require("dotenv").config();

const createParticipant = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to MongoDB");

    const email = "peserta@gmail.com";
    const password = "peserta123";
    
    // Check if exists
    const existing = await Users.findOne({ email });
    if(existing) {
        console.log("Participant already exists, updating password...");
        existing.password = await bcrypt.hash(password, 10);
        existing.role = "peserta"; // Force role
        await existing.save();
    } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        await Users.create({
            email,
            password: hashedPassword,
            role: "peserta",
            nik: "1234567890123456",
            nama: "Peserta Tetap",
            kota: "Malang",
            usia: 25,
            kelamin: "Laki-laki",
            tanggal_lahir: new Date("2000-01-01"),
            profile_picture: "https://placehold.co/150", 
        });
        console.log("Participant created.");
    }

    console.log(`Login with: ${email} / ${password}`);

  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
};

createParticipant();
