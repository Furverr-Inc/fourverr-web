import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Paper, Box, Alert, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Para navegar entre pantallas
import { obtenerUsuarios } from '../services/usuarioService';

const Login = () => {
  // Estado para capturar lo que el usuario escribe
  const [usuarioInput, setUsuarioInput] = useState('');
  // Estado para mostrar alerta si el usuario no existe
  const [error, setError] = useState(false);
  // Hook para redirigir a otras páginas mediante código
  const navigate = useNavigate();

  // Función que se ejecuta al hacer clic en "ENTRAR"
  const handleEntrar = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setError(false);
    
    try {
      // Llamamos al servicio para traer la lista de usuarios desde Java
      const usuarios = await obtenerUsuarios();
      // Buscamos si existe alguien con ese nombre de usuario
      const existe = usuarios.find(u => u.nombreUsuario === usuarioInput);
      
      if (existe) {
        // Si existe, lo mandamos a la página de inicio (Home)
        navigate('/home');
      } else {
        // Si no existe, activamos la alerta roja
        setError(true);
      }
    } catch (err) {
      alert("Error: Verifica que el Backend esté encendido en el puerto 8080");
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={6} sx={{ p: 4, mt: 10, borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
          Fourverr
        </Typography>

        {/* Alerta condicional: solo aparece si 'error' es true */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>Usuario no encontrado</Alert>}

        <Box component="form" onSubmit={handleEntrar}>
          <TextField
            fullWidth
            label="Nombre de Usuario"
            margin="normal"
            required
            value={usuarioInput}
            onChange={(e) => setUsuarioInput(e.target.value)}
          />
          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}
          >
            Entrar
          </Button>

          {/* Enlace para ir a la pantalla de registro */}
          <Typography variant="body2">
            ¿No tienes cuenta?{' '}
            <Link component={RouterLink} to="/registro" sx={{ fontWeight: 'bold', textDecoration: 'none' }}>
              Crea una aquí
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;