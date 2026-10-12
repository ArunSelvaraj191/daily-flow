import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/auth.api.js';

// Load stored user & token
const storedToken = localStorage.getItem('dailyflow_token');
let storedUser = null;
try {
  const raw = localStorage.getItem('dailyflow_user');
  if (raw) storedUser = JSON.parse(raw);
} catch (e) {
  // Ignore parse error
}

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      return await authApi.register(payload);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authApi.login(credentials);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      return await authApi.getMe();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      return await authApi.updateProfile(data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: storedToken || null,
    user: storedUser || null,
    isAuthenticated: Boolean(storedToken),
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('dailyflow_token');
      localStorage.removeItem('dailyflow_user');
      authApi.logout().catch(() => {});
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        localStorage.setItem('dailyflow_token', action.payload.accessToken);
        localStorage.setItem('dailyflow_user', JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        localStorage.setItem('dailyflow_token', action.payload.accessToken);
        localStorage.setItem('dailyflow_user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      // Me
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('dailyflow_user', JSON.stringify(action.payload));
      })
      // Profile update
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('dailyflow_user', JSON.stringify(action.payload));
      });
  }
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
