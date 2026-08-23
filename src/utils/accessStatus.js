/** Normalize sheet Access to TRUE | FALSE | UNDERCONST (unknown → FALSE). */
export const ACCESS_STATUS = {
  TRUE: 'TRUE',
  FALSE: 'FALSE',
  UNDERCONST: 'UNDERCONST',
};

export function normalizeAccess(raw) {
  if (raw === true) return ACCESS_STATUS.TRUE;
  if (raw === false) return ACCESS_STATUS.FALSE;
  const value = String(raw ?? '')
    .trim()
    .toUpperCase();
  if (value === 'TRUE') return ACCESS_STATUS.TRUE;
  if (value === 'UNDERCONST') return ACCESS_STATUS.UNDERCONST;
  return ACCESS_STATUS.FALSE;
}
