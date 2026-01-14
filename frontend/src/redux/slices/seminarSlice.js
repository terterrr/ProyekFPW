import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getAccessToken } from "../../utils/tokenStorage";

export const fetchSeminars = createAsyncThunk("seminars/fetchAll", async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get("http://localhost:3001/api/v1/seminar");
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch seminars");
    }
});

export const deleteSeminar = createAsyncThunk("seminars/delete", async (id, { rejectWithValue }) => {
    try {
        const token = getAccessToken();
        await axios.delete(`http://localhost:3001/api/v1/seminar/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to delete seminar");
    }
});

const seminarSlice = createSlice({
    name: "seminars",
    initialState: {
        seminars: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSeminars.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchSeminars.fulfilled, (state, action) => {
                state.loading = false;
                state.seminars = action.payload;
            })
            .addCase(fetchSeminars.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteSeminar.fulfilled, (state, action) => {
                state.seminars = state.seminars.filter(s => s._id !== action.payload);
            });
    },
});

export default seminarSlice.reducer;
