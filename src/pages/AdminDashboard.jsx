import React, { useEffect, useState } from 'react';
import {
  Container, Paper, Box, Typography, Avatar, Button, IconButton,
  Badge, Menu, MenuItem, Divider, Alert, Chip, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, CircularProgress, 
  Tabs, Tab, Checkbox, Toolbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import api from '../services/api';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, users: [] });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [selected, setSelected] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
    // Actualizar notificaciones cada 30 segundos
    const interval = setInterval(cargarDatos, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    // Cada llamada es INDEPENDIENTE: si una falla, las otras igual se ejecutan
    const [perfilRes, solicitudesRes, usuariosRes] = await Promise.allSettled([
      api.get('/users/perfil'),
      api.get('/users/solicitudes-vendedor'),
      api.get('/users/todos'),
    ]);

    // Perfil
    if (perfilRes.status === 'fulfilled') {
      setAdmin(perfilRes.value.data);
    } else {
      console.error('Error /perfil:', perfilRes.reason);
      const status = perfilRes.reason?.response?.status;
      if (status === 401) {
        setError('Sesión expirada. Por favor cierra sesión e inicia de nuevo.');
        setLoading(false);
        return;
      }
    }

    // Solicitudes de vendedor
    if (solicitudesRes.status === 'fulfilled') {
      setSolicitudes(Array.isArray(solicitudesRes.value.data) ? solicitudesRes.value.data : []);
    } else {
      console.error('Error /solicitudes-vendedor:', solicitudesRes.reason?.response?.status, solicitudesRes.reason?.response?.data);
      setSolicitudes([]);
    }

    // Lista de usuarios
    if (usuariosRes.status === 'fulfilled') {
      setUsuarios(Array.isArray(usuariosRes.value.data) ? usuariosRes.value.data : []);
    } else {
      const status = usuariosRes.reason?.response?.status;
      const msg = usuariosRes.reason?.response?.data;
      console.error('Error /todos:', status, msg);
      if (status === 403) {
        setError(`El backend rechazó la petición (403). Respuesta: "${msg}". Revisa la consola del backend.`);
      } else if (status === 401) {
        setError('Sesión expirada. Por favor cierra sesión e inicia de nuevo.');
      } else {
        setError(`Error cargando usuarios (${status}): ${msg}`);
      }
      setUsuarios([]);
    }

    setLoading(false);
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
      setSuccess('✅ Solicitud aprobada. El usuario ahora puede publicar productos.');
      handleCloseNotifications();
      cargarDatos();
      setTimeout(() => setSuccess(''), 4000);
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

  // Selección de usuarios
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(usuariosMostrar.map(u => u.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (userId) => {
    if (selected.includes(userId)) {
      setSelected(selected.filter(id => id !== userId));
    } else {
      setSelected([...selected, userId]);
    }
  };

  // Acciones en lote
  const handleHabilitarSeleccionados = async () => {
    try {
      await Promise.all(
        selected.map(userId => api.put(`/users/${userId}/habilitar`))
      );
      setSuccess(`✅ ${selected.length} usuario(s) habilitado(s)`);
      setSelected([]);
      cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al habilitar usuarios');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeshabilitarSeleccionados = async () => {
    try {
      await Promise.all(
        selected.map(userId => api.put(`/users/${userId}/deshabilitar`))
      );
      setSuccess(`⚠️ ${selected.length} usuario(s) deshabilitado(s)`);
      setSelected([]);
      cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al deshabilitar usuarios');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEliminarSeleccionados = () => {
    const usuariosAEliminar = usuarios.filter(u => selected.includes(u.id));
    setDeleteDialog({ open: true, users: usuariosAEliminar });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, users: [] });
  };

  const handleConfirmDelete = async () => {
    try {
      await Promise.all(
        deleteDialog.users.map(user => api.delete(`/users/${user.id}`))
      );
      setSuccess(`🗑️ ${deleteDialog.users.length} usuario(s) eliminado(s) de la base de datos`);
      handleCloseDeleteDialog();
      setSelected([]);
      cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al eliminar usuarios');
      setTimeout(() => setError(''), 3000);
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

  const isSelected = (userId) => selected.includes(userId);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header del Admin */}
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
            {/* ICONO DE NOTIFICACIONES */}
            <IconButton 
              onClick={handleOpenNotifications}
              sx={{ 
                color: solicitudes.length > 0 ? '#d32f2f' : '#1dbf73',
                animation: solicitudes.length > 0 ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.1)' },
                  '100%': { transform: 'scale(1)' }
                }
              }}
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

      {/* Tabla de Usuarios */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Gestión de Usuarios
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* TABS CON CATEGORÍAS */}
        <Tabs value={tabValue} onChange={(e, newValue) => { setTabValue(newValue); setSelected([]); }} sx={{ mb: 2 }}>
          <Tab label={`Todos (${usuariosPorRol.todos.length})`} />
          <Tab label={`Usuarios (${usuariosPorRol.usuarios.length})`} />
          <Tab label={`Vendedores (${usuariosPorRol.vendedores.length})`} />
        </Tabs>

        {/* TOOLBAR CON BOTONES DE ACCIÓN (aparece cuando hay usuarios seleccionados) */}
        {selected.length > 0 && (
          <Toolbar sx={{ 
            bgcolor: 'rgba(29, 191, 115, 0.1)', 
            borderRadius: 1, 
            mb: 2,
            border: '2px solid #1dbf73'
          }}>
            <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" fontWeight="bold">
              {selected.length} seleccionado(s)
            </Typography>
            <Button 
              variant="contained"
              startIcon={<CheckBoxIcon />}
              onClick={handleHabilitarSeleccionados}
              sx={{ 
                mr: 1,
                backgroundColor: '#1dbf73',
                '&:hover': { backgroundColor: '#19a463' }
              }}
            >
              Habilitar
            </Button>
            <Button 
              variant="contained"
              startIcon={<BlockIcon />}
              onClick={handleDeshabilitarSeleccionados}
              sx={{ mr: 1 }}
              color="warning"
            >
              Deshabilitar
            </Button>
            <Button 
              variant="contained"
              startIcon={<DeleteIcon />}
              onClick={handleEliminarSeleccionados}
              color="error"
            >
              Eliminar de BD
            </Button>
          </Toolbar>
        )}

        {usuariosMostrar.length === 0 ? (
          <Alert severity="info">No hay usuarios en esta categoría</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < usuariosMostrar.length}
                      checked={usuariosMostrar.length > 0 && selected.length === usuariosMostrar.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell><strong>Foto</strong></TableCell>
                  <TableCell><strong>Nombre</strong></TableCell>
                  <TableCell><strong>Usuario</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Rol</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuariosMostrar.map((usuario) => {
                  const isItemSelected = isSelected(usuario.id);
                  
                  return (
                    <TableRow 
                      key={usuario.id}
                      hover
                      onClick={() => handleSelectOne(usuario.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      selected={isItemSelected}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={isItemSelected} />
                      </TableCell>
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
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {usuario.habilitado ? (
                            <IconButton 
                              size="small" 
                              color="warning" 
                              title="Deshabilitar"
                              onClick={async () => { await api.put(`/users/${usuario.id}/deshabilitar`); cargarDatos(); setSuccess('Usuario deshabilitado'); setTimeout(() => setSuccess(''), 3000); }}
                            >
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          ) : (
                            <IconButton 
                              size="small" 
                              color="success" 
                              title="Habilitar"
                              onClick={async () => { await api.put(`/users/${usuario.id}/habilitar`); cargarDatos(); setSuccess('Usuario habilitado'); setTimeout(() => setSuccess(''), 3000); }}
                            >
                              <CheckBoxIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton 
                            size="small" 
                            color="error" 
                            title="Eliminar"
                            onClick={() => setDeleteDialog({ open: true, users: [usuario] })}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* MENU DE NOTIFICACIONES (con botones Aprobar/Rechazar) */}
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
            🔔 Solicitudes de Vendedor ({solicitudes.length})
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
                  sx={{ flex: 1 }}
                >
                  Aprobar
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => handleRechazarSolicitud(solicitud.id)}
                  sx={{ flex: 1 }}
                >
                  Rechazar
                </Button>
              </Box>
            </Box>
          ))
        )}
      </Menu>

      {/* DIALOG DE CONFIRMACIÓN PARA ELIMINAR */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>
          ⚠️ ¿Estás seguro?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta acción eliminará <strong>permanentemente</strong> {deleteDialog.users.length} usuario(s) de la base de datos:
            {deleteDialog.users.map(u => (
              <Box key={u.id} sx={{ mt: 1, ml: 2 }}>
                • <strong>@{u.username}</strong> ({u.email})
              </Box>
            ))}
            <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
              <Typography variant="body2" color="error" fontWeight="bold">
                ⚠️ Esta acción NO se puede deshacer
              </Typography>
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Sí, Eliminar {deleteDialog.users.length} Usuario(s)
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
