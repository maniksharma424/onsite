'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  exportAllData,
  importData,
  clearAllData,
} from '@/lib/db';
import {
  getSettings,
  saveSettings,
  markBackupComplete,
  getLastBackupInfo,
} from '@/lib/settings';
import { toast } from 'sonner';
import {
  Download,
  Upload,
  Eye,
  EyeOff,
  Trash2,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function SettingsPage() {
  const [showArchived, setShowArchived] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastBackup, setLastBackup] = useState<{ date: Date | null; daysSince: number }>({
    date: null,
    daysSince: -1,
  });

  useEffect(() => {
    const settings = getSettings();
    setShowArchived(settings.showArchived);
    setLastBackup(getLastBackupInfo());
  }, []);

  const handleToggleArchived = () => {
    const newValue = !showArchived;
    setShowArchived(newValue);
    saveSettings({ showArchived: newValue });
    toast.success(newValue ? 'Showing archived items' : 'Hiding archived items');
  };

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
      a.download = `construction-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      markBackupComplete();
      setLastBackup(getLastBackupInfo());
      toast.success('Backup exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export backup');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text);

        // Validate structure
        if (!data.data?.projects || !data.data?.vendors || !data.data?.payments) {
          throw new Error('Invalid backup file structure');
        }

        await importData(data, true);
        toast.success('Data restored successfully!');
        window.location.reload();
      } catch (error) {
        console.error('Import failed:', error);
        toast.error('Failed to import backup. Invalid file format.');
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  const handleClearData = async () => {
    try {
      await clearAllData();
      setShowClearDialog(false);
      toast.success('All data cleared');
      window.location.reload();
    } catch (error) {
      console.error('Clear failed:', error);
      toast.error('Failed to clear data');
    }
  };

  return (
    <>
      <Header title="Settings" showBack />
      <PageContainer>
        {/* Data Section */}
        <div className="mt-4">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
            Data
          </h2>
          <Card className="divide-y">
            {/* Export */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                  <Download className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-zinc-900">Export Backup</p>
                  <p className="text-xs text-zinc-500">
                    {lastBackup.date
                      ? `Last backup: ${format(lastBackup.date, 'dd MMM yyyy')}`
                      : 'No backup yet'}
                  </p>
                </div>
              </div>
              {lastBackup.daysSince >= 7 && (
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {lastBackup.daysSince}d ago
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-zinc-300" />
            </button>

            {/* Import */}
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-zinc-900">Import Backup</p>
                  <p className="text-xs text-zinc-500">Restore from JSON file</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-300" />
            </button>

            {/* Show Archived */}
            <button
              onClick={handleToggleArchived}
              className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center">
                  {showArchived ? (
                    <Eye className="w-4 h-4 text-zinc-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-zinc-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-zinc-900">Show Archived</p>
                  <p className="text-xs text-zinc-500">
                    {showArchived ? 'Archived items visible' : 'Archived items hidden'}
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  'w-10 h-6 rounded-full transition-colors flex items-center px-0.5',
                  showArchived ? 'bg-zinc-900' : 'bg-zinc-200'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full bg-white shadow transition-transform',
                    showArchived && 'translate-x-4'
                  )}
                />
              </div>
            </button>
          </Card>
        </div>

        {/* Danger Zone */}
        <div className="mt-6">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
            Danger Zone
          </h2>
          <Card>
            <button
              onClick={() => setShowClearDialog(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-600">Clear All Data</p>
                  <p className="text-xs text-zinc-500">
                    Permanently delete everything
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-300" />
            </button>
          </Card>
        </div>

        {/* About */}
        <div className="mt-6">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
            About
          </h2>
          <Card className="p-4">
            <p className="text-sm text-zinc-600">
              Construction Management v1.0.0
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Your data is stored locally on this device
            </p>
          </Card>
        </div>
      </PageContainer>

      {/* Clear Data Confirmation */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Clear All Data?</DialogTitle>
            <DialogDescription>
              This will permanently delete all projects, vendors, and payments.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              variant="destructive"
              onClick={handleClearData}
              className="w-full"
            >
              Yes, Clear Everything
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowClearDialog(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

