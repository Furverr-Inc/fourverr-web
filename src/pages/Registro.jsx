import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Paper, Box, Alert, Link } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../services/api'; // Usamos tu instancia configurada

const Registro = () => {
  const navigate = useNavigate();
  
  // Estado inicial limpio
  const [form, setForm] = useState({
    nombreMostrado: '', // Nombre real (ej: Juan Perez)
    username: '',       // Nickname (ej: juanperez99)
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      // Enviamos exactamente lo que pide la entidad User en Java
      await api.post('/auth/register', form);
      
      // Si pasa, redirigimos al login
      alert("¡Cuenta creada con éxito! Ahora inicia sesión.");
      navigate('/login');

    } catch (err) {
      console.error(err);
      // Mensaje de error amigable
      if (err.response && err.response.status === 409) {
        setError("El usuario o correo ya existen.");
      } else {
        setError("Error al registrarse. Intenta nuevamente.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={6} sx={{ p: 4, mt: 8, borderRadius: 2 }}>
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom color="primary">
          Crear Cuenta
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Únete a la comunidad de creativos
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth label="Nombre Completo" name="nombreMostrado"
            margin="normal" required
            value={form.nombreMostrado} onChange={handleChange}
          />
          
          <TextField
            fullWidth label="Usuario (Nickname)" name="username"
            margin="normal" required
            value={form.username} onChange={handleChange}
          />
          
          <TextField
            fullWidth label="Correo Electrónico" name="email" type="email"
            margin="normal" required
            value={form.email} onChange={handleChange}
          />
          
          <TextField
            fullWidth label="Contraseña" name="password" type="password"
            margin="normal" required
            value={form.password} onChange={handleChange}
          />

          <Button
            fullWidth variant="contained" size="large" type="submit"
            disabled={cargando}
            sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}
          >
            {cargando ? 'Registrando...' : 'Registrarse'}
          </Button>

          <Box textAlign="center" sx={{ mt: 2 }}>
            <Typography variant="body2">
              ¿Ya tienes cuenta?{' '}
              <Link component={RouterLink} to="/login" underline="hover" fontWeight="bold">
                Inicia sesión
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Registro;