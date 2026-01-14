import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Box,
  Typography,
  Alert,
  Container,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { setAccessToken } from "../utils/tokenStorage";
import { getApiBaseUrl } from "../utils/apiConfig";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      // NOTE: Ensure backend expects 'email' not 'username'
      const response = await axios.post(
        `${getApiBaseUrl()}/auth/login`,
        form,
        { withCredentials: true }
      );

      // simpan access token
      setAccessToken(response.data.access_token);

      // redirect based on role provided by backend
      const { role } = response.data;
      const from = location.state?.from?.pathname;
       
      if (from) {
           navigate(from, { replace: true });
      } else if (role === "admin") {
        navigate("/admin");
      } else if (role === "manager") {
        navigate("/seminar/manage");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Login Gagal: " + (err.response?.data?.msg || err.message));
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
          <LockOutlinedIcon />
        </Avatar>

        <Typography component="h1" variant="h5">
          Login
        </Typography>

        <Box sx={{ mt: 3, width: "100%" }}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            margin="normal"
            onChange={handleChange}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            name="password"
            margin="normal"
            onChange={handleChange}
          />

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleLogin}
          >
            LOGIN
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
