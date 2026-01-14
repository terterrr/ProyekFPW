const { Schema, default: mongoose } = require("mongoose");

// STEP 1: definisi schema pengguna
const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["peserta", "manager", "admin"],
      default: "peserta",
    },
    profile_picture: {
      type: String,
      default: null,
    },
    nik: {
      type: String,
      required: true,
    },
    nama: {
      type: String,
      required: true,
    },
    kota: {
      type: String,
      required: true,
    },
    usia: {
      type: Number,
      required: true,
    },
    kelamin: {
      type: String,
      required: true,
    },
    tanggal_lahir: {
      type: Date,
      required: true,
    },
    refresh_token: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// STEP 2: aktifkan virtual id
UserSchema.set("toJSON", { virtuals: true });

// STEP 3: buat model
const User = mongoose.model(
  "users",
  UserSchema,
  "users"
);

// STEP 4: export
module.exports = User;