import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import BossPage from "../pages/BossPage";
import AdminPage from "../pages/AdminPage";
import EventManager from "../pages/EventManager";
import Seminars from "../pages/Seminars";
import SeminarDetail from "../pages/SeminarDetail";
import SeminarAttendance from "../pages/SeminarAttendance";
import PelatihanSaya from "../pages/PelatihanSaya";
import Riwayat from "../pages/Riwayat";
import Pengumuman from "../pages/Pengumuman";
import CreateSeminar from "../pages/CreateSeminar";
import MySeminars from "../pages/MySeminars";
import ManageSeminar from "../pages/ManageSeminar";
import InputJp from "../pages/InputJp";
import RegisterUser from "../pages/RegisterUser";
import ManageUsers from "../pages/ManageUsers";
import ManageAnnouncements from "../pages/ManageAnnouncements";
import AdminSeminars from "../pages/AdminSeminars";


const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/event-manager" element={<EventManager />} />
        <Route path="/boss" element={<BossPage />} />
        <Route path="/seminar" element={<Seminars />} />
        <Route path="/seminar/:id" element={<SeminarDetail />} />
        <Route path="/seminar/:id/attend" element={<SeminarAttendance />} />
        <Route path="/pelatihan" element={<PelatihanSaya />} />
        <Route path="/riwayat" element={<Riwayat />} />
        <Route path="/pengumuman" element={<Pengumuman />} />
        
        {/* Manager Routes */}
        <Route path="/seminar/create" element={<CreateSeminar />} />
        <Route path="/seminar/manage" element={<MySeminars />} />
        <Route path="/seminar/manage/:id" element={<ManageSeminar />} />
        <Route path="/input-jp" element={<InputJp />} />

        {/* Admin Routes */}
        <Route path="/admin/register" element={<RegisterUser />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/announcements" element={<ManageAnnouncements />} />
        <Route path="/admin/seminar-list" element={<AdminSeminars />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
