import { Box, Typography, Paper, Button, Grid, LinearProgress } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { getAccessToken } from "../utils/tokenStorage";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { EmojiEvents, SupportAgent, Person, Groups, CastForEducation, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import successImg from "../assets/success.jpg";
import custSupportImg from "../assets/cust_support.jpg";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [histories, setHistories] = useState([]);
  const [stats, setStats] = useState({
      totalJp: 0,
      targetJp: 20,
      kepemimpinan: 0,
      fungsional: 0,
      teknis: 0,
      seminar: 0,
      lainnya: 0,
      online: 0,
      offline: 0,
      blended: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
        const decoded = jwtDecode(token);
        setUser(decoded);
        fetchHistories(decoded.id);
    }
  }, []);

  const fetchHistories = async (userId) => {
      try {
          const response = await axios.get(`http://localhost:3001/api/v1/history/user/${userId}`);
          calculateStats(response.data);
          setHistories(response.data);
      } catch (error) {
          console.error("Error fetching histories:", error);
      }
  };

  const calculateStats = (data) => {
      let total = 0;
      let cats = { kepemimpinan: 0, fungsional: 0, teknis: 0, seminar: 0, lainnya: 0 };
      let types = { online: 0, offline: 0, blended: 0 };

      data.forEach(item => {
          // Count if attended, submitted, or verified.
          if (['attended', 'submitted', 'verified'].includes(item.status)) {
              const jp = item.seminar_id?.seminar_jp || 0;
              total += jp;

              // Categories map
              const compType = item.competency_type;
              if (compType === 'Struktural') cats.kepemimpinan += jp;
              else if (compType === 'Fungsional') cats.fungsional += jp;
              else if (compType === 'Kultural') cats.teknis += jp;
              else if (compType === 'Seminar') cats.seminar += jp;
              else {
                  // If status is attended but not submitted, we might not have competency_type.
                  // Default to 'Seminar' or 'Lainnya'. Let's default to Seminar/Sejenis as it's a seminar app.
                  cats.seminar += jp;
              }

              // Types map
              const trainType = item.training_type;
              if (trainType === 'Pelatihan Online') types.online += jp;
              else if (trainType === 'Klasikal') types.offline += jp;
              else if (trainType === 'Blended') types.blended += jp;
              else {
                   // Fallback based on Seminar Type if available
                   const semType = item.seminar_id?.seminar_type;
                   if (semType === 'online') types.online += jp;
                   else if (semType === 'onsite') types.offline += jp;
                   else if (semType === 'hybrid') types.blended += jp;
                   else types.online += jp; // Default
              }
          }
      });
      setStats(prev => ({ ...prev, totalJp: total, ...cats, ...types }));
  };

  if (!user) return null;

  // Gauge Chart Data
  const percentage = Math.min((stats.totalJp / stats.targetJp) * 100, 100);
  const gaugeData = [
      { name: 'Completed', value: stats.totalJp },
      { name: 'Remaining', value: Math.max(stats.targetJp - stats.totalJp, 0) },
  ];
  const COLORS = ['#00C49F', '#E0E0E0'];

  return (
    <Box sx={{ display: "flex" }}>
        <Sidebar user={user} />
        <Box component="main" sx={{ flexGrow: 1, bgcolor: "#f5f6fa", p: 3, minHeight: '100vh' }}>
            
            {/* Header Info */}
            <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">Selamat Datang ! {user.nama?.toUpperCase()}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: '800px' }}>
                        {user.unit_kerja || "PEGAWAI NEGERI SIPIL"}
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" display="block">Periode Aktif</Typography>
                    <Typography variant="h6" fontWeight="bold" lineHeight={1}>2025</Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>Target JP</Typography>
                    <Typography variant="h4" fontWeight="bold" lineHeight={1}>20 JP</Typography>
                </Box>
            </Box>

            <Grid container spacing={7}>
                {/* Welcome Card */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 3, height: '100%', minHeight: 160 }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography fontWeight="bold" color="primary">SELAMAT! 🎉</Typography>
                            </Box>
                            <Typography paragraph sx={{ maxWidth: 400, color: 'text.secondary' }}>
                                waw ! <strong>JP {Math.round(percentage)}%</strong> Anda telah memenuhi target JP yang telah ditentukan. Tetap semangat!
                            </Typography>
                            <Button variant="outlined" size="small" onClick={() => navigate('/riwayat')} sx={{ mt: 2 }}>Lihat Riwayat</Button>
                        </Box>
                        <Box sx={{ height: 120, width: 120, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img src={successImg} alt="Success" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                        </Box>
                    </Paper>
                </Grid>

                {/* Support Card */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 3, height: '100%', minHeight: 160 }}>
                         <Box>
                            <Typography fontWeight="bold" sx={{ mb: 1 }}>PUSAT BANTUAN</Typography>
                            <Button variant="contained" color="secondary" size="small" sx={{ borderRadius: 20, fontSize: '0.7rem' }}>ADMIN OPD</Button>
                         </Box>
                         <Box sx={{ height: 100, width: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img src={custSupportImg} alt="Support" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                         </Box>
                    </Paper>
                </Grid>

                {/* Performance Gauge */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: '100%', position: 'relative', minHeight: 400 }}>
                        <Typography fontWeight="bold" gutterBottom>PERFORMA JP</Typography>
                        <Box sx={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                             {/* Recharts Pie Chart for Gauge */}
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={gaugeData}
                                        cx="50%"
                                        cy="50%"
                                        startAngle={180}
                                        endAngle={0}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell key="cell-0" fill="#2196f3" />
                                        <Cell key="cell-1" fill="#eee" />
                                    </Pie>
                                </PieChart>
                             </ResponsiveContainer>
                             <Box sx={{ position: 'absolute', top: '55%', textAlign: 'center' }}>
                                 <Typography variant="h4" fontWeight="bold" color="text.secondary">{Math.round(percentage)}%</Typography>
                             </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Target JP</Typography>
                                <Typography fontWeight="bold">{stats.targetJp} JP</Typography>
                                <Typography variant="caption" color="text.secondary">Periode Aktif 2025</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" color="text.secondary">Perolehan</Typography>
                                <Typography fontWeight="bold" color="primary" variant="h5">{stats.totalJp} JP</Typography>
                                <LinearProgress variant="determinate" value={percentage} sx={{ width: 100, mt: 1, height: 8, borderRadius: 5 }} />
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                 {/* Competency List */}
                 <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: '100%', minHeight: 400 }}>
                        <Typography fontWeight="bold" gutterBottom>JENIS KOMPETENSI</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                            {/* List Items */}
                            {[
                                { label: '1. Diklat Kepemimpinan', val: stats.kepemimpinan },
                                { label: '2. Diklat Fungsional', val: stats.fungsional },
                                { label: '3. Diklat Teknis', val: stats.teknis },
                                { label: '4. Seminar/Sejenis', val: stats.seminar },
                                { label: '5. Lainnya', val: stats.lainnya },
                            ].map((item, i) => (
                                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', pb: 1 }}>
                                    <Typography variant="body2">{item.label}</Typography>
                                    <Typography variant="body2" fontWeight="bold">{item.val} JP</Typography>
                                </Box>
                            ))}
                        </Box>
                        {/* Orange progress bar for Seminar/Sejenis as example logic */}
                        <Box sx={{ mt: 3 }}>
                             <Typography variant="caption" color="text.secondary">Progress Seminar</Typography>
                             <LinearProgress variant="determinate" value={Math.min((stats.seminar/20)*100, 100)} color="warning" sx={{ height: 6, borderRadius: 3, mt: 1 }} />
                        </Box>
                    </Paper>
                </Grid>

                 {/* Stats Cards Breakdown */}
                 <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', minHeight: 400, justifyContent: 'space-between' }}>
                        
                        {/* Online */}
                        <Paper sx={{ p: 2, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexGrow: 1 }}>
                            <Box sx={{ width: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">JP Online</Typography>
                                    <Visibility sx={{ color: '#2196f3', bgcolor: '#e3f2fd', p: 0.5, borderRadius: '50%' }} />
                                </Box>
                                <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>{stats.online} JP</Typography>
                                <LinearProgress variant="determinate" value={Math.min((stats.online/stats.targetJp)*100, 100)} sx={{ mt: 2, height: 6, borderRadius: 3 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">Persentase</Typography>
                                    <Typography variant="caption" color="text.secondary">{stats.totalJp > 0 ? Math.round((stats.online/stats.totalJp)*100) : 0}%</Typography>
                                </Box>
                            </Box>
                        </Paper>

                         {/* Offline */}
                         <Paper sx={{ p: 2, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexGrow: 1 }}>
                            <Box sx={{ width: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">JP Offline</Typography>
                                    <Groups sx={{ color: '#009688', bgcolor: '#e0f2f1', p: 0.5, borderRadius: '50%' }} />
                                </Box>
                                <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>{stats.offline} JP</Typography>
                                <LinearProgress variant="determinate" value={Math.min((stats.offline/stats.targetJp)*100, 100)} color="success" sx={{ mt: 2, height: 6, borderRadius: 3 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">Persentase</Typography>
                                    <Typography variant="caption" color="text.secondary">{stats.totalJp > 0 ? Math.round((stats.offline/stats.totalJp)*100) : 0}%</Typography>
                                </Box>
                            </Box>
                        </Paper>

                         {/* Blended */}
                         <Paper sx={{ p: 2, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexGrow: 1 }}>
                            <Box sx={{ width: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">JP Blended</Typography>
                                    <CastForEducation sx={{ color: '#9c27b0', bgcolor: '#f3e5f5', p: 0.5, borderRadius: '50%' }} />
                                </Box>
                                <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>{stats.blended} JP</Typography>
                                <LinearProgress variant="determinate" value={Math.min((stats.blended/stats.targetJp)*100, 100)} color="secondary" sx={{ mt: 2, height: 6, borderRadius: 3 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">Persentase</Typography>
                                    <Typography variant="caption" color="text.secondary">{stats.totalJp > 0 ? Math.round((stats.blended/stats.totalJp)*100) : 0}%</Typography>
                                </Box>
                            </Box>
                        </Paper>

                    </Box>
                </Grid>

            </Grid>
        </Box>
    </Box>
  );
};

export default Dashboard;
