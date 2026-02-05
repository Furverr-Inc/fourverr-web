import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Paper, Box, Alert, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../services/api'; 

const Login = () => {
  const [username, setUsername] = useState(''); // Spring Security usa 'username' por defecto
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  // Limpieza de seguridad al entrar
  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    
    try {
      // 1. Petición al Backend
      // NOTA: Java espera { "username": "...", "password": "..." }
      const response = await api.post('/auth/login', {
        username: username, 
        password: password
      });

      // 2. Extraer datos del JwtResponse de Java
      const { token, username: userAlias, role, id } = response.data;

      // 3. Guardar en LocalStorage (Nuestra "Billetera")
      localStorage.setItem('token', token);
      localStorage.setItem('usuarioNombre', userAlias);
      localStorage.setItem('usuarioRol', role);
      localStorage.setItem('usuarioId', id);

      // 4. Redirigir
      navigate('/home');

    } catch (err) {
      console.error("Login fallido:", err);
      if (err.response && err.response.status === 401) {
        setError("Usuario o contraseña incorrectos.");
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={6} sx={{ p: 4, mt: 10, borderRadius: 2 }}>
        <Typography variant="h4" align="center" color="primary" fontWeight="bold">
          Fourverr
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
          Bienvenido de nuevo
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleLogin}>
          <TextField 
            fullWidth label="Usuario o Correo" margin="normal" required
            value={username} onChange={(e) => setUsername(e.target.value)} 
            autoFocus
          />
          
          <TextField 
            fullWidth label="Contraseña" type="password" margin="normal" required
            value={password} onChange={(e) => setPassword(e.target.value)} 
          />
          
          <Button 
            fullWidth variant="contained" size="large" type="submit" 
            disabled={cargando}
            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}>
            {cargando ? 'Entrando...' : 'Iniciar Sesión'}
          </Button>
          
          <Box textAlign="center">
            <Typography variant="body2">
              ¿Nuevo aquí? <Link component={RouterLink} to="/registro" underline="hover" fontWeight="bold">Crea una cuenta</Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;