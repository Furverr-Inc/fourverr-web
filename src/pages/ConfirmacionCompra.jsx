import React, { useEffect, useState } from 'react';
import { Container, Paper, Box, Typography, Button, Divider, Chip, Avatar } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon        from '@mui/icons-material/Home';
import PersonIcon      from '@mui/icons-material/Person';
import DownloadIcon    from '@mui/icons-material/Download';
import { useThemeMode } from '../ThemeContext';

/* ── Genera y descarga un ticket de compra como HTML imprimible ── */
const descargarTicket = (pedido) => {
  if (!pedido) return;
  const fecha = pedido.fechaPedido
    ? new Date(pedido.fechaPedido).toLocaleString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const folio     = `ZENTO-${String(pedido.id || Date.now()).padStart(6,'0')}`;
  const imgUrl    = pedido.producto?.urlPortada || pedido.producto?.urlArchivo || '';
  const titulo    = pedido.producto?.titulo    || 'Producto';
  const vendedor  = pedido.producto?.vendedor?.nombreMostrado || pedido.producto?.vendedor?.username || 'N/A';
  const precio    = pedido.producto?.precio != null ? `$${Number(pedido.producto.precio).toLocaleString('es-MX')}` : '—';
  const estado    = pedido.estado || 'PAGADO';
  const imgBlock  = imgUrl
    ? `<img src="${imgUrl}" class="prod-img" onerror="this.style.display='none';this.nextSibling.style.display='flex'" /><div class="prod-placeholder" style="display:none">📦</div>`
    : `<div class="prod-placeholder">📦</div>`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Ticket ${folio} — Zento</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,600;0,700;0,800;1,400&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  body { font-family:'Inter',sans-serif; background:#ECEDF6; min-height:100vh;
         display:flex; align-items:flex-start; justify-content:center; padding:40px 20px; }

  /* ── Card ── */
  .card { width:520px; background:#fff; border-radius:20px;
          box-shadow:0 24px 80px rgba(13,17,39,0.18); overflow:hidden; }

  /* ── Header con imagen de fondo del producto ── */
  .hero { position:relative; min-height:200px; overflow:hidden; }
  .hero-bg { position:absolute; inset:0; background-size:cover; background-position:center;
             filter:blur(18px) brightness(0.35) saturate(1.6); transform:scale(1.1); }
  .hero-overlay { position:absolute; inset:0;
                  background:linear-gradient(160deg, rgba(13,17,39,0.7) 0%, rgba(139,143,200,0.55) 100%); }
  .hero-content { position:relative; z-index:2; padding:32px 28px 24px;
                  display:flex; flex-direction:column; align-items:center; text-align:center; }
  .brand-row { display:flex; align-items:center; gap:10px; margin-bottom:20px; }
  .brand-icon { width:36px; height:36px; background:rgba(255,255,255,0.15);
                border:1.5px solid rgba(255,255,255,0.3); border-radius:10px;
                display:flex; align-items:center; justify-content:center;
                font-size:18px; font-weight:800; color:#fff; letter-spacing:-1px; }
  .brand-name { font-size:20px; font-weight:800; color:#fff; letter-spacing:1px; }
  .brand-sub  { font-size:11px; color:rgba(255,255,255,0.6); letter-spacing:2px; text-transform:uppercase; }
  .check-circle { width:60px; height:60px; border-radius:50%;
                  background:linear-gradient(135deg,#10b981,#059669);
                  border:3px solid rgba(255,255,255,0.35);
                  display:flex; align-items:center; justify-content:center;
                  font-size:28px; margin-bottom:10px;
                  box-shadow:0 8px 24px rgba(16,185,129,0.45); }
  .hero-title { font-size:22px; font-weight:800; color:#fff; margin-bottom:4px; }
  .hero-sub   { font-size:13px; color:rgba(255,255,255,0.7); }

  /* ── Folio strip ── */
  .folio-strip { background:linear-gradient(90deg,#0D1127,#1E2A45);
                 padding:12px 28px; display:flex; justify-content:space-between; align-items:center; }
  .folio-label { font-size:10px; color:rgba(200,202,212,0.55); text-transform:uppercase; letter-spacing:2px; }
  .folio-code  { font-size:15px; font-weight:700; color:#8B8FC8; letter-spacing:2px; font-variant-numeric:tabular-nums; }

  /* ── Product section ── */
  .section { padding:24px 28px; }
  .prod-card { display:flex; gap:16px; align-items:center; padding:16px;
               background:#F8F8FC; border-radius:14px; border:1.5px solid #E8E9F0; }
  .prod-img-wrap { width:80px; height:80px; border-radius:10px; overflow:hidden;
                   flex-shrink:0; background:#E2E3EF; position:relative; }
  .prod-img { width:80px; height:80px; object-fit:cover; display:block; }
  .prod-placeholder { width:80px; height:80px; display:flex; align-items:center;
                      justify-content:center; font-size:32px; }
  .prod-title  { font-size:17px; font-weight:700; color:#0D1127; margin-bottom:5px; line-height:1.3; }
  .prod-seller { font-size:13px; color:#6B7280; }
  .prod-badge  { display:inline-block; margin-top:8px; padding:3px 10px; border-radius:20px;
                 font-size:11px; font-weight:600; background:rgba(139,143,200,0.12); color:#5a5e9a; }

  /* ── Divider ── */
  .divider { margin:0 28px; border:none; border-top:1.5px dashed #E8E9EF; }

  /* ── Details ── */
  .section-title { font-size:10px; text-transform:uppercase; letter-spacing:2px;
                   color:#9CA3AF; font-weight:600; margin-bottom:14px; }
  .detail-row { display:flex; justify-content:space-between; align-items:center;
                margin-bottom:10px; font-size:14px; }
  .detail-label { color:#6B7280; }
  .detail-val   { font-weight:600; color:#0D1127; }
  .status-pill  { display:inline-flex; align-items:center; gap:5px; padding:3px 12px;
                  border-radius:20px; font-size:12px; font-weight:700;
                  background:rgba(16,185,129,0.1); color:#059669; }

  /* ── Total ── */
  .total-box { margin-top:16px; padding:18px 20px;
               background:linear-gradient(135deg,rgba(13,17,39,0.04),rgba(139,143,200,0.1));
               border-radius:14px; border:1.5px solid rgba(139,143,200,0.2);
               display:flex; justify-content:space-between; align-items:center; }
  .total-label { font-size:14px; font-weight:600; color:#374151; }
  .total-amount { font-size:28px; font-weight:800; color:#0D1127; letter-spacing:-0.5px; }

  /* ── QR-like decoration strip ── */
  .deco-strip { position:relative; margin:0; height:20px; overflow:hidden; }
  .deco-strip::before { content:''; position:absolute; left:-10px; right:-10px; height:40px;
    background:repeating-linear-gradient(90deg,transparent,transparent 8px,#ECEDF6 8px,#ECEDF6 16px);
    top:-10px; border-radius:50%; }

  /* ── Footer ── */
  .footer { background:#0D1127; padding:20px 28px; text-align:center; }
  .footer-text { font-size:12px; color:rgba(200,202,212,0.5); line-height:1.7; }
  .footer-brand { font-weight:700; color:#8B8FC8; }
  .footer-dots { display:flex; justify-content:center; gap:6px; margin-top:12px; }
  .dot { width:6px; height:6px; border-radius:50%; }

  @media print {
    body { background:#fff; padding:0; }
    .card { box-shadow:none; width:100%; max-width:580px; border-radius:0; }
  }
</style>
</head>
<body>
<div class="card">

  <!-- HERO: imagen de fondo del producto -->
  <div class="hero">
    ${imgUrl ? `<div class="hero-bg" style="background-image:url('${imgUrl}')"></div>` : `<div class="hero-bg" style="background:linear-gradient(135deg,#0D1127,#1E2A45)"></div>`}
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <div class="brand-row">
        <div class="brand-icon">Z</div>
        <div>
          <div class="brand-name">ZENTO</div>
          <div class="brand-sub">Marketplace Digital</div>
        </div>
      </div>
      <div class="check-circle">✓</div>
      <div class="hero-title">¡Compra Confirmada!</div>
      <div class="hero-sub">Tu pago fue procesado exitosamente</div>
    </div>
  </div>

  <!-- FOLIO -->
  <div class="folio-strip">
    <span class="folio-label">Folio de compra</span>
    <span class="folio-code"># ${folio}</span>
  </div>

  <!-- PRODUCTO -->
  <div class="section">
    <div class="section-title">Producto adquirido</div>
    <div class="prod-card">
      <div class="prod-img-wrap">${imgBlock}</div>
      <div style="flex:1;min-width:0">
        <div class="prod-title">${titulo}</div>
        <div class="prod-seller">por ${vendedor}</div>
        <div class="prod-badge">Vendedor verificado ✓</div>
      </div>
    </div>
  </div>

  <hr class="divider">

  <!-- DETALLES -->
  <div class="section">
    <div class="section-title">Detalles de la transacción</div>
    <div class="detail-row">
      <span class="detail-label">Estado</span>
      <span class="status-pill">✓ ${estado}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Fecha y hora</span>
      <span class="detail-val">${fecha}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Método de pago</span>
      <span class="detail-val">💳 Tarjeta</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Vendedor</span>
      <span class="detail-val">${vendedor}</span>
    </div>

    <div class="total-box">
      <span class="total-label">Total pagado</span>
      <span class="total-amount">${precio}</span>
    </div>
  </div>

  <!-- PERFORADO decorativo -->
  <div class="deco-strip"></div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-text">
      Gracias por tu compra en <span class="footer-brand">Zento</span>.<br>
      Puedes chatear con el vendedor y ver más detalles en tu perfil.
    </div>
    <div class="footer-dots">
      <div class="dot" style="background:#8B8FC8"></div>
      <div class="dot" style="background:rgba(139,143,200,0.5)"></div>
      <div class="dot" style="background:rgba(139,143,200,0.25)"></div>
    </div>
  </div>

</div>
<script>window.onload = () => { setTimeout(() => window.print(), 400); }</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `ticket-${folio}.html`;
  a.click();
  URL.revokeObjectURL(url);
};


const ConfirmacionCompra = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isDark } = useThemeMode();
  const [count, setCount] = useState(8);

  // Datos del pedido pasados por navigate state
  const pedido = location.state?.pedido || null;

  // Auto-redirect countdown
  useEffect(() => {
    if (count <= 0) { navigate('/home'); return; }
    const t = setInterval(() => setCount(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [count, navigate]);

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: isDark
        ? 'linear-gradient(135deg, #0d0d1a 0%, #1e0a3c 100%)'
        : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0f4ff 100%)',
      p: 2,
    }}>
      <Paper elevation={isDark ? 0 : 4} sx={{
        maxWidth: { xs: '100%', sm: 520 }, width: '100%', borderRadius: 4, overflow: 'hidden',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
        background: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
        backdropFilter: 'blur(20px)',
      }}>

        {/* Header verde */}
        <Box sx={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          py: 4, px: 3, textAlign: 'center',
        }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 2,
          }}>
            <CheckCircleIcon sx={{ fontSize: 44, color: 'white' }} />
          </Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: 'white', mb: 0.5 }}>
            ¡Compra realizada!
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
            Tu pago fue procesado correctamente
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>

          {/* Detalle del pedido */}
          {pedido ? (
            <Box sx={{
              borderRadius: 3, border: '1px solid', borderColor: 'divider',
              overflow: 'hidden', mb: 3,
            }}>
              <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
                <Avatar
                  src={pedido.producto?.urlPortada || pedido.producto?.urlArchivo}
                  variant="rounded"
                  sx={{ width: 64, height: 64, borderRadius: 2, bgcolor: 'primary.main', fontSize: '1.5rem' }}
                >
                  {pedido.producto?.titulo?.charAt(0) || '?'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {pedido.producto?.titulo || 'Producto'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vendedor: {pedido.producto?.vendedor?.nombreMostrado || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pedido.fechaPedido ? new Date(pedido.fechaPedido).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                  </Typography>
                </Box>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, bgcolor: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)' }}>
                <Typography variant="body2" color="text.secondary">Total pagado</Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  ${pedido.producto?.precio}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{
              borderRadius: 3, border: '1px dashed', borderColor: 'divider',
              p: 3, textAlign: 'center', mb: 3,
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="body1" fontWeight="bold">Pedido confirmado</Typography>
              <Typography variant="body2" color="text.secondary">
                Puedes ver el detalle en tu perfil
              </Typography>
            </Box>
          )}

          {/* Botón descargar ticket */}
          {pedido && (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => descargarTicket(pedido)}
              sx={{
                mb: 2, borderRadius: 2, py: 1.5,
                borderColor: '#10b981', color: '#10b981', minHeight: 44,
                fontWeight: 600, textTransform: 'none', fontSize: '0.9rem',
                '&:hover': { borderColor: '#059669', bgcolor: 'rgba(16,185,129,0.06)' },
              }}
            >
              Descargar ticket de compra
            </Button>
          )}

          {/* Botones de navegación */}
          <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              variant="contained" fullWidth startIcon={<HomeIcon />}
              onClick={() => navigate('/home')}
              sx={{
                borderRadius: 2, py: 1.5, fontWeight: 'bold', minHeight: 44,
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                color: '#fff',
                '&:hover': { background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' },
              }}
            >
              Seguir explorando
            </Button>
            <Button
              variant="outlined" fullWidth startIcon={<PersonIcon />}
              onClick={() => navigate('/perfil')}
              sx={{
                borderRadius: 2, py: 1.5, minHeight: 44,
                borderColor: isDark ? 'rgba(139,143,200,0.5)' : '#8B8FC8',
                color: isDark ? '#c7c9e8' : '#5a5e9a',
                '&:hover': { borderColor: '#8B8FC8', bgcolor: 'rgba(139,143,200,0.08)' },
              }}
            >
              Mis compras
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
            Redirigiendo al inicio en {count}s...
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ConfirmacionCompra;
