/** Formatea un monto en pesos chilenos, ej. 45000 → "$45.000". */
export const formatCLP = (n) => (n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
