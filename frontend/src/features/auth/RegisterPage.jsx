import React, { useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  Link
} from '@mui/material';
import { registerUser, clearAuthError } from './authSlice.js';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '' }
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
    return () => {
      dispatch(clearAuthError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const onSubmit = async (data) => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    dispatch(registerUser({ ...data, timezone: tz }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2.5
      }}
    >
      <Card sx={{ maxWidth: 440, width: '100%', p: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3.5,
                bgcolor: 'primary.main',
                color: '#FFF',
                fontWeight: 800,
                fontSize: '1.4rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(255, 87, 34, 0.4)',
                mb: 1.5
              }}
            >
              DF
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Create your account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start building your daily productivity flow
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Full name"
              fullWidth
              {...register('fullName')}
              error={Boolean(errors.fullName)}
              helperText={errors.fullName?.message}
              placeholder="e.g. Alex Morgan"
            />

            <TextField
              label="Email address"
              type="email"
              fullWidth
              {...register('email')}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              {...register('password')}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ py: 1.2, fontWeight: 700 }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" color="primary" sx={{ fontWeight: 700 }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
