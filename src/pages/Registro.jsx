import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Paper, Box, Alert, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { registrarUsuario } from '../services/usuarioService';

const Registro = () => {
  // Estado único para manejar todos los campos del formulario
  const [form, setForm] = useState({
    nombreUsuario: '',
    correo: '',
    password: '',
    nombreMostrado: '',
    tipo: 'comprador' // Rol por defecto en el marketplace
  });
  const [exito, setExito] = useState(false);

  // Función para enviar los datos a la API de Spring Boot
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Enviamos el objeto 'form' completo al backend
      await registrarUsuario(form);
      setExito(true);
    } catch (err) {
      alert("Error al registrar. Revisa que el correo o usuario no estén duplicados.");
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={10} sx={{ p: 4, mt: 5, borderRadius: 3 }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
          Únete a Fourverr
        </Typography>

        {/* Mensaje de éxito tras el registro exitoso en Java */}
        {exito && <Alert severity="success" sx={{ mb: 2 }}>¡Cuenta creada con éxito!</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Campos del formulario conectados al estado 'form' */}
          <TextField fullWidth label="Tu Nombre Real" margin="normal" required
            onChange={(e) => setForm({...form, nombreMostrado: e.target.value})} />
          
          <TextField fullWidth label="Usuario (Nickname)" margin="normal" required
            onChange={(e) => setForm({...form, nombreUsuario: e.target.value})} />
          
          <TextField fullWidth label="Correo Electrónico" type="email" margin="normal" required
            onChange={(e) => setForm({...form, correo: e.target.value})} />
          
          <TextField fullWidth label="Contraseña" type="password" margin="normal" required
            onChange={(e) => setForm({...form, password: e.target.value})} />

          <Button fullWidth variant="contained" type="submit" sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}>
            Registrarse
          </Button>

          {/* Enlace para volver al login */}
          <Typography variant="body2" align="center">
            ¿Ya eres miembro?{' '}
            <Link component={RouterLink} to="/login" sx={{ fontWeight: 'bold', textDecoration: 'none' }}>
              Inicia sesión
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Registro;