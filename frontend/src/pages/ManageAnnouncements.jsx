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
  TextField,
  Grid
} from "@mui/material";
import { Delete, Edit, Add, CloudUpload } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import { getAccessToken } from "../utils/tokenStorage";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "../redux/slices/announcementSlice";

const ManageAnnouncements = () => {
    const dispatch = useDispatch();
    const { announcements } = useSelector((state) => state.announcements);
    const [user, setUser] = useState(null);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const navigate = useNavigate();
    
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
    const selectedFile = watch("thumbnail");

    useEffect(() => {
        const token = getAccessToken();
        if (token) {
            setUser(jwtDecode(token));
            dispatch(fetchAnnouncements());
        } else {
            navigate("/");
        }
    }, [navigate, dispatch]);

    const handleOpen = () => {
        setOpen(true);
        setEditMode(false);
        reset();
    };

    const handleEdit = (item) => {
        setOpen(true);
        setEditMode(true);
        setCurrentId(item._id);
        setValue("title", item.title);
        setValue("description", item.description);
        setValue("video_url", item.video_url);
    };

    const handleClose = () => {
        setOpen(false);
        reset();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this announcement?")) {
            dispatch(deleteAnnouncement(id));
        }
    };

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("video_url", data.video_url);
        if (data.thumbnail && data.thumbnail[0]) {
            formData.append("thumbnail", data.thumbnail[0]);
        }

        if (editMode) {
            await dispatch(updateAnnouncement({ id: currentId, formData }));
        } else {
            await dispatch(createAnnouncement(formData));
        }
        handleClose();
    };

    if (!user) return null;

    return (
        <Box sx={{ display: "flex" }}>
            <Sidebar user={user} />
            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                        <Typography variant="h4" fontWeight="bold">Manajemen Pengumuman</Typography>
                        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
                            Buat Pengumuman
                        </Button>
                    </Box>

                    <Paper sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Thumbnail</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Judul</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Video URL</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {announcements.map((row) => (
                                        <TableRow key={row._id}>
                                            <TableCell>
                                                {row.thumbnail && (
                                                    <img src={row.thumbnail} alt="thumb" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                                                )}
                                            </TableCell>
                                            <TableCell>{row.title}</TableCell>
                                            <TableCell>{row.description?.substring(0, 50)}...</TableCell>
                                            <TableCell>
                                                <a href={row.video_url} target="_blank" rel="noopener noreferrer">Link</a>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton color="primary" onClick={() => handleEdit(row)}>
                                                    <Edit />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => handleDelete(row._id)}>
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {announcements.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">Tidak ada pengumuman</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* Dialog Form */}
                    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                        <DialogTitle>{editMode ? "Edit Pengumuman" : "Buat Pengumuman Baru"}</DialogTitle>
                        <DialogContent>
                            <form id="ann-form" onSubmit={handleSubmit(onSubmit)}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                                    <TextField 
                                        label="Judul" 
                                        fullWidth 
                                        {...register("title", { required: "Judul wajib diisi" })} 
                                        error={!!errors.title}
                                        helperText={errors.title?.message}
                                    />
                                    <TextField 
                                        label="Deskripsi" 
                                        fullWidth 
                                        multiline
                                        rows={3}
                                        {...register("description", { required: "Deskripsi wajib diisi" })}
                                        error={!!errors.description}
                                        helperText={errors.description?.message}
                                    />
                                    <TextField 
                                        label="Video URL (Youtube)" 
                                        fullWidth 
                                        {...register("video_url", { required: "URL wajib diisi" })}
                                        error={!!errors.video_url}
                                        helperText={errors.video_url?.message}
                                    />
                                    
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        startIcon={<CloudUpload />}
                                    >
                                        Upload Thumbnail
                                        <input 
                                            type="file" 
                                            hidden 
                                            accept="image/*"
                                            {...register("thumbnail")}
                                        />
                                    </Button>
                                    {selectedFile && selectedFile[0] && (
                                        <Typography variant="caption">{selectedFile[0].name}</Typography>
                                    )}
                                </Box>
                            </form>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button type="submit" form="ann-form" variant="contained">Simpan</Button>
                        </DialogActions>
                    </Dialog>
                </Container>
            </Box>
        </Box>
    );
};

export default ManageAnnouncements;
