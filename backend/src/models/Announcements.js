const { Schema, default: mongoose } = require("mongoose");

const AnnouncementSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String, // URL/Path to image
      default: null, // Allow no thumbnail
    },
    video_url: {
      type: String, // YouTube Link
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Announcements = mongoose.model("announcements", AnnouncementSchema, "announcements");
module.exports = Announcements;
