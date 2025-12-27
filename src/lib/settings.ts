import type { AppSettings } from './types';

const SETTINGS_KEY = 'construction-management-settings';
const BACKUP_REMINDER_DAYS = 7;

const defaultSettings: AppSettings = {
  currency: {
    symbol: '₹',
    code: 'INR',
    position: 'before',
  },
  showArchived: false,
  lastBackupDate: undefined,
};

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return defaultSettings;
  
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) return defaultSettings;
  
  try {
    return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

export function formatCurrency(amount: number): string {
  const settings = getSettings();
  const formatted = new Intl.NumberFormat('en-IN').format(Math.abs(amount));
  
  if (settings.currency.position === 'before') {
    return `${settings.currency.symbol}${formatted}`;
  }
  return `${formatted}${settings.currency.symbol}`;
}

export function shouldShowBackupReminder(): boolean {
  const settings = getSettings();
  if (!settings.lastBackupDate) return true;
  
  const lastBackup = new Date(settings.lastBackupDate);
  const daysSinceBackup = Math.floor(
    (Date.now() - lastBackup.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return daysSinceBackup >= BACKUP_REMINDER_DAYS;
}

export function markBackupComplete(): void {
  saveSettings({ lastBackupDate: new Date().toISOString() });
}

export function getLastBackupInfo(): { date: Date | null; daysSince: number } {
  const settings = getSettings();
  if (!settings.lastBackupDate) {
    return { date: null, daysSince: -1 };
  }
  
  const date = new Date(settings.lastBackupDate);
  const daysSince = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return { date, daysSince };
}

