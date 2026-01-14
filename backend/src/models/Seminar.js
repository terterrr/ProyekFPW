const { Schema, default: mongoose } = require("mongoose");

// STEP 1: definisi schema seminar
const SeminarSchema = new Schema(
  {
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true // Now required to track manager
    },
    seminar_title: {
      type: String,
      required: true,
      unique: true,
    },
    seminar_subtitle: {
      type: String,
      required: true,
    },
    seminar_date_start: {
      type: Date,
      required: true,
    },
    seminar_date_end: {
      type: Date,
      required: true,
    },
    seminar_host: {
      type: String,
      required: true,
    },
    seminar_desc: {
      type: String,
      required: true,
    },
    seminar_type: {
        type: String,
        required: true,
        enum: ["online", "onsite","hybrid"],
        default: "online",
    },
    seminar_jp: {
        type: Number,
        default: 0,
        required: true,
    },
    seminar_img: {
        type: String,
        required: true,
    },
    seminar_location: {
        type: String, // Location or Zoom Link
    },
    
    // Status Logic
    seminar_status: {
        type: String, // e.g., "opened", "closed", "completed" (can be derived or explicit)
        default: "opened"
    },
    seminar_registration_open: {
        type: Boolean,
        default: true
    },
    seminar_registration_link: {
        type: String, // For QR / External
    },
    
    // Arrays for details
    seminar_links: [{
        label: String,
        url: String
    }],
    seminar_materials: [{
        label: String,
        url: String
    }],
    // Shared Certificates (e.g. Template or Generic)
    seminar_certificates: [{
        label: String,
        url: String
    }],
    seminar_feedback: {
        type: String,
    },
  },
  {
    timestamps: true,
  }
);

// STEP 2: aktifkan virtual id
SeminarSchema.set("toJSON", { virtuals: true });

// STEP 3: buat model
const Seminar = mongoose.model(
  "seminar",
  SeminarSchema,
  "seminar"
);

// STEP 4: export
module.exports = Seminar;