import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getAccessToken } from "../../utils/tokenStorage";

export const fetchAnnouncements = createAsyncThunk("announcements/fetchAll", async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get("http://localhost:3001/api/v1/announcements");
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch announcements");
    }
});

export const createAnnouncement = createAsyncThunk("announcements/create", async (formData, { rejectWithValue }) => {
    try {
        const token = getAccessToken();
        const response = await axios.post("http://localhost:3001/api/v1/announcements", formData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to create announcement");
    }
});

export const updateAnnouncement = createAsyncThunk("announcements/update", async ({ id, formData }, { rejectWithValue }) => {
    try {
        const token = getAccessToken();
        const response = await axios.put(`http://localhost:3001/api/v1/announcements/${id}`, formData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to update announcement");
    }
});

export const deleteAnnouncement = createAsyncThunk("announcements/delete", async (id, { rejectWithValue }) => {
    try {
        const token = getAccessToken();
        await axios.delete(`http://localhost:3001/api/v1/announcements/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to delete announcement");
    }
});

const announcementSlice = createSlice({
    name: "announcements",
    initialState: {
        announcements: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAnnouncements.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAnnouncements.fulfilled, (state, action) => {
                state.loading = false;
                state.announcements = action.payload;
            })
            .addCase(fetchAnnouncements.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createAnnouncement.fulfilled, (state, action) => {
                state.announcements.unshift(action.payload);
            })
            .addCase(updateAnnouncement.fulfilled, (state, action) => {
                const index = state.announcements.findIndex(a => a._id === action.payload._id);
                if (index !== -1) state.announcements[index] = action.payload;
            })
            .addCase(deleteAnnouncement.fulfilled, (state, action) => {
                state.announcements = state.announcements.filter(a => a._id !== action.payload);
            });
    },
});

export default announcementSlice.reducer;
