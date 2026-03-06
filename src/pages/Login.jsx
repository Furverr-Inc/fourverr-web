import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Alert, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../services/api';
import { useThemeMode } from '../ThemeContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { isDark } = useThemeMode();

  useEffect(() => { localStorage.clear(); }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, username: userAlias, role, id, nombreMostrado, fotoUrl } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuarioNombre', nombreMostrado || userAlias);
      localStorage.setItem('usuarioRol', role);
      localStorage.setItem('usuarioId', id);
      localStorage.setItem('usuarioFoto', fotoUrl || '');
      if (role === 'ADMIN') { navigate('/admin'); } else { navigate('/home'); }
    } catch (err) {
      if (err.response?.status === 403) {
        setError(err.response.data || "Tu cuenta ha sido deshabilitada. Contacta al administrador.");
      } else if (err.response?.status === 401) {
        setError("Usuario o contraseña incorrectos.");
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setCargando(false);
    }
  };

  const inputSx = {
    mb: 2,
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.03)',
      '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
      '&:hover fieldset': { borderColor: 'primary.main' },
      '&.Mui-focused fieldset': { borderColor: 'primary.main' },
    },
    '& .MuiInputLabel-root': {
      color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
      '&.Mui-focused': { color: 'primary.main' },
    },
    '& .MuiOutlinedInput-input': {
      color: isDark ? '#fff' : '#111',
    },
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark
        ? 'linear-gradient(135deg, #0d0d1a 0%, #1e0a3c 100%)'
        : 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)',
    }}>
      <Box sx={{
        width: '100%',
        maxWidth: 420,
        mx: 2,
        p: 4,
        borderRadius: 4,
        background: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
        backdropFilter: 'blur(20px)',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
        boxShadow: isDark
          ? '0 20px 60px rgba(0,0,0,0.5)'
          : '0 20px 60px rgba(55,48,163,0.12)',
      }}>
        <Typography variant="h3" align="center" fontWeight="bold" sx={{
          mb: 0.5,
          background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Zento
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 3, color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary' }}>
          Bienvenido de nuevo
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Usuario o Correo"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            sx={inputSx}
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={inputSx}
          />
          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={cargando}
            sx={{
              mt: 1, mb: 2, py: 1.5, fontWeight: 'bold', borderRadius: 2,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              '&:hover': { background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' },
            }}
          >
            {cargando ? 'Entrando...' : 'Iniciar Sesión'}
          </Button>
          <Box textAlign="center">
            <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary' }}>
              ¿Nuevo aquí?{' '}
              <Link component={RouterLink} to="/registro" underline="hover" fontWeight="bold" sx={{ color: 'primary.main' }}>
                Crea una cuenta
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
