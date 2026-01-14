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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { getAccessToken } from "../utils/tokenStorage";
import { jwtDecode } from "jwt-decode";
import { CalendarMonth, AccessTime, Person } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Seminars = () => {
  const [seminars, setSeminars] = useState([]);
  const [allSeminars, setAllSeminars] = useState([]); // Store all data for filtering
  
  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleSearch = () => {
    let filtered = [...allSeminars];

    // Filter by Title
    if (searchTerm) {
      filtered = filtered.filter((s) =>
        s.seminar_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by Start Date
    if (startDate) {
      const filterStart = new Date(startDate);
      filterStart.setHours(0, 0, 0, 0);
      filtered = filtered.filter((s) => {
          const sDate = new Date(s.seminar_date_start);
          sDate.setHours(0, 0, 0, 0);
          return sDate >= filterStart;
      });
    }

    // Filter by End Date
    if (endDate) {
      const filterEnd = new Date(endDate);
      filterEnd.setHours(23, 59, 59, 999);
      filtered = filtered.filter((s) => {
          const sDate = new Date(s.seminar_date_end);
          return sDate <= filterEnd; // Compare full timestamp for end
      });
    }

    // Sorting
    filtered.sort((a, b) => {
        const dateA = new Date(a.seminar_date_start);
        const dateB = new Date(b.seminar_date_start);
        if (sortOrder === "newest") {
            return dateB - dateA; // Descending
        } else {
            return dateA - dateB; // Ascending
        }
    });

    setSeminars(filtered);
  };

  // Re-run search when sort order changes
  useEffect(() => {
      if(allSeminars.length > 0) {
          handleSearch();
      }
  }, [sortOrder, allSeminars]); 

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setUser(jwtDecode(token));
    }
  }, []);

  useEffect(() => {
    const fetchSeminars = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/v1/seminar");
        // Sort by default on fetch
        const data = response.data.sort((a,b) => new Date(b.seminar_date_start) - new Date(a.seminar_date_start));
        setSeminars(data);
        setAllSeminars(data);
      } catch (error) {
        console.error("Error fetching seminars:", error);
      }
    };

    fetchSeminars();
  }, []);

  if (!user) return null;

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar user={user} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#ffffffff", minHeight: "100vh" }}>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", color: "#1a237e" }}>
            Semua Seminar
          </Typography>

          {/* Search Filters */}
          <Box sx={{ mb: 4, p: 3, bgcolor: "white", borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-end" }}>
              <TextField
                label="Cari Judul"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flexGrow: 1, minWidth: "200px" }}
              />
              <TextField
                label="Tanggal Awal"
                type="date"
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                sx={{ minWidth: "150px" }}
              />
              <TextField
                label="Tanggal Akhir"
                type="date"
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                sx={{ minWidth: "150px" }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Urutkan</InputLabel>
                  <Select
                      value={sortOrder}
                      label="Urutkan"
                      onChange={(e) => setSortOrder(e.target.value)}
                  >
                      <MenuItem value="newest">Paling Baru</MenuItem>
                      <MenuItem value="oldest">Paling Lama</MenuItem>
                  </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{ height: "40px", px: 3, textTransform: "none", fontWeight: "bold" }}
              >
                Cari data
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {seminars.map((seminar) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={seminar._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={seminar.seminar_img}
                      alt={seminar.seminar_title}
                    />
                    <Chip
                      label={seminar.seminar_type?.toUpperCase()}
                      color={
                        seminar.seminar_type === "online"
                          ? "primary"
                          : seminar.seminar_type === "onsite"
                          ? "secondary"
                          : "success"
                      }
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        fontWeight: "bold",
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography
                      gutterBottom
                      variant="subtitle1"
                      component="div"
                      sx={{
                        fontWeight: "bold",
                        lineHeight: 1.2,
                        mb: 1.5,
                        height: "2.4em", // Fixed height for alignment
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        fontSize: "0.95rem",
                      }}
                    >
                      {seminar.seminar_title}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 0.5, color: "text.secondary" }}>
                      <CalendarMonth sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="caption">
                        {new Date(seminar.seminar_date_start).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 0.5, color: "text.secondary" }}>
                      <Person sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="caption" noWrap>
                         {seminar.seminar_host}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 2, color: "text.secondary" }}>
                      <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="caption" noWrap>
                         {seminar.seminar_jp} JP
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      size="small"
                      onClick={() => navigate(`/seminar/${seminar._id}`)}
                      sx={{
                        mt: "auto",
                        borderRadius: 1.5,
                        textTransform: "none",
                        boxShadow: "none",
                        fontSize: "0.8rem",
                      }}
                    >
                      Detail Webinar
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

export default Seminars;
