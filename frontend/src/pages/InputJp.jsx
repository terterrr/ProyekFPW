import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  FormHelperText
} from "@mui/material";
import Sidebar from "../components/Sidebar";
import { getAccessToken } from "../utils/tokenStorage";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { CloudUpload, Search, Save, ArrowBack } from "@mui/icons-material";

const InputJp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const historyItem = location.state?.historyItem;
    const [user, setUser] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();
    const selectedFile = watch("file");
    
    const isEditMode = location.state?.mode === 'edit';

    useEffect(() => {
        const token = getAccessToken();
        if (token) {
            setUser(jwtDecode(token));
        }
        if (!historyItem) {
            alert("Data seminar tidak ditemukan. Silahkan kembali.");
            navigate("/pelatihan");
        }
    }, [historyItem, navigate]);

    useEffect(() => {
        if(historyItem) {
             // Pre-fill read only data
             setValue("periode", new Date(historyItem.seminar_id?.seminar_date_start).getFullYear());
             setValue("total_jam", `${historyItem.seminar_id?.seminar_jp} JP`);
             setValue("tanggal", new Date(historyItem.seminar_id?.seminar_date_start).toLocaleDateString('id-ID'));
             setValue("penyelenggara", historyItem.seminar_id?.seminar_host);
             setValue("nama_pelatihan", historyItem.seminar_id?.seminar_title);
             
             // Pre-fill editable data if Edit Mode or if data exists (e.g. previously saved draft)
             if (historyItem.competency_type) setValue("jenis_pengembangan", historyItem.competency_type);
             if (historyItem.training_type) setValue("tipe_pelatihan", historyItem.training_type);
             // if (historyItem.certificate_number) setValue("no_sertifikat", historyItem.certificate_number);
             
             if (historyItem.proof_image) {
                 setPreviewImage(historyItem.proof_image);
             }
        }
    }, [historyItem, setValue]);
    
    // Image Preview Logic
    useEffect(() => {
        if (selectedFile && selectedFile.length > 0) {
            const file = selectedFile[0];
            const url = URL.createObjectURL(file);
            setPreviewImage(url);
            return () => {
                // If it's a blob url, revoke it. If it's the string from server, don't.
                if (url.startsWith('blob:')) URL.revokeObjectURL(url);
            }
        }
    }, [selectedFile]);

    const onSubmit = async (data) => {
        try {
            const token = getAccessToken();
            const formData = new FormData();
            formData.append("history_id", historyItem._id);
            // formData.append("certificate_number", data.no_sertifikat);
            formData.append("competency_type", data.jenis_pengembangan);
            formData.append("training_type", data.tipe_pelatihan);
            if (data.file && data.file[0]) {
                formData.append("file", data.file[0]);
            }

            await axios.post("http://localhost:3001/api/v1/history/submit", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            alert(isEditMode ? "Data berhasil diperbarui!" : "Data berhasil disimpan!");
            navigate(isEditMode ? "/riwayat" : "/pelatihan");
        } catch (error) {
            console.error(error);
            alert("Gagal menyimpan data.");
        }
    };
    


    if (!user || !historyItem) return null;

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar user={user} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
        <Container maxWidth={false}>
            <Paper sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", borderBottom: '1px solid #eee', pb: 2 }}>
                    Input Kelengkapan Pelatihan
                </Typography>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        
                        {/* Periode */}
                        <Grid container alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <Typography fontWeight="bold">Periode</Typography>
                            </Grid>
                            <Grid item xs={12} sm={9}>
                                <TextField 
                                    fullWidth 
                                    size="small" 
                                    variant="outlined" 
                                    {...register("periode")} 
                                    InputProps={{ readOnly: true, sx: { bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 1 } }} 
                                />
                            </Grid>
                        </Grid>

                        {/* NIP */}
                        <Grid container alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <Typography fontWeight="bold">NIP</Typography>
                            </Grid>
                            <Grid item xs={12} sm={9}>
                                <TextField 
                                    fullWidth 
                                    size="small" 
                                    value={`${user.nik || ''} - ${user.nama}`}
                                    InputProps={{ readOnly: true, sx: { bgcolor: '#e3f2fd', borderRadius: 1 } }} 
                                />
                            </Grid>
                        </Grid>

                        {/* Webinar */}
                        <Grid container alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <Typography fontWeight="bold">Webinar</Typography>
                            </Grid>
                            <Grid item xs={12} sm={9} sx={{ display: 'flex', gap: 1 }}>
                                <TextField 
                                    fullWidth 
                                    size="small" 
                                    value={historyItem.seminar_id?.seminar_title}
                                    InputProps={{ readOnly: true, sx: { bgcolor: '#e3f2fd', borderRadius: 1 } }} 
                                />
                                    {/* <Button variant="contained" color="primary" startIcon={<Search />} sx={{ minWidth: '120px' }}>
                                        Cari Data
                                    </Button> */}
                            </Grid>
                        </Grid>

                        {/* Nama Pelatihan */}
                        <Grid container alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <Typography fontWeight="bold">Nama Pelatihan</Typography>
                            </Grid>
                            <Grid item xs={12} sm={9}>
                                <TextField 
                                    fullWidth 
                                    size="small" 
                                    {...register("nama_pelatihan")} 
                                    InputProps={{ readOnly: true, sx: { bgcolor: '#fff' } }} 
                                />
                            </Grid>
                        </Grid>

                        {/* Jenis Pengembangan Kompetensi */}
                        <Grid container alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <Typography fontWeight="bold">Jenis Pengembangan Kompetensi</Typography>
                            </Grid>
                            <Grid item xs={12} sm={9}>
                                <FormControl fullWidth size="small">
                                    <Select 
                                        {...register("jenis_pengembangan", { required: true })} 
                                        defaultValue=""
                                        displayEmpty
                                        inputProps={{ 'aria-label': 'Without label' }}
                                        sx={{ bgcolor: '#fff' }}
                                    >
                                        <MenuItem value="" disabled><em>Pilih Jenis</em></MenuItem>
                                        <MenuItem value="Fungsional">Fungsional</MenuItem>
                                        <MenuItem value="Struktural">Struktural</MenuItem>
                                        <MenuItem value="Kultural">Sosial Kultural</MenuItem>
                                        <MenuItem value="Seminar">Seminar/Webinar</MenuItem>
                                    </Select>
                                </FormControl>
                                {errors.jenis_pengembangan && <FormHelperText error>Wajib diisi</FormHelperText>}
                            </Grid>
                        </Grid>

                        {/* Total Jam */}
                        <Grid container alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <Typography fontWeight="bold">Total Jam</Typography>
                            </Grid>
                            <Grid item xs={12} sm={9}>
                                <TextField 
                                    fullWidth 
                                    size="small" 
                                    {...register("total_jam")} 
                                    InputProps={{ readOnly: true, sx: { bgcolor: '#fff' } }} 
                                />
                            </Grid>
                        </Grid>

                        {/* Tanggal */}
                        <Grid container alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <Typography fontWeight="bold">Tanggal</Typography>
                            </Grid>
                            <Grid item xs={12} sm={9}>
                                <TextField 
                                    fullWidth 
                                    size="small" 
                                    {...register("tanggal")} 
                                    InputProps={{ readOnly: true, sx: { bgcolor: '#fff' } }} 
                                />
                            </Grid>
                        </Grid>

                        {/* Penyelenggara */}
                        <Grid container alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <Typography fontWeight="bold">Penyelenggara</Typography>
                            </Grid>
                            <Grid item xs={12} sm={9}>
                                <TextField 
                                    fullWidth 
                                    size="small" 
                                    {...register("penyelenggara")} 
                                    InputProps={{ readOnly: true, sx: { bgcolor: '#fff' } }} 
                                />
                            </Grid>
                        </Grid>

                        {/* Tipe Pelatihan */}
                        <Grid container alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <Typography fontWeight="bold">Tipe Pelatihan</Typography>
                            </Grid>
                            <Grid item xs={12} sm={9}>
                                <FormControl fullWidth size="small">
                                    <Select 
                                        {...register("tipe_pelatihan", { required: true })} 
                                        defaultValue="Pelatihan Online"
                                        sx={{ bgcolor: '#fff' }}
                                    >
                                        <MenuItem value="Pelatihan Online">Pelatihan Online</MenuItem>
                                        <MenuItem value="Klasikal">Klasikal (Tatap Muka)</MenuItem>
                                        <MenuItem value="Blended">Blended Learning</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {/* No Sertifikat
                        <Grid container alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <Typography fontWeight="bold">No Sertifikat</Typography>
                            </Grid>
                            <Grid item xs={12} sm={9}>
                                <TextField 
                                    fullWidth 
                                    size="small" 
                                    placeholder="Masukkan No Sertifikat"
                                    {...register("no_sertifikat", { required: true })} 
                                    error={!!errors.no_sertifikat}
                                    helperText={errors.no_sertifikat ? "Wajib diisi" : ""}
                                    sx={{ bgcolor: '#fff' }}
                                />
                            </Grid>
                        </Grid> */}

                        {/* Gambar Sertifikat */}
                        <Grid container alignItems="start">
                            <Grid item xs={12} sm={3} sx={{ pt: 1 }}>
                                <Typography fontWeight="bold">Gambar Sertifikat</Typography>
                            </Grid>
                            <Grid item xs={12} sm={9}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Button 
                                        variant="outlined" 
                                        component="label" 
                                        startIcon={<CloudUpload />}
                                        sx={{ bgcolor: '#fff', textTransform: 'none', color: '#555', borderColor: '#ccc' }}
                                    >
                                        Choose File
                                        <input type="file" hidden accept="image/*,.pdf" {...register("file", { required: !previewImage })} />
                                    </Button>
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedFile && selectedFile[0] ? selectedFile[0].name : "No file chosen"}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1 }}>
                                    *Maksimal Size File adalah 2MB dengan Extensi File (png / jpg / pdf)
                                </Typography>
                                
                                {errors.file && <Typography color="error" variant="caption">File Wajib diupload</Typography>}

                                {/* Preview */}
                                {previewImage && (
                                    <Box sx={{ mt: 2, border: '1px solid #e0e0e0', p: 1, borderRadius: 1, bgcolor: '#fff', display: 'inline-block' }}>
                                        <img src={previewImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', display: 'block' }} />
                                    </Box>
                                )}
                            </Grid>
                        </Grid>

                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 5, gap: 2, borderTop: '1px solid #eee', pt: 3 }}>
                        <Button 
                            variant="contained" 
                            startIcon={<ArrowBack />} 
                            onClick={() => navigate(-1)}
                            sx={{ bgcolor: '#757575', '&:hover': { bgcolor: '#616161' } }}
                        >
                            Kembali
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="success" 
                            startIcon={<Save />}
                            sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
                        >
                            Simpan Data
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default InputJp;
