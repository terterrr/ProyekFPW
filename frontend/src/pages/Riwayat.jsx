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
  Chip,
  Grid,
  TextField,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  Avatar,
  TablePagination
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Sidebar from "../components/Sidebar";
import { getAccessToken } from "../utils/tokenStorage";
import { Edit, Delete } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { fetchHistories, deleteHistory } from "../redux/slices/historySlice";
import { useNavigate } from "react-router-dom";

const Riwayat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: histories, status: historyStatus } = useSelector((state) => state.history);
  
  const [filteredHistories, setFilteredHistories] = useState([]);
  const [user, setUser] = useState(null);
  
  // Filters
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");
  const [years, setYears] = useState([new Date().getFullYear()]);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchUserData = async () => {
        const token = getAccessToken();
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Fetch fresh user data
                const response = await axios.get(`http://localhost:3001/api/v1/users/${decoded.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                if (error.response && error.response.status === 404) {
                    alert("Sesi anda tidak valid (User tidak ditemukan). Silahkan login kembali.");
                    localStorage.removeItem("access_token");
                    window.location.href = "/";
                    return;
                }
                setUser(jwtDecode(token));
            }
        }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if(user) {
        dispatch(fetchHistories(user.id));
    }
  }, [user, dispatch]);

  useEffect(() => {
      // Filter logic and Year extraction
      // "history hanya muncul jika user sudah upload sertifikat" OR verified/submitted
      const validHistories = histories.filter(h => h.proof_image || h.status === 'submitted' || h.status === 'verified');
      
      const availYears = [...new Set(validHistories.map(h => new Date(h.certificate_date || h.updatedAt).getFullYear()))];
      if (availYears.length === 0) availYears.push(new Date().getFullYear());
      setYears(availYears.sort((a,b) => b-a));

      let result = validHistories;

      // Filter by Year
      if (yearFilter) {
          result = result.filter(h => {
               const date = new Date(h.certificate_date || h.submission_date || h.updatedAt);
               return date.getFullYear() === yearFilter;
          });
      }

      // Filter by Search (Title, Host, or Cert Number)
      if (searchTerm) {
          const lower = searchTerm.toLowerCase();
          result = result.filter(h => 
              h.seminar_id?.seminar_title?.toLowerCase().includes(lower) || 
              h.seminar_id?.seminar_host?.toLowerCase().includes(lower) ||
              h.certificate_number?.toLowerCase().includes(lower)
          );
      }
      setFilteredHistories(result);

  }, [histories, yearFilter, searchTerm]);


  // Summary Calculations
  const totalJP = filteredHistories.reduce((sum, h) => sum + (h.seminar_id?.seminar_jp || 0), 0);
  const targetJP = 20;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleDelete = (id) => {
      if (window.confirm("Apakah anda yakin ingin menghapus riwayat ini?")) {
          dispatch(deleteHistory(id));
      }
  };

  const handleEdit = (historyItem) => {
      // Navigate to InputJp with history data for editing
      navigate("/input-jp", { state: { historyItem, mode: 'edit' } });
  };

  if (!user) return null;

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar user={user} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
        <Container maxWidth="xl">
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#1a237e" }}>
            Detail Data Riwayat JP
          </Typography>

          {/* Top Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {/* User Info Card */}
            <Grid container item xs={12} md={3}>
                <Card sx={{ bgcolor: "#283593", color: "white", height: "100%", width: '100%' }}>
                    <CardContent>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>{user.nik || "NIK USER"}</Typography>
                        <Typography variant="h6" sx={{ fontWeight: "bold", mt: 1 }}>
                            {user.nama?.toUpperCase()}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* Instansi Card */}
            <Grid container item xs={12} md={3}>
                <Card sx={{ bgcolor: "#303f9f", color: "white", height: "100%", width: '100%' }}>
                    <CardContent>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Instansi</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mt: 1 }}>
                            {user.kota?.toUpperCase() || "INSTANSI USER"}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.8, fontSize: '0.7rem' }}>
                           DINAS TEST - UNIT KERJA SAMPLE
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

             {/* Target JP Card */}
             <Grid container item xs={12} md={3}>
                <Card sx={{ bgcolor: "#0069ff", color: "white", height: "100%", width: '100%' }}>
                    <CardContent>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Target JP</Typography>
                        <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1 }}>
                            {targetJP}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Target JP Periode {yearFilter}</Typography>
                    </CardContent>
                </Card>
            </Grid>

             {/* Total JP Card */}
             <Grid container item xs={12} md={3}>
                <Card sx={{ bgcolor: "#00c853", color: "white", height: "100%", width: '100%' }}>
                    <CardContent>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Total JP</Typography>
                        <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1 }}>
                            {totalJP}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Total JP Periode {yearFilter}</Typography>
                    </CardContent>
                </Card>
            </Grid>
          </Grid>

          {/* Filters */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                 <Typography fontWeight="bold">Periode :</Typography>
                 <TextField
                    select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    size="small"
                    sx={{ width: 100, bgcolor: "white" }}
                 >
                    {years.map((y) => (
                        <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                 </TextField>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>Search:</Typography>
                <TextField 
                    size="small" 
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ bgcolor: 'white' }}
                />
            </Box>
          </Box>


          {/* Table */}
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
              <Table stickyHeader aria-label="sticky table" size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>NO</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>TANGGAL SERTIFIKAT</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>NAMA JP</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>JUMLAH JP</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>PENYELENGGARA</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>TIPE</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>NO SERTIFIKAT</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>GAMBAR</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>TANGGAL INPUT</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>AKSI</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHistories
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                    return (
                        <TableRow hover role="checkbox" tabIndex={-1} key={row._id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#f9f9f9' } }}>
                            <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                            <TableCell>
                                {row.certificate_date ? new Date(row.certificate_date).toLocaleDateString('id-ID') : '-'}
                            </TableCell>
                            <TableCell sx={{ maxWidth: 300 }}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    {row.seminar_id?.seminar_type === 'online' ? 'Pelatihan Online' : 'Seminar'}
                                </Typography>
                                {row.seminar_id?.seminar_title}
                            </TableCell>
                            <TableCell>{row.seminar_id?.seminar_jp}</TableCell>
                            <TableCell>{row.seminar_id?.seminar_host}</TableCell>
                            <TableCell>
                                <Chip 
                                    label={row.seminar_id?.seminar_type === 'online' ? 'Pelatihan Online' : 'Seminar'} 
                                    color="primary" 
                                    size="small" 
                                    sx={{ borderRadius: 1 }}
                                />
                            </TableCell>
                            <TableCell>{row.certificate_number || '-'}</TableCell>
                            <TableCell>
                                {row.proof_image ? (
                                    <Avatar 
                                        src={row.proof_image} 
                                        variant="rounded" 
                                        sx={{ width: 60, height: 40, cursor: 'pointer', border: '1px solid #ddd' }}
                                        onClick={() => window.open(row.proof_image, '_blank')}
                                    />
                                ) : '-'}
                            </TableCell>
                            <TableCell>
                                {new Date(row.submission_date || row.updatedAt).toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <IconButton 
                                        size="small" 
                                        color="primary" 
                                        sx={{ bgcolor: '#03a9f4', color: 'white', '&:hover': { bgcolor: '#0288d1' } }}
                                        onClick={() => handleEdit(row)}
                                    >
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton 
                                        size="small" 
                                        color="error" 
                                        sx={{ bgcolor: '#ff5252', color: 'white', '&:hover': { bgcolor: '#d32f2f' } }}
                                        onClick={() => handleDelete(row._id)}
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Box>
                            </TableCell>
                        </TableRow>
                    );
                  })}
                  {filteredHistories.length === 0 && (
                      <TableRow>
                          <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                              Tidak ada data ditemukan
                          </TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredHistories.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default Riwayat;
