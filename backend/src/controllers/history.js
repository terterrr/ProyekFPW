const History = require("../models/History");
const Seminar = require("../models/Seminar");

// Register user to a seminar
const registerSeminar = async (req, res) => {
  try {
    const { user_id, seminar_id } = req.body;

    // Check if already registered
    const existing = await History.findOne({ user_id, seminar_id });
    if (existing) {
      return res.status(400).json({ message: "User already registered for this seminar" });
    }

    const newHistory = await History.create({
      user_id,
      seminar_id,
      status: "registered",
    });

    res.status(201).json(newHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get seminars for a specific user
const getMySeminars = async (req, res) => {
  try {
    const { user_id } = req.params;
    const history = await History.find({ user_id }).populate("seminar_id").sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get participants for a specific seminar (Manager view)
const getSeminarParticipants = async (req, res) => {
    try {
        const { seminar_id } = req.params;
        const history = await History.find({ seminar_id }).populate("user_id", "nama email profile_picture");
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Submit proof (Peserta)
const submitProof = async (req, res) => {
    try {
        const { history_id, certificate_number, competency_type, training_type } = req.body;
        let proofImageUrl = "";

        if (req.file) {
            proofImageUrl = `http://localhost:3001/uploads/${req.file.filename}`;
        }

        if (!history_id) return res.status(400).json({ message: "History ID is required" });

        const updateData = {
            certificate_number,
            competency_type,
            training_type,
            status: "submitted",
            submission_date: new Date()
        };

        if (proofImageUrl) {
            updateData.proof_image = proofImageUrl;
        }

        const updatedHistory = await History.findByIdAndUpdate(
            history_id,
            updateData,
            { new: true }
        );

        if (!updatedHistory) {
            return res.status(404).json({ message: "History record not found" });
        }

        res.json(updatedHistory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Update certificate (Manager)
// Update certificate (Manager)
const updateCertificate = async (req, res) => {
    try {
        const { history_id } = req.body;
        let certificateUrl = req.body.certificate_file;

        // If file uploaded via Multer
        if (req.file) {
            certificateUrl = `http://localhost:3001/uploads/${req.file.filename}`;
        }

        if (!certificateUrl) {
             return res.status(400).json({ message: "No certificate file or URL provided" });
        }

        const updated = await History.findByIdAndUpdate(
            history_id, 
            { 
                certificate_file: certificateUrl, 
                certificate_date: new Date(),
                status: 'verified' // Auto verify if cert is issued
            }, 
            { new: true }
        );
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Verify Participation (Manager)
const verifyHistory = async (req, res) => {
    try {
        const { history_id, status, reason } = req.body; // status: 'verified' | 'rejected'
        
        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const updated = await History.findByIdAndUpdate(
            history_id,
            { 
                status: status,
                // If rejected, maybe store reason? We don't have a field for it yet but can add if needed.
                // For now just update status.
            },
            { new: true }
        );
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete History (Participant)
const deleteHistory = async (req, res) => {
    try {
        const { id } = req.params;
        await History.findByIdAndDelete(id);
        res.json({ message: "History deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const attendSeminar = async (req, res) => {
    try {
        const { seminar_id } = req.body;
        const user_id = req.user.id; // From JWT Verify

        if(!seminar_id) return res.status(400).json({message: "Seminar ID required"});

        let history = await History.findOne({ user_id, seminar_id });
        if (history) {
            // Only update if status is 'registered' (don't downgrade from submitted/verified)
            if (history.status === 'registered') {
                history.status = 'attended';
                await history.save();
            }
             return res.json({ message: "Attendance confirmed!", status: history.status, history });
        } else {
             // Create new as attended (Walk-in / On-spot registration)
             const newHistory = await History.create({
                user_id,
                seminar_id,
                status: 'attended'
             });
             return res.status(201).json({ message: "Registered and Attended successfully!", status: 'attended', history: newHistory });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
  registerSeminar,
  getMySeminars,
  submitProof,
  getSeminarParticipants,
  updateCertificate,
  verifyHistory,
  deleteHistory,
  attendSeminar
};
