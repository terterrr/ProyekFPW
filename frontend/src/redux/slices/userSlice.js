import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getAccessToken } from "../../utils/tokenStorage";

export const fetchUsers = createAsyncThunk("users/fetchUsers", async (_, { rejectWithValue }) => {
    try {
        const token = getAccessToken();
        const response = await axios.get("http://localhost:3001/api/v1/users", {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
    }
});

export const createUser = createAsyncThunk("users/createUser", async (userData, { rejectWithValue }) => {
    try {
        const token = getAccessToken();
        const response = await axios.post("http://localhost:3001/api/v1/users", userData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to create user");
    }
});

export const updateUserRole = createAsyncThunk("users/updateUserRole", async ({ id, role }, { rejectWithValue }) => {
    try {
        const token = getAccessToken();
        const response = await axios.put(`http://localhost:3001/api/v1/users/${id}`, { role }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to update user");
    }
});

export const deleteUser = createAsyncThunk("users/deleteUser", async (id, { rejectWithValue }) => {
    try {
        const token = getAccessToken();
        await axios.delete(`http://localhost:3001/api/v1/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to delete user");
    }
});

const userSlice = createSlice({
    name: "users",
    initialState: {
        users: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchUsers.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create
            .addCase(createUser.fulfilled, (state, action) => {
                // Optionally add to list if we want immediate update without refetch
                // state.users.push(action.payload.user); // Assuming payload has user object
            })
            // Update
            .addCase(updateUserRole.fulfilled, (state, action) => {
                const index = state.users.findIndex(u => u._id === action.payload._id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })
            // Delete
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter(user => user._id !== action.payload);
            });
    },
});

export default userSlice.reducer;
