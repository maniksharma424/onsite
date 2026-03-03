'use client';

import { useEffect, useState } from 'react';
import { shouldShowBackupReminder, markBackupComplete, getLastBackupInfo } from '@/lib/settings';
import { exportAllData, seedDatabaseIfEmpty } from '@/lib/db';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Clock } from 'lucide-react';
import { toast } from 'sonner';

const REMINDER_DISMISSED_KEY = 'backup-reminder-dismissed';

interface BackupReminderProviderProps {
  children: React.ReactNode;
}

export function BackupReminderProvider({ children }: BackupReminderProviderProps) {
  const [showReminder, setShowReminder] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [daysSince, setDaysSince] = useState(-1);

  useEffect(() => {
    seedDatabaseIfEmpty();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem(REMINDER_DISMISSED_KEY);
      if (dismissed) return;

      if (shouldShowBackupReminder()) {
        const info = getLastBackupInfo();
        setDaysSince(info.daysSince);
        setShowReminder(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `construction-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      markBackupComplete();
      setShowReminder(false);
      toast.success('Backup exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export backup');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRemindLater = () => {
    // Remember dismissal for this session
    sessionStorage.setItem(REMINDER_DISMISSED_KEY, 'true');
    setShowReminder(false);
  };

  return (
    <>
      {children}
      <Dialog open={showReminder} onOpenChange={(open) => {
        if (!open) handleRemindLater();
        else setShowReminder(open);
      }}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <DialogTitle className="text-center">Backup Reminder</DialogTitle>
            <DialogDescription className="text-center">
              {daysSince === -1
                ? "You haven't backed up your data yet."
                : `It's been ${daysSince} days since your last backup.`}
              <br />
              Export your data to keep it safe.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button onClick={handleExport} disabled={isExporting} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export Now'}
            </Button>
            <Button
              variant="ghost"
              onClick={handleRemindLater}
              className="w-full text-zinc-500"
            >
              Remind Me Later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
