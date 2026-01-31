import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Paper, Box, Alert, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../services/api'; // Usamos nuestra api configurada

const Login = () => {
  const [correoInput, setCorreoInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [error, setError] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const navigate = useNavigate();

  const handleEntrar = async (e) => {
    e.preventDefault();
    setError(false);
    
    try {
      // 1. Enviamos credenciales al nuevo endpoint seguro
      // Nota: Tu backend espera "correo", no "username"
      const response = await api.post('/auth/login', {
        correo: correoInput,
        password: passInput
      });

      // 2. Extraemos los datos del JSON que diseñamos en Java
      const { token, nombreMostrado, usuarioId } = response.data;

      // 3. ¡AQUI OCURRE LA MAGIA! Guardamos la "llave" en el navegador
      localStorage.setItem('token', token);
      localStorage.setItem('usuarioNombre', nombreMostrado);
      localStorage.setItem('usuarioId', usuarioId);

      // 4. Todo bien, pasamos al Home
      console.log("Login exitoso. Token guardado.");
      navigate('/home');

    } catch (err) {
      console.error("Error en login:", err);
      setError(true);
      if (err.response && err.response.status === 401) {
        setMensajeError("Correo o contraseña incorrectos");
      } else {
        setMensajeError("No se pudo conectar con el servidor");
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={6} sx={{ p: 4, mt: 10, borderRadius: 3 }}>
        <Typography variant="h4" align="center" color="primary" fontWeight="bold">Fourverr</Typography>
        <Typography variant="subtitle1" align="center" sx={{ mb: 3, color: 'gray' }}>Bienvenido de nuevo</Typography>
        
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