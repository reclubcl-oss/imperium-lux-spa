// Un color por profesional, para distinguirlos en el calendario del admin.
export const STAFF_COLORS = ['#3A5432', '#B5924D', '#8C4A5A', '#3F7C85', '#5B6BA8', '#B8673F', '#6B5B8C', '#7A8A3A'];
export const SIN_ASIGNAR_COLOR = '#9AA096';

export function staffColor(staff, staffId) {
  const i = staff.findIndex(s => s.id === staffId);
  return i < 0 ? SIN_ASIGNAR_COLOR : STAFF_COLORS[i % STAFF_COLORS.length];
}
