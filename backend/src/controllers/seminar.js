const Seminar = require("../models/Seminar");

// Get All Seminars
const getAllSeminars = async (req, res) => {
  try {
    const seminars = await Seminar.find().sort({ createdAt: -1 });
    res.json(seminars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Seminar by ID
const getSeminarById = async (req, res) => {
  try {
    const seminar = await Seminar.findById(req.params.id);
    if (!seminar) return res.status(404).json({ message: "Seminar not found" });
    res.json(seminar);
  } catch (error) {
    res.status(404).json({ message: "Seminar not found" });
  }
};

// Create Seminar (Protected)
const createSeminar = async (req, res) => {
    try {
        const { id, role } = req.user; // Get from JWT
        let creatorId = id;
        
        // Admin can assign manager
        if (role === 'admin' && req.body.manager_id) {
            creatorId = req.body.manager_id;
        }

        const newSeminar = await Seminar.create({
            ...req.body,
            created_by: creatorId
        });
        res.status(201).json(newSeminar);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Update Seminar
const updateSeminar = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Seminar.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Seminar not found" });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Delete Seminar
const deleteSeminar = async (req, res) => {
    try {
        const { id } = req.params;
        await Seminar.findByIdAndDelete(id);
        res.json({ message: "Seminar deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Upload Seminar Certificate (Shared)
const updateSeminarCertificate = async (req, res) => {
    try {
        const { id } = req.body; // seminar id
        let certificateUrl = req.body.url;
        const label = req.body.label || "Sertifikat Umum";

        if (req.file) {
            certificateUrl = `http://localhost:3001/uploads/${req.file.filename}`;
        }

        if (!certificateUrl) {
             return res.status(400).json({ message: "No file provided" });
        }

        const updated = await Seminar.findByIdAndUpdate(
            id,
            { 
                $push: { 
                    seminar_certificates: { label, url: certificateUrl } 
                } 
            },
            { new: true }
        );
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
  getAllSeminars,
  getSeminarById,
  createSeminar,
  updateSeminar,
  deleteSeminar,
  updateSeminarCertificate
};
