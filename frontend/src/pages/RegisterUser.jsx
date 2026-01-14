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
  FormHelperText
} from "@mui/material";
import { useForm } from "react-hook-form";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { getAccessToken } from "../utils/tokenStorage";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { ArrowBack, Save } from "@mui/icons-material";

const RegisterUser = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();

    useEffect(() => {
        const token = getAccessToken();
        if (token) {
            setUser(jwtDecode(token));
        } else {
            navigate("/");
        }
    }, [navigate]);

    const onSubmit = async (data) => {
        try {
            const token = getAccessToken();
            await axios.post("http://localhost:3001/api/v1/users", data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("User registered successfully!");
            navigate("/admin/users");
        } catch (error) {
            console.error(error);
            alert("Failed to register user. " + (error.response?.data?.message || ""));
        }
    };

    if (!user) return null;

    return (
        <Box sx={{ display: "flex" }}>
            <Sidebar user={user} />
            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
                <Container maxWidth="md">
                    <Paper sx={{ p: 4, borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", borderBottom: '1px solid #eee', pb: 2 }}>
                            Registrasi Akun Baru
                        </Typography>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Nama Lengkap"
                                        {...register("nama", { required: "Nama wajib diisi" })}
                                        error={!!errors.nama}
                                        helperText={errors.nama?.message}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="NIK"
                                        {...register("nik", { required: "NIK wajib diisi" })}
                                        error={!!errors.nik}
                                        helperText={errors.nik?.message}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        {...register("email", { required: "Email wajib diisi" })}
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        type="password"
                                        {...register("password", { required: "Password wajib diisi", minLength: { value: 6, message: "Min 6 chars" } })}
                                        error={!!errors.password}
                                        helperText={errors.password?.message}
                                    />
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth error={!!errors.role}>
                                        <InputLabel>Role</InputLabel>
                                        <Select
                                            label="Role"
                                            defaultValue="peserta"
                                            {...register("role", { required: true })}
                                        >
                                            <MenuItem value="peserta">Peserta</MenuItem>
                                            <MenuItem value="manager">Manager</MenuItem>
                                            <MenuItem value="admin">Admin</MenuItem>
                                        </Select>
                                        {errors.role && <FormHelperText>Role wajib diisi</FormHelperText>}
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Kota"
                                        {...register("kota", { required: "Kota wajib diisi" })}
                                        error={!!errors.kota}
                                        helperText={errors.kota?.message}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="Usia"
                                        type="number"
                                        {...register("usia", { required: "Usia wajib diisi" })}
                                        error={!!errors.usia}
                                        helperText={errors.usia?.message}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth error={!!errors.kelamin}>
                                        <InputLabel>Jenis Kelamin</InputLabel>
                                        <Select
                                            label="Jenis Kelamin"
                                            defaultValue=""
                                            {...register("kelamin", { required: true })}
                                        >
                                            <MenuItem value="Laki-laki">Laki-laki</MenuItem>
                                            <MenuItem value="Perempuan">Perempuan</MenuItem>
                                        </Select>
                                        {errors.kelamin && <FormHelperText>Wajib diisi</FormHelperText>}
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="Tanggal Lahir"
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        {...register("tanggal_lahir", { required: "Wajib diisi" })}
                                        error={!!errors.tanggal_lahir}
                                        helperText={errors.tanggal_lahir?.message}
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
                                <Button 
                                    variant="outlined" 
                                    startIcon={<ArrowBack />} 
                                    onClick={() => navigate("/admin/users")}
                                >
                                    Kembali
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    color="primary"
                                    startIcon={<Save />}
                                >
                                    Simpan
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
};

export default RegisterUser;
