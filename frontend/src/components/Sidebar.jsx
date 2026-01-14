import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Class as ClassIcon,
  Campaign as AnnouncementIcon,
  Input as InputIcon,
  EventAvailable as EventIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo_panjang.webp";
import axios from "axios";
import { removeAccessToken } from "../utils/tokenStorage";

const drawerWidth = 280;

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
        await axios.get("http://localhost:3001/api/v1/auth/logout");
    } catch (error) {
        console.error("Logout failed", error);
    } finally {
        removeAccessToken();
        navigate("/");
    }
  };

  // Define menus based on Roles
  let menuItems = [];

  // Check role
  // Check role
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  if (isAdmin) {
      // ADMIN MENU
      menuItems = [
          {
              text: "Semua Seminar",
              icon: <EventIcon />,
              path: "/admin/seminar-list",
              category: "MENU ADMIN",
          },
          {
              text: "Buat Seminar",
              icon: <InputIcon />,
              path: "/seminar/create",
              category: "MENU ADMIN",
          },
          {
              text: "Registrasi Akun",
              icon: <InputIcon />, // Or People icon
              path: "/admin/register",
              category: "USER MANAGEMENT",
          },
          {
              text: "Manage Akun",
              icon: <DashboardIcon />, // Or People icon
              path: "/admin/users",
              category: "USER MANAGEMENT",
          },
          {
              text: "Pengumuman",
              icon: <AnnouncementIcon />,
              path: "/admin/announcements",
              category: "PENGUMUMAN",
          },
      ];
  } else if (isManager) {
      // MANAGER MENU
      menuItems = [
        {
            text: "Buat Seminar",
            icon: <InputIcon />,
            path: "/seminar/create",
            category: "MANAJEMEN",
        },
        {
            text: "Seminar Saya",
            icon: <EventIcon />,
            path: "/seminar/manage", // List of my seminars
            category: "MANAJEMEN",
        },
      ];
  } else {
      // PESERTA MENU (Default)
      menuItems = [
        {
          text: "Dashboard",
          icon: <DashboardIcon />,
          path: "/dashboard",
          category: "DASHBOARD",
        },
        {
          text: "Semua Seminar",
          icon: <EventIcon />,
          path: "/seminar",
          category: "DASHBOARD",
        },
        {
          text: "Pelatihan saya",
          icon: <ClassIcon />,
          path: "/pelatihan",
          category: "PELATIHAN",
        },
        {
          text: "Riwayat",
          icon: <HistoryIcon />,
          path: "/riwayat",
          category: "PELATIHAN",
        },
        {
          text: "Pengumuman",
          icon: <AnnouncementIcon />,
          path: "/pengumuman",
          category: "PENGUMUMAN",
        },
      ];
  }

  // Helper to group items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid #e0e0e0",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Logo Section */}
      <Box sx={{ p: 2, display: "flex", justifyContent: "center", mb: 2 }}>
        <img src={logo} alt="BPSDM Logo" style={{ width: "80%", height: "auto" }} />
      </Box>

      {/* Profile Section - Visible for ALL roles now */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 2,
          mb: 1,
        }}
      >
        <Avatar
          sx={{ width: 80, height: 80, mb: 2, border: "3px solid #4caf50" }} 
          src={user?.profile_picture} 
          alt={user?.nama || "User"}
        />
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "bold", textAlign: "center", lineHeight: 1.2 }}
        >
          {user?.nama?.toUpperCase() || "USER NAME"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isAdmin ? "Akses Admin" : isManager ? "Akses Manager" : "Akses Peserta"}
        </Typography>
      </Box>

      {/* Menu Items */}
      <Box sx={{ overflow: "auto", flexGrow: 1 }}>
        {Object.keys(groupedItems).map((category) => (
          <Box key={category} sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                px: 3,
                pb: 1,
                display: "block",
                fontWeight: "bold",
                color: "text.secondary",
                letterSpacing: "1px",
              }}
            >
              {category}
            </Typography>
            <List disablePadding>
              {groupedItems[category].map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    sx={{
                      px: 3,
                      "&.Mui-selected": {
                        color: "primary.main",
                        bgcolor: "transparent",
                        borderRight: "3px solid",
                        borderColor: "primary.main",
                        "& .MuiListItemIcon-root": {
                          color: "primary.main",
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: location.pathname === item.path ? "primary.main" : "text.secondary",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        variant: "body2",
                        fontWeight: location.pathname === item.path ? "bold" : "medium",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>

      {/* Logout Section - ALWAYS VISIBLE */}
      <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
        <List disablePadding>
            <ListItem disablePadding>
                <ListItemButton 
                    onClick={handleLogout}
                    sx={{ 
                        px: 3, 
                        borderRadius: 2,
                        "&:hover": { bgcolor: "#ffebee" } // Light red hover
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40, color: "error.main" }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText 
                        primary="Logout" 
                        primaryTypographyProps={{ variant: "body2", fontWeight: "bold", color: "error.main" }}
                    />
                </ListItemButton>
            </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
