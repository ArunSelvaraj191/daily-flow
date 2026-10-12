import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip
} from '@mui/material';

import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { updateProfile } from '../auth/authSlice.js';
import { authApi } from '../../api/auth.api.js';
import { useColorMode } from '../../theme/ThemeProvider.jsx';
import { CATEGORIES } from '../../utils/constants.js';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  timezone: z.string().optional(),
  dailyGoalMinutes: z.coerce.number().min(30, 'Goal must be at least 30 mins'),
  defaultCategory: z.string()
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your new password')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ['confirmPassword']
  });

export const SettingsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { mode, toggleColorMode } = useColorMode();

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  // Profile form
  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      timezone: 'UTC',
      dailyGoalMinutes: 480,
      defaultCategory: 'Work'
    }
  });

  // Password form
  const {
    register: registerPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    formState: { errors: pwdErrors, isSubmitting: pwdSubmitting }
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        fullName: user.fullName || '',
        timezone: user.timezone || 'UTC',
        dailyGoalMinutes: user.preferences?.dailyGoalMinutes || 480,
        defaultCategory: user.preferences?.defaultCategory || 'Work'
      });
    }
  }, [user, resetProfile]);

  const onSaveProfile = async (values) => {
    try {
      setProfileError('');
      setProfileSuccess('');
      await dispatch(
        updateProfile({
          fullName: values.fullName,
          timezone: values.timezone,
          preferences: {
            ...user?.preferences,
            dailyGoalMinutes: values.dailyGoalMinutes,
            defaultCategory: values.defaultCategory,
            theme: mode
          }
        })
      ).unwrap();
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(err || 'Failed to update profile');
    }
  };

  const onChangePassword = async (values) => {
    try {
      setPwdError('');
      setPwdSuccess('');
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      setPwdSuccess('Password changed successfully!');
      resetPwd();
    } catch (err) {
      setPwdError(err.message || 'Failed to change password');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Profile & Settings"
        subtitle="Manage your personal preferences, target schedules, and security credentials"
      />

      <Grid container spacing={3}>
        {/* Profile Details */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardHeader
              title="Personal Information & Preferences"
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
            />
            <Divider />
            <CardContent>
              {profileSuccess && <Alert severity="success" sx={{ mb: 2 }}>{profileSuccess}</Alert>}
              {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}

              <Box component="form" onSubmit={handleProfileSubmit(onSaveProfile)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Controller
                  name="fullName"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField {...field} label="Full Name" fullWidth />
                  )}
                />

                <TextField
                  label="Email Address"
                  fullWidth
                  value={user?.email || ''}
                  disabled
                  helperText="Email cannot be changed."
                />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="defaultCategory"
                      control={profileControl}
                      render={({ field }) => (
                        <TextField {...field} select label="Default Category" fullWidth>
                          {CATEGORIES.map((c) => (
                            <MenuItem key={c} value={c}>{c}</MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="dailyGoalMinutes"
                      control={profileControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="number"
                          label="Daily Target (minutes)"
                          fullWidth
                          helperText="e.g. 480 mins = 8 hours"
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Controller
                  name="timezone"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField {...field} label="Configured Timezone" fullWidth />
                  )}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 2.5, px: 3 }}>
                    Save Preferences
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Security & Theme */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Theme Toggle Card */}
            <Card>
              <CardHeader
                title="Appearance Theme"
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
              />
              <Divider />
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Switch between sleek dark and clean light styles
                  </Typography>
                </Box>
                <Switch
                  checked={mode === 'dark'}
                  onChange={toggleColorMode}
                  color="primary"
                />
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card>
              <CardHeader
                title="Change Password"
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
              />
              <Divider />
              <CardContent>
                {pwdSuccess && <Alert severity="success" sx={{ mb: 2 }}>{pwdSuccess}</Alert>}
                {pwdError && <Alert severity="error" sx={{ mb: 2 }}>{pwdError}</Alert>}

                <Box component="form" onSubmit={handlePwdSubmit(onChangePassword)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    type="password"
                    label="Current Password"
                    fullWidth
                    {...registerPwd('currentPassword')}
                    error={Boolean(pwdErrors.currentPassword)}
                    helperText={pwdErrors.currentPassword?.message}
                  />

                  <TextField
                    type="password"
                    label="New Password"
                    fullWidth
                    {...registerPwd('newPassword')}
                    error={Boolean(pwdErrors.newPassword)}
                    helperText={pwdErrors.newPassword?.message}
                  />

                  <TextField
                    type="password"
                    label="Confirm New Password"
                    fullWidth
                    {...registerPwd('confirmPassword')}
                    error={Boolean(pwdErrors.confirmPassword)}
                    helperText={pwdErrors.confirmPassword?.message}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={pwdSubmitting}
                    sx={{ borderRadius: 2.5, mt: 1 }}
                  >
                    {pwdSubmitting ? 'Updating...' : 'Update Password'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
