import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Paper, Box, Alert, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../services/api'; // Importamos nuestra api configurada

const Login = () => {
  const [correoInput, setCorreoInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [error, setError] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const navigate = useNavigate();

  // === 🧹 LIMPIEZA AUTOMÁTICA ===
  // Este bloque se ejecuta apenas entras a esta pantalla.
  // Borra cualquier token viejo para evitar accesos no autorizados.
  useEffect(() => {
    localStorage.clear();
    console.log("🔒 Seguridad: Sesión limpiada al cargar Login.");
  }, []);

  const handleEntrar = async (e) => {
    e.preventDefault();
    setError(false);
    
    try {
      // 1. Petición al Backend
      const response = await api.post('/auth/login', {
        correo: correoInput,
        password: passInput
      });

      // 2. Extraer datos
      const { token, nombreMostrado, usuarioId } = response.data;

      // 3. Guardar la NUEVA llave
      localStorage.setItem('token', token);
      localStorage.setItem('usuarioNombre', nombreMostrado);
      localStorage.setItem('usuarioId', usuarioId);

      // 4. Entrar al sistema
      console.log("✅ Login exitoso");
      navigate('/home');

    } catch (err) {
      console.error("Error en login:", err);
      setError(true);
      
      if (err.response && err.response.status === 401) {
        setMensajeError("Correo o contraseña incorrectos");
      } else {
        setMensajeError("Error de conexión con el servidor");
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={6} sx={{ p: 4, mt: 10, borderRadius: 3 }}>
        <Typography variant="h4" align="center" color="primary" fontWeight="bold">Fourverr</Typography>
        <Typography variant="subtitle1" align="center" sx={{ mb: 3, color: 'gray' }}>Bienvenido</Typography>
        
        {error && <Alert severity="error" sx={{ mt: 2 }}>{mensajeError}</Alert>}
        
        <Box component="form" onSubmit={handleEntrar} sx={{ mt: 2 }}>
          <TextField 
            fullWidth label="Correo Electrónico" margin="normal" required
            value={correoInput} onChange={(e) => setCorreoInput(e.target.value)} 
          />
          
          <TextField 
            fullWidth label="Contraseña" type="password" margin="normal" required
            value={passInput} onChange={(e) => setPassInput(e.target.value)} 
          />
          
          <Button 
            fullWidth variant="contained" size="large" type="submit" 
            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}>
            Iniciar Sesión
          </Button>
          
          <Typography variant="body2" align="center">
            ¿No tienes cuenta? <Link component={RouterLink} to="/registro" underline="hover">Regístrate aquí</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;