import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Paper, Box, Alert, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { obtenerUsuarios } from '../services/usuarioService';

const Login = () => {
  const [usuarioInput, setUsuarioInput] = useState('');
  const [passInput, setPassInput] = useState(''); // Nuevo estado para contraseña
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleEntrar = async (e) => {
    e.preventDefault();
    setError(false);
    
    try {
      const usuarios = await obtenerUsuarios();
      // Buscamos que coincidan el nickname Y la contraseña
      const usuarioValido = usuarios.find(
        u => u.nombreUsuario === usuarioInput && u.password === passInput
      );
      
      if (usuarioValido) {
        // Guardamos el nombre real para que la Navbar lo salude
        localStorage.setItem('usuarioNombre', usuarioValido.nombreMostrado);
        navigate('/home');
      } else {
        setError(true);
      }
    } catch (err) {
      alert("Error de conexión con el Backend");
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={6} sx={{ p: 4, mt: 10, borderRadius: 3 }}>
        <Typography variant="h4" align="center" color="primary" fontWeight="bold">Fourverr</Typography>
        {error && <Alert severity="error" sx={{ mt: 2 }}>Credenciales incorrectas</Alert>}
        
        <Box component="form" onSubmit={handleEntrar} sx={{ mt: 2 }}>
          <TextField fullWidth label="Usuario" margin="normal" required
            value={usuarioInput} onChange={(e) => setUsuarioInput(e.target.value)} />
          
          <TextField fullWidth label="Contraseña" type="password" margin="normal" required
            value={passInput} onChange={(e) => setPassInput(e.target.value)} />
          
          <Button fullWidth variant="contained" size="large" type="submit" sx={{ mt: 3, mb: 2 }}>
            Entrar
          </Button>
          <Typography variant="body2" align="center">
            ¿No tienes cuenta? <Link component={RouterLink} to="/registro">Regístrate</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;