import {
  Box,
  Typography,
  Container,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  Alert
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Sidebar from "../components/Sidebar";
import { getAccessToken } from "../utils/tokenStorage";
import { useParams, useNavigate } from "react-router-dom";
import { QrCodeScanner, CloudUpload, CheckCircle, Cancel } from "@mui/icons-material";
import QRCode from "react-qr-code";

const ManageSeminar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [seminar, setSeminar] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
        setUser(jwtDecode(token));
    }
  }, []);

  const fetchData = async () => {
      try {
          const token = getAccessToken();
          // Fetch Seminar Details
          const semRes = await axios.get(`http://localhost:3001/api/v1/seminar/${id}`);
          setSeminar(semRes.data);

          // Fetch Participants (History for this seminar)
          const histRes = await axios.get(`http://localhost:3001/api/v1/history/seminar/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setParticipants(histRes.data);
      } catch (error) {
          console.error("Error data:", error);
      }
  };

  useEffect(() => {
      if(user) fetchData();
  }, [user, id]);


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // File upload state and handler
  const [uploadTarget, setUploadTarget] = useState(null); // { type: 'HISTORY' | 'SEMINAR', id: string }

  const handleTriggerUpload = (type, id) => {
      setUploadTarget({ type, id });
      document.getElementById('hidden-file-input').click();
  };

  const handleFileChange = async (e) => {
      if (!e.target.files || e.target.files.length === 0 || !uploadTarget) return;
      
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
          const token = getAccessToken();
          let apiUrl = "";
          
          if (uploadTarget.type === 'HISTORY') {
              formData.append("history_id", uploadTarget.id);
              apiUrl = `http://localhost:3001/api/v1/history/update-certificate`;
          } else {
              // SEMINAR (Shared)
              formData.append("id", uploadTarget.id); // seminar id
              formData.append("label", "Sertifikat Umum");
              apiUrl = `http://localhost:3001/api/v1/seminar/upload-certificate`;
          }

          await axios.post(apiUrl, 
               formData,
               { headers: { 
                   Authorization: `Bearer ${token}`,
                   "Content-Type": "multipart/form-data"
               }}
          );
          alert("Upload Berhasil!");
          fetchData();
      } catch (error) {
          console.error(error);
          alert("Gagal upload");
      }
      e.target.value = null;
  };

  // Verification Logic
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);

  const handleOpenVerify = (participant) => {
      setSelectedProof(participant);
      setVerifyModalOpen(true);
  };

  const handleVerify = async (status) => {
      if (!selectedProof) return;
      try {
          const token = getAccessToken();
          await axios.post("http://localhost:3001/api/v1/history/verify", 
              { history_id: selectedProof._id, status },
              { headers: { Authorization: `Bearer ${token}` } }
          );
          alert(`Status berhasil diupdate: ${status}`);
          setVerifyModalOpen(false);
          fetchData();
      } catch (error) {
          console.error(error);
          alert("Gagal update status");
      }
  };

  if (!user || !seminar) return null;

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar user={user} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", color: "#1a237e" }}>
            Kelola Seminar: {seminar.seminar_title}
          </Typography>

          <Paper sx={{ width: '100%', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
              <Tab label="Info & Absensi" />
              <Tab label="Peserta & Sertifikat" />
            </Tabs>
          </Paper>

          {tabValue === 0 && (
              <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                      <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Typography variant="h6" gutterBottom>QR Code Absensi</Typography>
                          
                          {window.location.hostname === 'localhost' && (
                              <Alert severity="warning" sx={{ mb: 2, width: '100%' }}>
                                  Untuk bisa di-scan HP, buka halaman ini di PC menggunakan IP (contoh: 192.168.x.x:5173), bukan "localhost".
                              </Alert>
                          )}

                          <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2, mb: 2, bgcolor: 'white' }}>
                              <QRCode 
                                value={`${window.location.protocol}//${window.location.host}/seminar/${seminar._id}/attend`} 
                                size={200}
                              />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                              Scan QR ini untuk melakukan presensi kehadiran.
                          </Typography>
                          <Button variant="contained" sx={{ mt: 2 }}>Download QR</Button>
                      </Paper>
                  </Grid>
                   <Grid size={{ xs: 12, md: 6 }}>
                      <Paper sx={{ p: 3 }}>
                          <Typography variant="h6" gutterBottom>Detail Seminar</Typography>
                          <Typography><strong>Tanggal:</strong> {new Date(seminar.seminar_date_start).toLocaleDateString()}</Typography>
                          <Typography><strong>Penyelenggara:</strong> {seminar.seminar_host}</Typography>
                          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/seminar/create', { state: { mode: 'edit', seminar: seminar } })} >Edit Informasi</Button>
                      </Paper>
                  </Grid>
              </Grid>
          )}

          {tabValue === 1 && (
               <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
                
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Daftar Peserta</Typography>
                    <Box>
                         <Button 
                            variant="outlined" 
                            startIcon={<CloudUpload />} 
                            sx={{ mr: 1 }}
                            onClick={() => handleTriggerUpload('SEMINAR', seminar._id)}
                         >
                            Upload Sertifikat Umum (Template)
                         </Button>
                    </Box>
                </Box>
                 
                 {seminar.seminar_certificates?.length > 0 && (
                     <Box sx={{ mb: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                         <Typography variant="subtitle2" gutterBottom>Sertifikat Umum Tersedia:</Typography>
                         {seminar.seminar_certificates.map((cert, idx) => (
                             <Chip 
                                key={idx} 
                                label={cert.label || "File"} 
                                component="a" 
                                href={cert.url} 
                                target="_blank" 
                                clickable 
                                color="primary" 
                                variant="outlined"
                                icon={<CheckCircle />}
                                sx={{ mr: 1 }}
                             />
                         ))}
                     </Box>
                 )}

                <TableContainer>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>No</TableCell>
                        <TableCell>Nama Peserta</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Detail Submission</TableCell>
                        <TableCell>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                        {participants.map((p, idx) => (
                            <TableRow key={p._id}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>{p.user_id?.nama || "Unknown"}</TableCell>
                                <TableCell>{p.user_id?.email || "-"}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={p.status} 
                                        color={p.status === 'verified' ? 'success' : p.status === 'rejected' ? 'error' : p.status === 'submitted' ? 'warning' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {p.status === 'submitted' || p.status === 'verified' ? (
                                        <Button size="small" variant="text" onClick={() => handleOpenVerify(p)}>Lihat Bukti</Button>
                                    ) : "-"}
                                </TableCell>
                                <TableCell>
                                    {/* Action Buttons */}
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {p.status === 'submitted' && (
                                            <Button 
                                                size="small" 
                                                variant="contained" 
                                                color="primary"
                                                onClick={() => handleOpenVerify(p)}
                                            >
                                                Verifikasi
                                            </Button>
                                        )}
                                        <Button 
                                            size="small" 
                                            startIcon={<CloudUpload />}
                                            onClick={() => handleTriggerUpload('HISTORY', p._id)}
                                        >
                                            Upload Cert
                                        </Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                         {participants.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">Belum ada peserta terdaftar.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                  </Table>
                </TableContainer>
               </Paper>
          )}
          
          {/* Hidden File Input for Upload */}
          <input 
              type="file" 
              id="hidden-file-input" 
              style={{ display: 'none' }} 
              accept="image/*,application/pdf"
              onChange={handleFileChange}
          />

          {/* Verification Modal */}
          {verifyModalOpen && selectedProof && (
             <Box sx={{ 
                 position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                 bgcolor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' 
             }}>
                 <Paper sx={{ p: 4, maxWidth: 600, width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                     <Typography variant="h6" gutterBottom fontWeight="bold">Verifikasi Bukti Peserta</Typography>
                     
                     <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2, mb: 3 }}>
                         <Typography color="text.secondary">Nama:</Typography>
                         <Typography fontWeight="bold">{selectedProof.user_id?.nama}</Typography>

                         <Typography color="text.secondary">No Sertifikat:</Typography>
                         <Typography>{selectedProof.certificate_number || "-"}</Typography>

                         <Typography color="text.secondary">Jenis Pengembangan:</Typography>
                         <Typography>{selectedProof.competency_type || "-"}</Typography>

                         <Typography color="text.secondary">Tipe Pelatihan:</Typography>
                         <Typography>{selectedProof.training_type || "-"}</Typography>
                     </Box>

                     <Typography variant="subtitle2" gutterBottom>Bukti Upload:</Typography>
                     {selectedProof.proof_image ? (
                         <Box sx={{ mb: 3, border: '1px solid #eee', p: 1 }}>
                             <img src={selectedProof.proof_image} alt="Bukti" style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }} />
                             <Button href={selectedProof.proof_image} target="_blank" sx={{ mt: 1 }}>Buka Gambar Full</Button>
                         </Box>
                     ) : (
                         <Typography color="error" paragraph>Tidak ada gambar bukti diupload.</Typography>
                     )}

                     <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                         <Button variant="outlined" color="inherit" onClick={() => setVerifyModalOpen(false)}>Batal</Button>
                         <Button variant="contained" color="error" onClick={() => handleVerify('rejected')}>Tolak</Button>
                         <Button variant="contained" color="success" onClick={() => handleVerify('verified')}>Setujui & Verifikasi</Button>
                     </Box>
                 </Paper>
             </Box>
          )}

        </Container>
      </Box>
    </Box>
  );
};

export default ManageSeminar;
