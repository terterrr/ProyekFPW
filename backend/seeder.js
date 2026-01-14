const { fakerID_ID: faker } = require("@faker-js/faker");
const { default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");
const Users = require("./src/models/Users");
const Seminar = require("./src/models/Seminar");
const History = require("./src/models/History");
const Announcements = require("./src/models/Announcements");

// STEP 1: load env
require("dotenv").config();

// OPTIONAL: seed faker biar data konsisten
faker.seed(42);

// STEP 2: connect ke MongoDB
mongoose.connect(process.env.DB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Database connection failed:", err));

// Helper function to hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const SEED_COUNT_USERS = 10;
const SEED_COUNT_SEMINARS = 10;

const seedData = async () => {
  try {
    // 1. Bersihkan data lama
    await Users.deleteMany({});
    await Seminar.deleteMany({});
    await History.deleteMany({}); // Clear history as well to prevent orphaned data
    console.log("Data lama berhasil dihapus.");

    // 2. Siapkan data Users
    const usersData = [];

    // User Admin Fixed
    const adminPassword = await hashPassword("admin123");
    usersData.push({
      email: "admin@bpsdm.jatim.go.id",
      password: adminPassword,
      role: "admin",
      nik: "1234567890123456",
      nama: "Admin BPSDM",
      kota: "Surabaya",
      usia: 35,
      kelamin: "Laki-laki",
      tanggal_lahir: new Date("1990-01-01"),
      profile_picture: faker.image.avatar(),
    });

    // Manager Fixed
    const managerPassword = await hashPassword("manager123");
    const managerUser = {
      _id: new mongoose.Types.ObjectId(), // Create ID upfront to link seminars
      email: "manager@bpsdm.jatim.go.id",
      password: managerPassword,
      role: "manager",
      nik: "9999999999999999",
      nama: "Manager BPSDM",
      profile_picture: faker.image.avatar(),
      // Add missing required fields to pass validation
      kota: "Surabaya",
      usia: 40,
      kelamin: "Laki-laki",
      tanggal_lahir: new Date("1980-01-01"),
    };
    usersData.push(managerUser);

    // Peserta Fixed
    const pesertaPassword = await hashPassword("peserta123");
    usersData.push({
      email: "peserta@bpsdm.jatim.go.id",
      password: pesertaPassword,
      role: "peserta",
      nik: "1111111111111111",
      nama: "Peserta Demo",
      kota: "Surabaya",
      usia: 25,
      kelamin: "Laki-laki",
      tanggal_lahir: new Date("2000-01-01"),
      profile_picture: faker.image.avatar(),
    });

    // Random Users
    for (let i = 0; i < SEED_COUNT_USERS; i++) {
        // ... random users logic, forcing 'peserta' mostly
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const fullName = `${firstName} ${lastName}`;
      const rawPassword = `${firstName}123`; 
      const passwordHash = await hashPassword(rawPassword);
      const email = faker.internet.email({ firstName, lastName });

      usersData.push({
        email: email, // Use variable to ensure consistency
        password: passwordHash,
        role: "peserta", 
        nik: faker.string.numeric(16),
        nama: fullName,
        kota: faker.location.city(),
        usia: faker.number.int({ min: 20, max: 60 }),
        kelamin: faker.helpers.arrayElement(["Laki-laki", "Perempuan"]),
        tanggal_lahir: faker.date.birthdate({ min: 20, max: 60, mode: 'age' }),
        profile_picture: faker.image.avatar(),
      });
      console.log(`Created Random User: ${email} / ${rawPassword}`);
    }

    // 3. Siapkan data Seminar
    const seminarsData = [];
    const seminarTypes = ["online", "onsite", "hybrid"];
    
    // Specific Seminars
    const specificSeminars = [
        {
            title: "WEBINAR ASN BELAJAR SERI 1 TAHUN 2026",
            subtitle: "START WITH SMART - FROM LEARNING TO IMPACT",
            start: new Date("2026-01-15T09:00:00"),
            end: new Date("2026-01-15T13:00:00"),
            img: "https://semestabangkom.id/uploads/webinar/webinar_1.jpeg",
            zoom: "https://us06web.zoom.us/j/83814846468?pwd=dXQiq6zlOHWdSctxuKCHHBZU89ROh1.1",
            material: "https://drive.google.com/drive/folders/1QmPiKzvmOCwuLXxaKGOnfisiy6SPErmQ?usp=sharing"
        },
        {
            title: "WEBINAR ASN BELAJAR SERI 7 TAHUN 2025",
            subtitle: "Pemanfaatan Kerjasama dengan Lembaga Internasional",
            start: new Date("2025-07-20T09:00:00"),
            end: new Date("2025-07-20T13:00:00"),
            img: "https://placehold.co/600x400/png?text=Seri+7+2025",
            zoom: "https://zoom.us/j/123456789",
            material: "https://google.drive.com"
        }
    ];

    const requestedCount = 20;

    for (let i = 0; i < requestedCount; i++) {
        let seminarData = {};
        
        if (i < specificSeminars.length) {
            // Use specific data
            const spec = specificSeminars[i];
            seminarData = {
                created_by: managerUser._id,
                seminar_title: spec.title,
                seminar_subtitle: spec.subtitle,
                seminar_date_start: spec.start,
                seminar_date_end: spec.end,
                seminar_host: "BADAN PENGEMBANGAN SUMBER DAYA MANUSIA",
                seminar_desc: "Tujuan Webinar ini adalah untuk meningkatkan kompetensi ASN dalam menghadapi tantangan global dan birokrasi yang dinamis.",
                seminar_type: "online",
                seminar_jp: 3,
                seminar_img: spec.img,
                seminar_location: "Zoom Meeting",
                seminar_status: "opened",
                seminar_registration_open: true,
                seminar_registration_link: "https://semestabangkom.id",
                seminar_links: [
                    { label: "ZOOM LINK", url: spec.zoom }
                ],
                seminar_materials: [
                    { label: "Materi Seminar", url: spec.material }
                ],
                seminar_feedback: "",
            };
        } else {
            // Generate Random distributed across 2024, 25, 26
            const years = [2024, 2025, 2026];
            const year = faker.helpers.arrayElement(years);
            const month = faker.number.int({ min: 0, max: 11 });
            const day = faker.number.int({ min: 1, max: 28 });
            const startDate = new Date(year, month, day, 9, 0, 0);
            const endDate = new Date(year, month, day, 13, 0, 0);

            const title = `WEBINAR ASN BELAJAR SERI ${i + 1} TAHUN ${year}`;
            
            seminarData = {
                created_by: managerUser._id,
                seminar_title: title,
                seminar_subtitle: faker.company.catchPhrase(),
                seminar_date_start: startDate,
                seminar_date_end: endDate,
                seminar_host: "BADAN PENGEMBANGAN SUMBER DAYA MANUSIA",
                seminar_desc: faker.lorem.paragraphs(2),
                seminar_type: faker.helpers.arrayElement(seminarTypes),
                seminar_jp: 3,
                seminar_img: `https://placehold.co/600x400/png?text=Series+${year}`,
                seminar_location: faker.helpers.arrayElement(["Zoom Meeting", "BPSDM Jatim Hall A", "Hybrid"]),
                seminar_status: startDate > new Date() ? "opened" : "closed",
                seminar_registration_open: startDate > new Date(),
                seminar_registration_link: faker.internet.url(),
                seminar_links: [
                    { label: "LIVE YOUTUBE", url: "https://youtube.com" },
                    { label: "ZOOM LINK", url: "https://zoom.us" }
                ],
                seminar_materials: [
                    { label: "Materi Presentasi", url: "https://google.drive.com" }
                ],
                seminar_feedback: faker.lorem.sentence(),
            };
        }
        
        seminarsData.push(seminarData);
    }

    // 4. Insert ke Database
    await Users.insertMany(usersData);
    console.log(`${usersData.length} Users berhasil dibuat.`);
    console.log(`Admin created: email='admin@bpsdm.jatim.go.id', password='admin123'`);

    await Seminar.insertMany(seminarsData);
    console.log(`${seminarsData.length} Seminars berhasil dibuat.`);

    // 5. Siapkan data Pengumuman
    const announcementsData = [
      {
        title: "Tantangan Birokrasi Tahun 2025",
        description: "ASN Belajar Seri 1 | 2025",
        thumbnail: "https://i.ytimg.com/vi/UGfVbU_aH-c/maxresdefault.jpg",
        video_url: "https://www.youtube.com/watch?v=UGfVbU_aH-c",
      },
      {
        title: "Arah Kebijakan Pengembangan Kompetensi ASN Tahun 2025",
        description: "ASN Belajar Seri 2 | 2025",
        thumbnail: "https://i.ytimg.com/vi/1LESBc719RQ/maxresdefault.jpg",
        video_url: "https://www.youtube.com/watch?v=1LESBc719RQ&t=7s",
      },
      {
        title: "Learning Management and Collaborative System",
        description: "ASN Berbagi Ilmu - Knowledge Sharing Forum",
        thumbnail: "https://placehold.co/600x400?text=No+Thumbnail", // Placeholder as requested (no thumbnail provided in text, used placeholder or null)
        video_url: "https://www.youtube.com/watch?v=bF9CABQlbpk",
      },
      {
        title: "Evaluasi Pasca Pelatihan: Menilai Dampak dan Efektivitas Program terhadap Kinerja",
        description: "ASN Berbagi Ilmu - Knowledge Sharing Forum",
        thumbnail: "https://i.ytimg.com/vi/bBDPi7ohJvo/maxresdefault.jpg",
        video_url: "https://www.youtube.com/watch?v=bBDPi7ohJvo",
      },
      {
        title: "Mekanisme Penjaminan Mutu: Panduan Lengkap",
        description: "ASN Berbagi Ilmu - Knowledge Sharing Forum",
        thumbnail: "https://i.ytimg.com/vi/ihB-o-bftRc/maxresdefault.jpg",
        video_url: "https://www.youtube.com/watch?v=ihB-o-bftRc",
      },
    ];

    await Announcements.deleteMany({});
    await Announcements.insertMany(announcementsData);
    // 6. Siapkan data History (Dummy Data untuk Riwayat)
    // Ambil beberapa user dan seminar
    const userForHistory = await Users.findOne({ email: { $ne: "admin@bpsdm.jatim.go.id" } });
    const seminarsForHistory = await Seminar.find().limit(5);

    if (userForHistory && seminarsForHistory.length > 0) {
        const historyData = seminarsForHistory.map((seminar, index) => {
            // Mix status
            const status = index % 2 === 0 ? "verified" : "submitted";
            const date = new Date();
            date.setDate(date.getDate() - index * 10); // Spread dates

            return {
                user_id: userForHistory._id,
                seminar_id: seminar._id,
                status: status,
                registration_date: new Date(date.getTime() - 86400000),
                submission_date: date,
                proof_image: `https://placehold.co/150x100?text=Sertifikat+${index+1}`,
                certificate_number: `${faker.number.int(100000)}/WEBINAR/ASNB/${new Date().getFullYear()}`,
                certificate_date: date,
                proof_description: "Partisipasi aktif",
            };
        });

        await History.insertMany(historyData);
        console.log(`${historyData.length} History records berhasil dibuat untuk user: ${userForHistory.email}`);
    }

    console.log(`${announcementsData.length} Announcements berhasil dibuat.`);

  } catch (error) {
    console.error("Seeder error:", error);
  } finally {
    mongoose.disconnect();
    console.log("Database disconnected.");
  }
};

// Execute Seeder
seedData();
