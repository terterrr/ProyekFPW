const { Schema, default: mongoose } = require("mongoose");

const HistorySchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    seminar_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "seminar",
      required: true,
    },
    // Status: attended, submitted, verified, completed
    status: {
      type: String,
      enum: ["registered", "attended", "submitted", "verified", "rejected"],
      default: "registered",
    },
    registration_date: {
      type: Date,
      default: Date.now,
    },
    // Bukti partisipasi (submit JP) - User input
    proof_image: {
      type: String, // URL/Path to image of the certificate uploaded by user
    },
    proof_description: {
      type: String,
    },
    // User Input Details for Certificate
    certificate_number: {
      type: String, 
    },
    certificate_date: {
        type: Date,
    },
    competency_type: {
        type: String, // e.g. "Fungsional", "Struktural"
    },
    training_type: {
        type: String, // e.g. "Online", "Klasikal"
    },
    
    submission_date: {
        type: Date,
    },
    
    // Official Certificate from System (Optional/Manager side)
    official_certificate_file: {
        type: String, // URL to PDF
    },
    certificate_file: {
        type: String, // Field used by frontend
    },
  },
  {
    timestamps: true,
  }
);

const History = mongoose.model("history", HistorySchema, "history");
module.exports = History;
