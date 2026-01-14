import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress
} from "@mui/material";
import { Delete, Edit, Add } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import { getAccessToken } from "../utils/tokenStorage";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser, updateUserRole } from "../redux/slices/userSlice";

const ManageUsers = () => {
    const dispatch = useDispatch();
    const { users, loading } = useSelector((state) => state.users);
    const [user, setUser] = useState(null); // Current logged in user
    const [editOpen, setEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = getAccessToken();
        if (token) {
            setUser(jwtDecode(token));
            dispatch(fetchUsers());
        } else {
            navigate("/");
        }
    }, [navigate, dispatch]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            dispatch(deleteUser(id));
        }
    };

    const handleEditOpen = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setEditOpen(true);
    };

    const handleEditClose = () => {
        setEditOpen(false);
        setSelectedUser(null);
    };

    const handleRoleUpdate = async () => {
        if (selectedUser) {
            await dispatch(updateUserRole({ id: selectedUser._id, role: newRole }));
            setEditOpen(false);
        }
    };

    if (!user) return null;

    return (
        <Box sx={{ display: "flex" }}>
            <Sidebar user={user} />
            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                        <Typography variant="h4" fontWeight="bold">Manage Akun</Typography>
                        <Button 
                            variant="contained" 
                            startIcon={<Add />} 
                            onClick={() => navigate("/admin/register")}
                        >
                            Tambah Akun
                        </Button>
                    </Box>

                    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Nama</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>NIK</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((row) => (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={row._id}>
                                            <TableCell>{row.nama}</TableCell>
                                            <TableCell>{row.nik}</TableCell>
                                            <TableCell>{row.email}</TableCell>
                                            <TableCell>
                                                <Box sx={{ 
                                                    display: 'inline-block', 
                                                    px: 1, 
                                                    py: 0.5, 
                                                    borderRadius: 1,
                                                    fontSize: '0.875rem',
                                                    color: 'white',
                                                    bgcolor: row.role === 'admin' ? 'error.main' : 
                                                             row.role === 'manager' ? 'warning.main' : 'primary.main'
                                                }}>
                                                    {row.role}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton color="primary" onClick={() => handleEditOpen(row)}>
                                                    <Edit />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => handleDelete(row._id)}>
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* Edit Role Dialog */}
                    <Dialog open={editOpen} onClose={handleEditClose}>
                        <DialogTitle>Edit User Role</DialogTitle>
                        <DialogContent sx={{ minWidth: 300 }}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Role</InputLabel>
                                <Select
                                    value={newRole}
                                    label="Role"
                                    onChange={(e) => setNewRole(e.target.value)}
                                >
                                    <MenuItem value="peserta">Peserta</MenuItem>
                                    <MenuItem value="manager">Manager</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                </Select>
                            </FormControl>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleEditClose}>Cancel</Button>
                            <Button onClick={handleRoleUpdate} variant="contained">Update</Button>
                        </DialogActions>
                    </Dialog>
                </Container>
            </Box>
        </Box>
    );
};

export default ManageUsers;
