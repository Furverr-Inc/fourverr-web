import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Paper, Box, Typography, Chip, CircularProgress, Alert, Divider, Stack, Button,
} from '@mui/material';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import api from '../services/api';
import { useThemeMode } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import {
  isReporteUnread,
  markMisReporteSeen,
  markMisReportesSeen,
} from '../utils/misReportesNotif';

const ESTADO = {
  PENDIENTE: { labelKey: 'reportPending', color: 'warning' },
  EN_REVISION: { labelKey: 'reportReview', color: 'info' },
  RESUELTO: { labelKey: 'reportResolved', color: 'success' },
  RECHAZADO: { labelKey: 'reportRejected', color: 'default' },
};

const MOTIVO_LABEL = {
  FRAUDE: 'Fraude o estafa',
  CONTENIDO_INAPROPIADO: 'Contenido inapropiado',
  SPAM: 'Spam',
  PRODUCTO_FALSO: 'Producto falso',
  MAL_COMPORTAMIENTO: 'Mal comportamiento',
  PRECIO_ENGAÑOSO: 'Precio engañoso',
  OTRO: 'Otro',
};

const fmt = (d) =>
  d
    ? new Date(d).toLocaleString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

/**
 * Panel en perfil: estado de los reportes que el usuario envió y texto del admin (si existe).
 * Las lecturas confirmadas se guardan en localStorage (por usuario) y alimentan el badge del navbar.
 */
const MisReportesSection = ({ onLoaded }) => {
  const { isDark } = useThemeMode();
  const { t } = useLanguage();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const unreadCount = useMemo(() => list.filter((r) => isReporteUnread(r)).length, [list]);

  const notifyBadge = useCallback(() => {
    onLoaded?.();
  }, [onLoaded]);

  const cargar = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/reportes/mis-reportes');
      const data = Array.isArray(res.data) ? res.data : [];
      setList(data);
      notifyBadge();
    } catch (e) {
      setErr(typeof e.response?.data === 'string' ? e.response.data : t.myReportsError);
    } finally {
      setLoading(false);
    }
  }, [notifyBadge, t.myReportsError]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const handleMarkAll = () => {
    markMisReportesSeen(list);
    setList((prev) => [...prev]);
    notifyBadge();
  };

  const handleMarkOne = (r) => {
    markMisReporteSeen(r);
    setList((prev) => [...prev]);
    notifyBadge();
  };

  return (
    <Paper
      id="panel-mis-reportes"
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'divider',
        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
        <FlagOutlinedIcon sx={{ color: 'primary.main', fontSize: 22, mt: 0.25 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {t.myReportsTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t.myReportsHint}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, lineHeight: 1.5 }}>
            {t.myReportsReadExplainer}
          </Typography>
        </Box>
        {!loading && !err && list.length > 0 && unreadCount > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<DoneAllOutlinedIcon />}
            onClick={handleMarkAll}
            sx={{ borderRadius: 2, flexShrink: 0 }}
          >
            {t.markAllReportsRead}
          </Button>
        )}
      </Box>

      {!loading && !err && list.length > 0 && unreadCount > 0 && (
        <Chip
          size="small"
          color="primary"
          variant="outlined"
          label={t.reportsUnreadSummary.replace('{count}', String(unreadCount))}
          sx={{ mb: 2, fontWeight: 600 }}
        />
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={28} />
        </Box>
      ) : err ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>{err}</Alert>
      ) : list.length === 0 ? (
        <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
          {t.noReportsYet}
        </Typography>
      ) : (
        <Stack spacing={2} divider={<Divider flexItem />}>
          {list.map((r) => {
            const cfg = ESTADO[r.estado] || ESTADO.PENDIENTE;
            const unread = isReporteUnread(r);
            return (
              <Box key={r.id}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.75 }}>
                  <Chip size="small" label={t[cfg.labelKey]} color={cfg.color} variant="outlined" />
                  {unread && (
                    <Chip size="small" label={t.reportUnreadChip} color="error" variant="outlined" />
                  )}
                  <Typography variant="caption" color="text.disabled">{fmt(r.fechaReporte)}</Typography>
                  {unread && (
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<DoneOutlinedIcon sx={{ fontSize: 18 }} />}
                      onClick={() => handleMarkOne(r)}
                      sx={{ ml: 'auto', borderRadius: 2, textTransform: 'none' }}
                    >
                      {t.markReportAsRead}
                    </Button>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {MOTIVO_LABEL[r.motivo] || r.motivo}
                  {r.producto?.titulo && (
                    <> · <strong>{r.producto.titulo}</strong></>
                  )}
                </Typography>
                {r.descripcion && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75 }}>
                    {r.descripcion}
                  </Typography>
                )}
                {r.respuestaAdmin && (
                  <Box sx={{
                    mt: 1,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: isDark ? 'rgba(139,143,200,0.12)' : 'rgba(99,102,241,0.06)',
                    borderLeft: '3px solid',
                    borderColor: 'primary.main',
                  }}>
                    <Typography variant="caption" fontWeight="bold" color="primary">
                      {t.adminReply}
                      {r.fechaRespuesta ? ` · ${fmt(r.fechaRespuesta)}` : ''}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                      {r.respuestaAdmin}
                    </Typography>
                  </Box>
                )}
                {!r.respuestaAdmin && (r.estado === 'RECHAZADO' || r.estado === 'RESUELTO') && (
                  <Typography variant="caption" color="text.disabled">
                    {t.reportNoAdminText}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
};

export default MisReportesSection;
