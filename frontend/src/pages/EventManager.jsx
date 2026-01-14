import {
  Box,
  Typography,
  Container,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Sidebar from "../components/Sidebar";
import { getAccessToken } from "../utils/tokenStorage";
import { useNavigate } from "react-router-dom";

const EventManager = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
  
    useEffect(() => {
      const token = getAccessToken();
      if (token) {
          const decoded = jwtDecode(token);
          setUser(decoded);
          if (decoded.role !== 'manager' && decoded.role !== 'admin') {
              // navigate('/dashboard');
          }
      }
    }, [navigate]);

  if (!user) return null;

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar user={user} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
        <Container maxWidth="lg">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4">Event Manager</Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/seminar/create')}>
            Create New Event
            </Button>
        </Box>

        <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" gutterBottom>
            Managed Events (Legacy View)
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
                Silahkan gunakan menu <strong>Seminar Saya</strong> di sidebar untuk manajemen seminar yang lebih lengkap.
            </Typography>
            <Table size="small">
            <TableHead>
                <TableRow>
                <TableCell>Auto-generated ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                <TableCell>#1023</TableCell>
                <TableCell>React Workshop</TableCell>
                <TableCell>2023-11-20</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">
                    <Button size="small">Edit</Button>
                </TableCell>
                </TableRow>
            </TableBody>
            </Table>
        </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default EventManager;
