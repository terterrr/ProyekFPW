import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Container,
  TextField,
  IconButton
} from "@mui/material";
import { useEffect, useState } from "react";
// import axios from "axios"; // Removing axis import
import Sidebar from "../components/Sidebar";
import { getAccessToken } from "../utils/tokenStorage";
import { jwtDecode } from "jwt-decode";
import { CalendarMonth, AccessTime, Person, Edit, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSeminars, deleteSeminar } from "../redux/slices/seminarSlice";

const AdminSeminars = () => {
  const dispatch = useDispatch();
  const { seminars } = useSelector((state) => state.seminars);
  const [filteredSeminars, setFilteredSeminars] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setUser(jwtDecode(token));
      dispatch(fetchSeminars());
    } else {
        navigate("/");
    }
  }, [navigate, dispatch]);

  useEffect(() => {
    setFilteredSeminars(seminars);
  }, [seminars]);

  const handleSearch = (e) => {
      const term = e.target.value;
      setSearchTerm(term);
      if (term) {
          const filtered = seminars.filter(s => s.seminar_title.toLowerCase().includes(term.toLowerCase()));
          setFilteredSeminars(filtered);
      } else {
          setFilteredSeminars(seminars);
      }
  };

  const handleEdit = (seminar) => {
      navigate('/seminar/create', { state: { mode: 'edit', seminar: seminar } });
  };

  const handleDelete = async (id) => {
      if(window.confirm("Apakah anda yakin ingin menghapus seminar ini?")) {
          dispatch(deleteSeminar(id));
      }
  }

  if (!user) return null;

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar user={user} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", color: "#1a237e" }}>
            Semua Seminar (Admin)
          </Typography>

          <Box sx={{ mb: 4, p: 2, bgcolor: "white", borderRadius: 2 }}>
              <TextField
                label="Cari Seminar"
                variant="outlined"
                size="small"
                fullWidth
                value={searchTerm}
                onChange={handleSearch}
              />
          </Box>

          <Grid container spacing={3}>
            {filteredSeminars.map((seminar) => (
              <Grid item xs={12} sm={6} md={3} key={seminar._id}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column", position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={seminar.seminar_img}
                    alt={seminar.seminar_title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" noWrap>
                      {seminar.seminar_title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {new Date(seminar.seminar_date_start).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Host: {seminar.seminar_host}
                    </Typography>
                  </CardContent>
                  
                  {/* Admin Actions */}
                  <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button 
                        startIcon={<Edit />} 
                        variant="contained" 
                        size="small"
                        onClick={() => handleEdit(seminar)}
                      >
                          Edit
                      </Button>
                      <Button 
                        startIcon={<Delete />} 
                        variant="outlined" 
                        color="error"
                        size="small"
                        onClick={() => handleDelete(seminar._id)}
                      >
                          Delete
                      </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminSeminars;
