import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Button, CircularProgress, Container, Paper } from "@mui/material";
import axios from "axios";
import { getAccessToken } from "../utils/tokenStorage";
import { CheckCircleOutline, ErrorOutline } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import { jwtDecode } from "jwt-decode";
import { getApiBaseUrl } from "../utils/apiConfig";

const SeminarAttendance = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("loading"); // loading, success, error
    const [message, setMessage] = useState("");
    const [user, setUser] = useState(null);

    const location = useLocation();

    useEffect(() => {
        const token = getAccessToken();
        if (!token) {
            alert("Silahkan login terlebih dahulu untuk melakukan absensi.");
            navigate("/", { state: { from: location } });
            return;
        }
        setUser(jwtDecode(token));
        
        attendSeminar(token);
    }, [id, navigate, location]);
    const attendSeminar = async (token) => {
        try {
            const res = await axios.post(`${getApiBaseUrl()}/history/attend`, 
                { seminar_id: id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatus("success");
            setMessage(res.data.message);
        } catch (error) {
            console.error(error);
            setStatus("error");
            setMessage(error.response?.data?.message || "Gagal melakukan absensi.");
        }
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
            {/* Optional Sidebar or minimal layout */}
             {user && <Sidebar user={user} />} 

            <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3, width: '100%' }}>
                    {status === "loading" && (
                        <>
                            <CircularProgress size={60} sx={{ mb: 2 }} />
                            <Typography variant="h6">Memproses Absensi...</Typography>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <CheckCircleOutline sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
                            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: "success.main" }}>
                                Absensi Berhasil!
                            </Typography>
                            <Typography color="text.secondary" paragraph>
                                {message}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 3 }}>
                                Terima kasih telah hadir. Bukti kehadiran anda telah tercatat.
                            </Typography>
                            <Button variant="contained" onClick={() => navigate("/riwayat")}>
                                Lihat Riwayat
                            </Button>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <ErrorOutline sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
                            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: "error.main" }}>
                                Gagal Absensi
                            </Typography>
                            <Typography color="text.secondary" paragraph>
                                {message}
                            </Typography>
                            <Button variant="outlined" onClick={() => window.location.reload()} sx={{ mr: 1 }}>
                                Coba Lagi
                            </Button>
                            <Button variant="text" onClick={() => navigate("/dashboard")}>
                                Kembali ke Dashboard
                            </Button>
                        </>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default SeminarAttendance;
