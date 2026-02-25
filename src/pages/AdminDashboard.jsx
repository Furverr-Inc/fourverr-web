import React, { useEffect, useState } from 'react';
import {
  Container, Paper, Box, Typography, Avatar, Button, IconButton,
  Badge, Menu, MenuItem, Divider, Alert, Chip, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, CircularProgress, Tabs, Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import api from '../services/api';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const perfilResponse = await api.get('/users/perfil');
      setAdmin(perfilResponse.data);

      const solicitudesResponse = await api.get('/users/solicitudes-vendedor');
      setSolicitudes(solicitudesResponse.data);

      const usuariosResponse = await api.get('/users/todos');
      setUsuarios(usuariosResponse.data);

      setLoading(false);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleOpenNotifications = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorEl(null);
  };

  const handleAprobarSolicitud = async (userId) => {
    try {
      await api.put(`/users/${userId}/aprobar-vendedor`);
      setSuccess('Solicitud aprobada correctamente');
      handleCloseNotifications();
      cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al aprobar la solicitud');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRechazarSolicitud = async (userId) => {
    try {
      await api.put(`/users/${userId}/rechazar-vendedor`);
      setSuccess('Solicitud rechazada');
      handleCloseNotifications();
      cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al rechazar la solicitud');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggleUsuario = async (userId, habilitado) => {
    try {
      await api.put(`/users/${userId}/toggle-habilitado`);
      setSuccess(habilitado ? 'Usuario deshabilitado' : 'Usuario habilitado');
      cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al cambiar el estado del usuario');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleOpenDeleteDialog = (user) => {
    setDeleteDialog({ open: true, user });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, user: null });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/users/${deleteDialog.user.id}`);
      setSuccess('Usuario eliminado correctamente');
      handleCloseDeleteDialog();
      cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al eliminar el usuario');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleFotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSubiendoFoto(true);
    const formData = new FormData();
    formData.append('archivo', file);

    try {
      const response = await api.post('/users/perfil/foto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setAdmin({ ...admin, fotoUrl: response.data.url });
      setSuccess('Foto actualizada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al subir la foto');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubiendoFoto(false);
    }
  };

  const usuariosPorRol = {
    todos: usuarios,
    usuarios: usuarios.filter(u => u.role === 'USER'),
    vendedores: usuarios.filter(u => u.role === 'SELLER')
  };

  const usuariosMostrar = tabValue === 0 ? usuariosPorRol.todos : 
                          tabValue === 1 ? usuariosPorRol.usuarios : 
                          usuariosPorRol.vendedores;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header del Admin con foto */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                src={admin?.fotoUrl}
                sx={{ 
                  width: 80, 
                  height: 80, 
                  fontSize: '2rem',
                  backgroundColor: '#d32f2f'
                }}
              >
                {!admin?.fotoUrl && (admin?.nombreMostrado?.charAt(0) || admin?.username?.charAt(0) || 'A')}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="foto-perfil-admin"
                type="file"
                onChange={handleFotoChange}
              />
              <label htmlFor="foto-perfil-admin">
                <IconButton
                  component="span"
                  disabled={subiendoFoto}
                  sx={{
                    position: 'absolute',
                    bottom: -5,
                    right: -5,
                    backgroundColor: '#1dbf73',
                    color: 'white',
                    '&:hover': { backgroundColor: '#19a463' },
                    width: 32,
                    height: 32
                  }}
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
              </label>
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {admin?.nombreMostrado || admin?.username}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                (Administrador)
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton 
              onClick={handleOpenNotifications}
              sx={{ color: '#1dbf73' }}
            >
              <Badge badgeContent={solicitudes.length} color="error">
                <NotificationsIcon fontSize="large" />
              </Badge>
            </IconButton>

            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Cerrar Sesión
            </Button>
          </Box>
        </Box>
      </Paper>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Tabla de Usuarios con Tabs */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Gestión de Usuarios
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
          <Tab label={`Todos (${usuariosPorRol.todos.length})`} />
          <Tab label={`Usuarios (${usuariosPorRol.usuarios.length})`} />
          <Tab label={`Vendedores (${usuariosPorRol.vendedores.length})`} />
        </Tabs>

        {usuariosMostrar.length === 0 ? (
          <Alert severity="info">No hay usuarios en esta categoría</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Foto</strong></TableCell>
                  <TableCell><strong>Nombre</strong></TableCell>
                  <TableCell><strong>Usuario</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Rol</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell align="center"><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuariosMostrar.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <Avatar 
                        src={usuario.fotoUrl}
                        sx={{ width: 40, height: 40, backgroundColor: '#1dbf73' }}
                      >
                        {!usuario.fotoUrl && (usuario.nombreMostrado?.charAt(0) || usuario.username?.charAt(0))}
                      </Avatar>
                    </TableCell>
                    <TableCell>{usuario.nombreMostrado || usuario.username}</TableCell>
                    <TableCell>@{usuario.username}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={usuario.role === 'SELLER' ? 'Vendedor' : 'Usuario'} 
                        color={usuario.role === 'SELLER' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={usuario.habilitado ? 'Habilitado' : 'Deshabilitado'} 
                        color={usuario.habilitado ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          color={usuario.habilitado ? 'warning' : 'success'}
                          onClick={() => handleToggleUsuario(usuario.id, usuario.habilitado)}
                          title={usuario.habilitado ? 'Deshabilitar' : 'Habilitar'}
                        >
                          <BlockIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDeleteDialog(usuario)}
                          title="Eliminar usuario"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Menu de Notificaciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseNotifications}
        PaperProps={{
          sx: { width: 400, maxHeight: 500 }
        }}
      >
        <MenuItem disabled>
          <Typography variant="h6" fontWeight="bold">
            Solicitudes de Vendedor ({solicitudes.length})
          </Typography>
        </MenuItem>
        <Divider />
        
        {solicitudes.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No hay solicitudes pendientes
            </Typography>
          </MenuItem>
        ) : (
          solicitudes.map((solicitud) => (
            <Box key={solicitud.id} sx={{ p: 2, borderBottom: '1px solid #eee' }}>
              <Typography variant="body1" fontWeight="bold">
                {solicitud.nombreMostrado || solicitud.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                @{solicitud.username} - {solicitud.email}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleAprobarSolicitud(solicitud.id)}
                >
                  Aprobar
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => handleRechazarSolicitud(solicitud.id)}
                >
                  Rechazar
                </Button>
              </Box>
            </Box>
          ))
        )}
      </Menu>

      {/* Dialog de confirmación */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>
          ¿Estás seguro?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta acción eliminará permanentemente al usuario <strong>{deleteDialog.user?.username}</strong>.
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Eliminar Usuario
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
