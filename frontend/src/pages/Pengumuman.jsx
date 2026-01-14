import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Sidebar from "../components/Sidebar";
import { getAccessToken } from "../utils/tokenStorage";
import { PlayArrow } from "@mui/icons-material";

const Pengumuman = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setUser(jwtDecode(token));
    }
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/v1/announcements");
        setAnnouncements(response.data);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    fetchAnnouncements();
  }, []);

  if (!user) return null;

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar user={user} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", color: "#1a237e" }}>
            Pengumuman
          </Typography>

          <Grid container spacing={3}>
            {announcements.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item._id}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 2, boxShadow: 2 }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.thumbnail || "https://placehold.co/600x400?text=No+Thumbnail"}
                    alt={item.title}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 2, display: "flex", flexDirection: "column" }}>
                    <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: "bold", lineHeight: 1.3, mb: 1 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>
                    
                    <Button 
                        variant="contained" 
                        color="error" // YouTube red
                        startIcon={<PlayArrow />}
                        href={item.video_url}
                        target="_blank"
                        sx={{ mt: "auto", textTransform: "none" }}
                        fullWidth
                    >
                        Lihat video
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Pengumuman;
