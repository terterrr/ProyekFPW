import {
  Box,
  Typography,
  Container,
  Button,
  Chip,
  Paper,
  Grid,
  Link,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Sidebar from "../components/Sidebar";
import { getAccessToken } from "../utils/tokenStorage";
import {
  CalendarMonth,
  AccessTime,
  Person,
  Description,
  VideoCameraFront,
} from "@mui/icons-material";

const SeminarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seminar, setSeminar] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setUser(jwtDecode(token));
    }
  }, []);

  useEffect(() => {
    const fetchSeminar = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/v1/seminar/${id}`);
        setSeminar(response.data);
      } catch (error) {
        console.error("Error fetching seminar:", error);
      }
    };
    if (id) fetchSeminar();
  }, [id]);

  if (!user || !seminar) return null;

  const isRegistrationOpen = seminar.seminar_registration_open;
  const statusColor = isRegistrationOpen ? "success" : "error";
  const statusText = isRegistrationOpen ? "Pendaftaran Dibuka" : "Pendaftaran Ditutup";

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar user={user} />
      <Box component="main" sx={{ flexGrow: 1, p: 2, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
        <Container maxWidth="lg">
          <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
            Kembali
          </Button>

          <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
              {seminar.seminar_title}
            </Typography>
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, fontWeight: "500" }}>
              {seminar.seminar_subtitle}
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
               <Chip 
                  icon={<AccessTime />} 
                  label={`(${seminar.seminar_jp} JP) ${seminar.seminar_host}`} 
                  variant="outlined" 
                />
               <Chip 
                  icon={<CalendarMonth />} 
                  label={`${new Date(seminar.seminar_date_start).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })} - ${new Date(seminar.seminar_date_end).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`} 
                  variant="outlined" 
                />
            </Box>

            <Box sx={{ mb: 3 }}>
                <Chip label={seminar.seminar_status === 'opened' ? 'Sedang Berlangsung' : 'Selesai'} color={seminar.seminar_status === 'opened' ? 'success' : 'default'} sx={{ mr: 1 }} />
                <Chip label={statusText} color={statusColor} />
            </Box>

            <Button 
                variant="contained" 
                size="large" 
                disabled={!isRegistrationOpen}
                // href={seminar.seminar_registration_link}  <-- Old link, now action
                // target="_blank"
                onClick={async () => {
                    if (window.confirm("Apakah Anda yakin ingin mendaftar seminar ini?")) {
                        try {
                            const token = getAccessToken();
                            const decoded = jwtDecode(token);
                            await axios.post("http://localhost:3001/api/v1/history/register", {
                                user_id: decoded.id,
                                seminar_id: id
                            });
                            alert("Berhasil mendaftar! Cek halaman Pelatihan Saya.");
                            navigate("/pelatihan");
                        } catch (err) {
                            alert(err.response?.data?.message || "Gagal mendaftar");
                        }
                    }
                }}
                sx={{ mb: 4 }}
            >
                + Daftar Webinar
            </Button>
            
            {/* Description */}
             <Typography variant="h6" gutterBottom>Deskripsi</Typography>
             <Typography paragraph sx={{ whiteSpace: "pre-line" }}>
                {seminar.seminar_desc}
             </Typography>

            <Divider sx={{ my: 4 }} />

            {/* Links Section */}
            <Typography variant="h6" gutterBottom>Link</Typography>
            {seminar.seminar_links && seminar.seminar_links.length > 0 ? (
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12 }}>
                        <Paper variant="outlined" sx={{ p:0 }}>
                             <Box component="div" sx={{ display: 'grid', gridTemplateColumns: '50px 1fr 2fr', gap: 2, p: 2, bgcolor: '#fafafa', fontWeight: 'bold' }}>
                                <Typography>No</Typography>
                                <Typography>Judul</Typography>
                                <Typography>Link</Typography>
                             </Box>
                             <Divider />
                             {seminar.seminar_links.map((link, index) => (
                                <Box key={index} component="div" sx={{ display: 'grid', gridTemplateColumns: '50px 1fr 2fr', gap: 2, p: 2, borderBottom: '1px solid #eee' }}>
                                    <Typography>{index + 1}</Typography>
                                    <Typography>{link.label}</Typography>
                                    <Link href={link.url} target="_blank" underline="hover">{link.url}</Link>
                                </Box>
                             ))}
                        </Paper>
                    </Grid>
                </Grid>
            ) : ( <Typography color="text.secondary" paragraph>Tidak ada link tersedia.</Typography> )}

            {/* Materials Section */}
            <Typography variant="h6" gutterBottom>Materi</Typography>
             {seminar.seminar_materials && seminar.seminar_materials.length > 0 ? (
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                         <Paper variant="outlined" sx={{ p:0 }}>
                             <Box component="div" sx={{ display: 'grid', gridTemplateColumns: '50px 1fr 2fr 100px', gap: 2, p: 2, bgcolor: '#fafafa', fontWeight: 'bold' }}>
                                <Typography>No</Typography>
                                <Typography>Judul</Typography>
                                <Typography>Link</Typography>
                                <Typography>File</Typography>
                             </Box>
                             <Divider />
                             {seminar.seminar_materials.map((mat, index) => (
                                <Box key={index} component="div" sx={{ display: 'grid', gridTemplateColumns: '50px 1fr 2fr 100px', gap: 2, p: 2, borderBottom: '1px solid #eee', alignItems: 'center' }}>
                                    <Typography>{index + 1}</Typography>
                                    <Typography>{mat.label}</Typography>
                                    <Link href={mat.url} target="_blank" underline="hover" sx={{ overflow:'hidden', textOverflow:'ellipsis' }}>{mat.url}</Link>
                                     <Button variant="contained" size="small" color="inherit" startIcon={<Description />} href={mat.url} target="_blank">
                                        Lihat
                                     </Button>
                                </Box>
                             ))}
                        </Paper>
                    </Grid>
                </Grid>
             ) : ( <Typography color="text.secondary">Tidak ada materi tersedia.</Typography> )}

          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default SeminarDetail;
