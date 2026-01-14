import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  TextField,
  Grid,
  MenuItem,
  CircularProgress
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Sidebar from "../components/Sidebar";
import { getAccessToken } from "../utils/tokenStorage";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";

const CreateSeminar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  
  const isEditMode = location.state?.mode === 'edit';
  const editData = location.state?.seminar;

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
       defaultValues: {
            seminar_title: "",
            seminar_subtitle: "",
            seminar_date_start: "",
            seminar_date_end: "",
            seminar_host: "BPSDM JATIM",
            seminar_desc: "",
            seminar_type: "online",
            seminar_jp: 3,
            seminar_img: "https://placehold.co/600x400",
            seminar_location: "Zoom Meeting",
            seminar_registration_link: "",
            manager_id: "" 
       }
  });

  const watchImg = watch("seminar_img");
  const watchStartDate = watch("seminar_date_start");

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
        const decoded = jwtDecode(token);
        setUser(decoded);
        if (decoded.role !== 'manager' && decoded.role !== 'admin') {
            alert("Akses ditolak. Halaman ini hanya untuk Manager.");
            navigate('/dashboard');
        }

        // Fetch managers if admin
        if (decoded.role === 'admin') {
            fetchManagers(token);
        }
    }
  }, [navigate]);

  useEffect(() => {
    if (isEditMode && editData) {
        // Format dates for datetime-local
        const formatDate = (dateString) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
        };

        reset({
            seminar_title: editData.seminar_title || "",
            seminar_subtitle: editData.seminar_subtitle || "",
            seminar_date_start: formatDate(editData.seminar_date_start),
            seminar_date_end: formatDate(editData.seminar_date_end),
            seminar_host: editData.seminar_host || "",
            seminar_desc: editData.seminar_desc || "",
            seminar_type: editData.seminar_type || "online",
            seminar_jp: editData.seminar_jp || 0,
            seminar_img: editData.seminar_img || "",
            seminar_location: editData.seminar_location || "",
            seminar_registration_link: editData.seminar_registration_link || "",
            manager_id: editData.created_by || ""
        });
    }
  }, [isEditMode, editData, reset]);

  const fetchManagers = async (token) => {
    try {
        const res = await axios.get("http://localhost:3001/api/v1/users", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const managerList = res.data.filter(u => u.role === 'manager' || u.role === 'admin');
        setManagers(managerList);
    } catch (error) {
        console.error("Failed to fetch managers", error);
    }
  };

  const onSubmit = async (data) => {
      setLoading(true);
      try {
          const token = getAccessToken();
          if (isEditMode) {
            await axios.put(`http://localhost:3001/api/v1/seminar/${editData._id}`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Seminar berhasil diperbarui!");
          } else {
            await axios.post("http://localhost:3001/api/v1/seminar", data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Seminar berhasil dibuat!");
          }
           // Navigate logic: Admin to Admin List, Manager to Manager List
           if (user.role === 'admin') {
               navigate("/admin/seminar-list");
           } else {
               navigate("/seminar/manage");
           }
      } catch (error) {
          console.error("Failed to save seminar:", error);
          alert(error.response?.data?.message || "Gagal menyimpan seminar");
      } finally {
          setLoading(false);
      }
  };

  if (!user) return null;

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar user={user} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", color: "#1a237e" }}>
            {isEditMode ? "Edit Seminar" : "Buat Seminar Baru"}
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
              {/* Section 1: Informasi Utama */}
              <Paper sx={{ p: 4, mb: 4, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                  <Typography variant="h6" sx={{ mb: 3, color: '#1a237e', fontWeight: 'bold', borderBottom: '2px solid #e0e0e0', pb: 1 }}>
                      Informasi Utama
                  </Typography>
                  <Grid container spacing={3}>
                      {user.role === 'admin' && (
                           <Grid item xs={12}>
                              <TextField
                                  fullWidth
                                  select
                                  label="Assign Manager (Optional)"
                                  defaultValue=""
                                  {...register("manager_id")}
                                  helperText="Jika kosong, anda akan menjadi manager seminar ini."
                              >
                                  <MenuItem value=""><em>-- Pilih Manager --</em></MenuItem>
                                  {managers.map((mgr) => (
                                      <MenuItem key={mgr._id} value={mgr._id}>
                                          {mgr.nama} ({mgr.email})
                                      </MenuItem>
                                  ))}
                              </TextField>
                           </Grid>
                      )}

                      <Grid item xs={12} md={6}>
                          <TextField
                              fullWidth
                              label="Judul Seminar"
                              placeholder="Contoh: Webinar ASN Belajar Seri 1"
                              {...register("seminar_title", { required: "Judul seminar harus diisi" })}
                              error={!!errors.seminar_title}
                              helperText={errors.seminar_title?.message}
                          />
                      </Grid>
                      <Grid item xs={12} md={6}>
                          <TextField
                              fullWidth
                              label="Sub-judul / Tagline"
                              placeholder="Contoh: Menuju Birokrasi Berkelas Dunia"
                              {...register("seminar_subtitle", { required: "Sub-judul harus diisi" })}
                              error={!!errors.seminar_subtitle}
                              helperText={errors.seminar_subtitle?.message}
                          />
                      </Grid>
                      <Grid item xs={12}>
                          <TextField
                              fullWidth
                              label="Penyelenggara (Host)"
                              {...register("seminar_host", { required: "Penyelenggara harus diisi" })}
                              error={!!errors.seminar_host}
                              helperText={errors.seminar_host?.message}
                          />
                      </Grid>
                  </Grid>
              </Paper>

              {/* Section 2: Jadwal & Pelaksanaan */}
              <Paper sx={{ p: 4, mb: 4, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                   <Typography variant="h6" sx={{ mb: 3, color: '#1a237e', fontWeight: 'bold', borderBottom: '2px solid #e0e0e0', pb: 1 }}>
                      Jadwal & Pelaksanaan
                  </Typography>
                  <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                          <TextField
                              fullWidth
                              type="datetime-local"
                              label="Waktu Mulai"
                              InputLabelProps={{ shrink: true }}
                              {...register("seminar_date_start", { required: "Waktu mulai harus diisi" })}
                              error={!!errors.seminar_date_start}
                              helperText={errors.seminar_date_start?.message}
                          />
                      </Grid>
                      <Grid item xs={12} md={6}>
                          <TextField
                              fullWidth
                              type="datetime-local"
                              label="Waktu Selesai"
                              InputLabelProps={{ shrink: true }}
                              {...register("seminar_date_end", { 
                                  required: "Waktu selesai harus diisi",
                                  validate: (val) => {
                                      if (watchStartDate && new Date(val) <= new Date(watchStartDate)) {
                                          return "Waktu selesai harus setelah waktu mulai";
                                      }
                                      return true;
                                  }
                              })}
                              error={!!errors.seminar_date_end}
                              helperText={errors.seminar_date_end?.message}
                          />
                      </Grid>
                      <Grid item xs={12} md={4}>
                          <TextField
                              fullWidth
                              select
                              label="Tipe Seminar"
                              defaultValue="online"
                              {...register("seminar_type", { required: true })}
                          >
                              <MenuItem value="online">Online</MenuItem>
                              <MenuItem value="onsite">Onsite</MenuItem>
                              <MenuItem value="hybrid">Hybrid</MenuItem>
                          </TextField>
                      </Grid>
                      <Grid item xs={12} md={4}>
                          <TextField
                              fullWidth
                              type="number"
                              label="Jumlah JP"
                              {...register("seminar_jp", { 
                                  required: "Jumlah JP harus diisi",
                                  min: { value: 1, message: "Minimal 1 JP" }
                              })}
                              error={!!errors.seminar_jp}
                              helperText={errors.seminar_jp?.message}
                          />
                      </Grid>
                      <Grid item xs={12} md={4}>
                          <TextField
                              fullWidth
                              label="Lokasi / Link Zoom"
                              placeholder="URL Zoom atau Nama Tempat"
                              {...register("seminar_location")}
                          />
                      </Grid>
                  </Grid>
              </Paper>

              {/* Section 3: Media & Detail */}
              <Paper sx={{ p: 4, mb: 4, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                   <Typography variant="h6" sx={{ mb: 3, color: '#1a237e', fontWeight: 'bold', borderBottom: '2px solid #e0e0e0', pb: 1 }}>
                      Media & Detail
                  </Typography>
                  <Grid container spacing={3}>
                       <Grid item xs={12}>
                          <TextField
                              fullWidth
                              label="Image URL (Poster)"
                              helperText={errors.seminar_img?.message || "Masukkan URL langsung gambar poster seminar"}
                              {...register("seminar_img", { required: "Gambar poster wajib diisi" })}
                              error={!!errors.seminar_img}
                          />
                      </Grid>
                       {watchImg && (
                           <Grid item xs={12}>
                               <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, textAlign: 'center', bgcolor: '#fafafa' }}>
                                   <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>Preview Poster:</Typography>
                                   <img 
                                      src={watchImg} 
                                      alt="Preview" 
                                      style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain' }}
                                      onError={(e) => {e.target.style.display='none'}}
                                   />
                               </Box>
                           </Grid>
                       )}
                      <Grid item xs={12}>
                          <TextField
                              fullWidth
                              multiline
                              rows={6}
                              label="Deskripsi Seminar"
                              {...register("seminar_desc", { required: "Deskripsi harus diisi" })}
                              error={!!errors.seminar_desc}
                              helperText={errors.seminar_desc?.message}
                          />
                      </Grid>
                  </Grid>
              </Paper>
            
              <Box sx={{ mt: 4, mb: 8 }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    size="large" 
                    fullWidth
                    disabled={loading}
                    sx={{ p: 1.5, fontSize: '1.1rem', fontWeight: 'bold', boxShadow: 3 }}
                  >
                      {loading ? <CircularProgress size={24} color="inherit" /> : (isEditMode ? "Simpan Perubahan" : "Buat Seminar")}
                  </Button>
              </Box>
          </form>
        </Container>
      </Box>
    </Box>
  );
};

export default CreateSeminar;
