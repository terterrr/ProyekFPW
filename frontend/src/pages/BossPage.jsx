import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  getBoss,
  createBoss,
  updateBoss,
  deleteBoss,
} from "../services/bossService";

const BossPage = () => {
  const [boss, setBoss] = useState([]);
  const [form, setForm] = useState({ name: "", jabatan: "" });
  const [editId, setEditId] = useState(null);

  const loadData = async () => {
    const res = await getBoss();
    setBoss(res.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (editId) {
      await updateBoss(editId, form);
    } else {
      await createBoss(form);
    }
    setForm({ name: "", jabatan: "" });
    setEditId(null);
    loadData();
  };

  const handleEdit = (item) => {
    setForm({ name: item.name, jabatan: item.jabatan });
    setEditId(item.id);
  };

  const handleDelete = async (id) => {
    await deleteBoss(id);
    loadData();
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Master Boss
      </Typography>

      {/* FORM */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Nama Boss"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <TextField
          label="Jabatan"
          name="jabatan"
          value={form.jabatan}
          onChange={handleChange}
        />
        <Button variant="contained" onClick={handleSubmit}>
          {editId ? "Update" : "Tambah"}
        </Button>
      </Box>

      {/* TABLE */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nama</TableCell>
              <TableCell>Jabatan</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {boss.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.jabatan}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleEdit(item)}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(item.id)}
                  >
                    Hapus
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default BossPage;
