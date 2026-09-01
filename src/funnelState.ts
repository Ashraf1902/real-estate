export interface Draft {
  propertyId?: string;
  propertyTitle?: string;
  customer?: { name: string; phone: string; email?: string };
  services?: string[];
  serviceNames?: string[];
  upsell?: boolean;
  downsell?: boolean;
  extraTotal?: number;
}

const KEY = 're_draft';

export function getDraft(): Draft {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Draft;
  } catch {
    return {};
  }
}

export function setDraft(p: Partial<Draft>): Draft {
  const d = { ...getDraft(), ...p };
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    /* ignore */
  }
  return d;
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
