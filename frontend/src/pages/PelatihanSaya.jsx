import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Chip,
  Grid,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Sidebar from "../components/Sidebar";
import { getAccessToken } from "../utils/tokenStorage";
import { UploadFile, Download, CheckCircle, Warning, Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const PelatihanSaya = () => {
  const [histories, setHistories] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setUser(jwtDecode(token));
    }
  }, []);

  const fetchHistories = async () => {
      try {
          if(!user) return;
          const response = await axios.get(`http://localhost:3001/api/v1/history/user/${user.id}`);
          setHistories(response.data);
      } catch (error) {
          console.error("Error fetching histories:", error);
      }
  };

  useEffect(() => {
    if(user) fetchHistories();
  }, [user]);

  if (!user) return null;

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar user={user} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", color: "#1a237e" }}>
            Pelatihan Saya
          </Typography>

            {histories.length === 0 ? (
                <Typography color="text.secondary">Belum ada pelatihan yang diikuti.</Typography>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {histories.map((item, index) => (
                        <Paper key={item._id} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'start', borderLeft: '5px solid #1976d2' }}>
                            <Box sx={{ minWidth: '40px', fontWeight: 'bold', color: '#1976d2' }}>
                                {index + 1}
                            </Box>
                            
                            {/* Icon / Image Placeholder */}
                            <Box sx={{ 
                                width: 80, 
                                height: 80, 
                                bgcolor: '#eee', 
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                             }}>
                                {item.seminar_id?.seminar_img ? 
                                    <img src={item.seminar_id.seminar_img} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                    : <Typography variant="caption">No Image</Typography> 
                                }
                             </Box>

                             {/* Content */}
                             <Box sx={{ flexGrow: 1 }}>
                                <Chip 
                                    label={item.seminar_id?.seminar_type || "Seminar"} 
                                    size="small" 
                                    color="primary" 
                                    sx={{ mb: 1, height: 20, fontSize: '0.7rem' }} 
                                />
                                <Typography variant="h6" fontWeight="bold">
                                    {item.seminar_id?.seminar_title}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {item.seminar_id?.seminar_desc}
                                </Typography>

                                <Grid container spacing={2} sx={{ bgcolor: '#fafafa', p: 1, borderRadius: 1 }}>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Typography variant="caption" color="text.secondary">Tanggal</Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {item.seminar_id?.seminar_date_start ? new Date(item.seminar_id.seminar_date_start).toLocaleDateString('id-ID') : '-'}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Typography variant="caption" color="text.secondary">Jumlah JP</Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {item.seminar_id?.seminar_jp}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Typography variant="caption" color="text.secondary">Penyelenggara</Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {item.seminar_id?.seminar_host}
                                        </Typography>
                                    </Grid>
                                </Grid>
                             </Box>

                             {/* Actions */}
                             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 150 }}>
                                <Button 
                                    variant="outlined" 
                                    startIcon={<Edit />}
                                    size="small"
                                    onClick={() => navigate('/input-jp', { state: { historyItem: item } })}
                                    // disabled removed as requested
                                >
                                    {item.status === 'submitted' ? 'Edit Bukti' : 'Isi JP'}
                                </Button>
                                
                                <Button 
                                    variant="contained" 
                                    color="success"
                                    startIcon={<Download />}
                                    size="small"
                                    onClick={() => {
                                        const personalCert = item.certificate_file;
                                        const sharedCert = item.seminar_id?.seminar_certificates?.[0]?.url;
                                        
                                        if (personalCert) {
                                            window.open(personalCert, '_blank');
                                        } else if (sharedCert) {
                                            window.open(sharedCert, '_blank');
                                        } else {
                                            alert("Sertifikat belum tersedia.");
                                        }
                                    }}
                                    // disabled removed as requested
                                >
                                    Download Sertifikat
                                </Button>

                                {item.status === 'verified' && <Chip icon={<CheckCircle />} label="Terverifikasi" color="success" size="small" />}
                                {item.status === 'rejected' && <Chip icon={<Warning />} label="Ditolak" color="error" size="small" />}
                                {item.status === 'submitted' && <Chip label="Menunggu Verifikasi" color="warning" size="small" />}

                             </Box>
                        </Paper>
                    ))}
                </Box>
            )}
        </Container>
      </Box>
    </Box>
  );
};

export default PelatihanSaya;
