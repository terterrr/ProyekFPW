import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
} from "@mui/material";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getAccessToken } from "../utils/tokenStorage";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../redux/slices/userSlice";
import { fetchSeminars } from "../redux/slices/seminarSlice";
import { fetchAnnouncements } from "../redux/slices/announcementSlice";

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { users } = useSelector((state) => state.users);
  const { seminars } = useSelector((state) => state.seminars);
  const { announcements } = useSelector((state) => state.announcements);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setUser(jwtDecode(token));
      dispatch(fetchUsers());
      dispatch(fetchSeminars());
      dispatch(fetchAnnouncements());
    } else {
        navigate("/");
    }
  }, [navigate, dispatch]);

  if (!user) return null;

  return (
    <Box sx={{ display: "flex" }}>
        <Sidebar user={user} />
        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Admin Dashboard
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8} lg={9}>
                <Paper
                    sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    height: 240,
                    }}
                >
                    <Typography variant="h6">Overview</Typography>
                    <Typography>Welcome to the Admin Control Panel, {user.nama}.</Typography>
                    <Typography sx={{ mt: 2 }}>
                        Here you can manage users, seminars, and announcements.
                    </Typography>
                </Paper>
                </Grid>
                
                {/* Stats Cards */}
                <Grid item xs={12} md={4} lg={3}>
                    <Grid container spacing={2} direction="column">
                        <Grid item>
                             <Paper sx={{ p: 2, display: "flex", flexDirection: "column", bgcolor: '#e3f2fd' }}>
                                <Typography variant="h6">Active Users</Typography>
                                <Typography variant="h3" sx={{ mt: 1, fontWeight: 'bold' }}>
                                {users.length}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item>
                             <Paper sx={{ p: 2, display: "flex", flexDirection: "column", bgcolor: '#e8f5e9' }}>
                                <Typography variant="h6">Total Seminars</Typography>
                                <Typography variant="h3" sx={{ mt: 1, fontWeight: 'bold' }}>
                                {seminars.length}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item>
                             <Paper sx={{ p: 2, display: "flex", flexDirection: "column", bgcolor: '#fff3e0' }}>
                                <Typography variant="h6">Announcements</Typography>
                                <Typography variant="h3" sx={{ mt: 1, fontWeight: 'bold' }}>
                                {announcements.length}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            </Container>
        </Box>
    </Box>
  );
};

export default AdminPage;
