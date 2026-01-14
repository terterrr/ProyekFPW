import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Tooltip
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Sidebar from "../components/Sidebar";
import { getAccessToken } from "../utils/tokenStorage";
import { useNavigate } from "react-router-dom";
import { Edit, Delete, QrCodeScanner, Group } from "@mui/icons-material";

const MySeminars = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [seminars, setSeminars] = useState([]);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
        const decoded = jwtDecode(token);
        setUser(decoded);
        if (decoded.role !== 'manager' && decoded.role !== 'admin') {
             navigate('/dashboard');
        }
    }
  }, [navigate]);

  const fetchMySeminars = async () => {
      try {
          // In a real app, I'd filter by ?created_by=userId in the backend
          // For now, I'll fetch all and filter in frontend OR create a specific endpoint
          // However, user asked for "Seminar Saya".
          // Let's assume the GetAll endpoint returns all, and we client-filter for MVP speed.
          if(!user) return;
          
          const response = await axios.get("http://localhost:3001/api/v1/seminar");
          const myData = response.data.filter(s => s.created_by === user.id);
          setSeminars(myData);
      } catch (error) {
          console.error("Failed to fetch seminars:", error);
      }
  };

  useEffect(() => {
     if(user) fetchMySeminars();
  }, [user]);

  const handleDelete = async (id) => {
      if(window.confirm("Apakah anda yakin ingin menghapus seminar ini?")) {
          try {
            const token = getAccessToken();
            await axios.delete(`http://localhost:3001/api/v1/seminar/${id}`, {
                 headers: { Authorization: `Bearer ${token}` }
            });
            fetchMySeminars();
          } catch (error) {
              alert("Gagal menghapus seminar");
          }
      }
  };

  if (!user) return null;

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar user={user} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", color: "#1a237e" }}>
            Seminar Saya (Manajemen)
          </Typography>

          <Button 
            variant="contained" 
            sx={{ mb: 3 }}
            onClick={() => navigate('/seminar/create')}
          >
            + Buat Seminar Baru
          </Button>

          <Grid container spacing={3}>
            {seminars.map((seminar) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={seminar._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardMedia
                            component="img"
                            height="140"
                            image={seminar.seminar_img}
                            alt={seminar.seminar_title}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Typography gutterBottom variant="h6" component="div">
                                {seminar.seminar_title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {new Date(seminar.seminar_date_start).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {seminar.seminar_type} | {seminar.seminar_jp} JP
                            </Typography>
                        </CardContent>
                        <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
                            <Tooltip title="Kelola Peserta & Sertifikat">
                                <Button 
                                    size="small" 
                                    variant="outlined" 
                                    startIcon={<Group />}
                                    onClick={() => navigate(`/seminar/manage/${seminar._id}`)}
                                >
                                    Kelola
                                </Button>
                            </Tooltip>
                             <Tooltip title="Delete">
                                 <IconButton color="error" onClick={() => handleDelete(seminar._id)}>
                                     <Delete />
                                 </IconButton>
                             </Tooltip>
                        </Box>
                    </Card>
                </Grid>
            ))}
             {seminars.length === 0 && (
                 <Grid item xs={12}>
                     <Paper sx={{ p: 3, textAlign: 'center' }}>
                         <Typography>Anda belum membuat seminar apapun.</Typography>
                     </Paper>
                 </Grid>
             )}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default MySeminars;
