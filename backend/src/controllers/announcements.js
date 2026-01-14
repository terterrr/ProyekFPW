const Announcements = require("../models/Announcements");

const getAllAnnouncements = async (req, res) => {
  try {
    const data = await Announcements.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAnnouncements,
  createAnnouncement: async (req, res) => {
      try {
          const { title, description, video_url } = req.body;
          let thumbnail = null;
          if (req.file) {
              thumbnail = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
          }
          const announcement = await Announcements.create({
              title,
              description,
              video_url,
              thumbnail
          });
          res.status(201).json(announcement);
      } catch (error) {
          res.status(500).json({ message: error.message });
      }
  },
  updateAnnouncement: async (req, res) => {
      try {
          const { title, description, video_url } = req.body;
          let updateData = { title, description, video_url };
          
          if (req.file) {
              updateData.thumbnail = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
          }
          
          const announcement = await Announcements.findByIdAndUpdate(req.params.id, updateData, { new: true });
          if (!announcement) return res.status(404).json({ message: "Announcement not found" });
          res.json(announcement);
      } catch (error) {
           res.status(500).json({ message: error.message });
      }
  },
  deleteAnnouncement: async (req, res) => {
      try {
           const announcement = await Announcements.findByIdAndDelete(req.params.id);
           if (!announcement) return res.status(404).json({ message: "Announcement not found" });
           res.json({ message: "Announcement deleted successfully" });
      } catch (error) {
           res.status(500).json({ message: error.message });
      }
  }
};
