'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/settings';
import { PROJECT_STATUS_CONFIG } from '@/lib/types';
import type { Project } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ProjectWithTotals extends Project {
  totalIncoming: number;
  totalOutgoing: number;
  balance: number;
}

interface ProjectCardProps {
  project: ProjectWithTotals;
  onEdit: () => void;
  onArchive: () => void;
}

export function ProjectCard({ project, onEdit, onArchive }: ProjectCardProps) {
  const statusConfig = PROJECT_STATUS_CONFIG[project.status];

  return (
    <Link href={`/project/${project.id}`}>
      <Card
        className={cn(
          'p-4 touch-feedback cursor-pointer transition-all duration-200 hover:shadow-md',
          project.isArchived && 'opacity-60'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <h3 className="font-medium text-zinc-900 truncate">{project.name}</h3>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className={cn('text-xs', statusConfig.color)}>
                {statusConfig.label}
              </Badge>
              {project.location && (
                <span className="text-xs text-zinc-500 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3" />
                  {project.location}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-zinc-500">IN: </span>
                <span className="text-green-600 font-medium">
                  {formatCurrency(project.totalIncoming)}
                </span>
              </div>
              <div>
                <span className="text-zinc-500">OUT: </span>
                <span className="text-red-600 font-medium">
                  {formatCurrency(project.totalOutgoing)}
                </span>
              </div>
              <div>
                <span className="text-zinc-500">BAL: </span>
                <span className={cn(
                  'font-medium',
                  project.balance >= 0 ? 'text-zinc-900' : 'text-red-600'
                )}>
                  {formatCurrency(project.balance)}
                </span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-300 flex-shrink-0" />
        </div>
      </Card>
    </Link>
  );
}

