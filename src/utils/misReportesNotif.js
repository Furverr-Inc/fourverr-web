const LEGACY_STORAGE_KEY = 'zento_reportes_seen';

/** Mapa guardado por usuario para que varias cuentas en el mismo navegador no se mezclen. */
function seenStorageKey() {
  const uid = localStorage.getItem('usuarioId');
  return uid ? `zento_mis_reportes_seen:${uid}` : LEGACY_STORAGE_KEY;
}

/** Huella del estado visible para el usuario (sin tocar la BD). */
export const reporteFingerprint = (r) =>
  `${r?.estado || ''}|${r?.respuestaAdmin || ''}|${r?.fechaRespuesta || ''}`;

export const loadSeenMap = () => {
  const key = seenStorageKey();
  try {
    let raw = localStorage.getItem(key);
    if (!raw && key !== LEGACY_STORAGE_KEY) {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        raw = legacy;
        localStorage.setItem(key, legacy);
      }
    }
    const parsed = JSON.parse(raw || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const saveSeenMap = (map) => {
  try {
    localStorage.setItem(seenStorageKey(), JSON.stringify(map));
  } catch {
    /* ignore */
  }
};

/** Indica si el reporte tiene cambios respecto a la última confirmación de lectura del usuario. */
export const isReporteUnread = (r) => {
  if (!r || r.id == null) return false;
  const seen = loadSeenMap();
  return seen[String(r.id)] !== reporteFingerprint(r);
};

/** Cantidad de reportes no confirmados como leídos. */
export const countUnreadMisReportes = (list) => {
  if (!Array.isArray(list) || !list.length) return 0;
  return list.filter((r) => isReporteUnread(r)).length;
};

/** Marca un solo reporte como leído (huella actual). */
export const markMisReporteSeen = (r) => {
  if (!r || r.id == null) return;
  const seen = loadSeenMap();
  seen[String(r.id)] = reporteFingerprint(r);
  saveSeenMap(seen);
};

/** Marca todos los de la lista como leídos con su huella actual. */
export const markMisReportesSeen = (list) => {
  if (!Array.isArray(list) || !list.length) return;
  const seen = loadSeenMap();
  list.forEach((r) => {
    if (r && r.id != null) seen[String(r.id)] = reporteFingerprint(r);
  });
  saveSeenMap(seen);
};
