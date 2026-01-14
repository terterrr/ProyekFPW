const Pengguna = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * REGISTER
 */
const register = async (req, res) => {
  try {
    const { email, password, role, nik, nama, kota, usia, kelamin, tanggal_lahir } = req.body;

    // 1. Validasi input
    if (!email || !password) {
      return res.status(400).json({ msg: "Email dan password wajib diisi" });
    }

    // 2. Cek user sudah ada
    const existingUser = await Pengguna.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ msg: "Email sudah digunakan" });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Simpan ke database
    const user = await Pengguna.create({
      email,
      password: hashedPassword,
      role: role || "peserta", // default user mapped to peserta
      nik,
      nama,
      kota,
      usia,
      kelamin,
      tanggal_lahir,
    });

    // 5. Response sukses
    return res.status(201).json({
      msg: "Register berhasil",
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Register gagal" });
  }
};


/**
 * LOGIN
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await Pengguna.findOne({ email });
  if (!user) return res.status(401).json({ msg: "Login gagal" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ msg: "Login gagal" });

  // ACCESS TOKEN
  const accessToken = jwt.sign(
    { 
        id: user._id, 
        email: user.email, 
        role: user.role, 
        nama: user.nama,
        nik: user.nik,
        kota: user.kota,
        profile_picture: user.profile_picture 
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  // REFRESH TOKEN
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  await Pengguna.findByIdAndUpdate(user._id, {
    refresh_token: refreshToken,
  });

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    sameSite: "Lax",
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ access_token: accessToken, role: user.role });
};

/**
 * REFRESH TOKEN
 */

const refreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);

  const refreshToken = cookies.jwt;

  const user = await Pengguna.findOne({
    refresh_token: refreshToken,
  });

  if (!user) return res.sendStatus(403);

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err, decoded) => {
      if (err || user._id.toString() !== decoded.id)
        return res.sendStatus(403);

      const accessToken = jwt.sign(
        { 
            id: user._id, 
            role: user.role,
            email: user.email,
            nama: user.nama,
            nik: user.nik,
            kota: user.kota,
            profile_picture: user.profile_picture
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ access_token: accessToken });
    }
  );
};


/**
 * LOGOUT
 */
const logout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);

  const refreshToken = cookies.jwt;

  await Pengguna.findOneAndUpdate(
    { refresh_token: refreshToken },
    { refresh_token: null }
  );

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "Lax",
    secure: false,
  });

  res.sendStatus(204);
};


module.exports = { register, login, logout, refreshToken };
