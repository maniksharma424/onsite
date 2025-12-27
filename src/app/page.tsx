'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getAllProjectsWithTotals } from '@/lib/db';
import { Header } from '@/components/layout/Header';
import { PageContainer } from '@/components/layout/PageContainer';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { FAB } from '@/components/ui/fab';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2 } from 'lucide-react';
import type { Project, ProjectStatus } from '@/lib/types';
import { getSettings } from '@/lib/settings';

type FilterStatus = 'all' | ProjectStatus;

export default function ProjectsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    setShowArchived(getSettings().showArchived);
  }, []);

  const projects = useLiveQuery(
    () => getAllProjectsWithTotals(showArchived),
    [showArchived]
  );

  const filteredProjects = projects?.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleArchive = async (project: Project) => {
    await db.projects.update(project.id, {
      isArchived: !project.isArchived,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  return (
    <>
      <Header title="Projects" />
      <PageContainer>
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as FilterStatus)}
          className="mt-4"
        >
          <TabsList className="w-full grid grid-cols-4 h-9">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="in_progress" className="text-xs">Active</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">Done</TabsTrigger>
            <TabsTrigger value="on_hold" className="text-xs">Hold</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4 space-y-3 animate-stagger">
          {filteredProjects?.length === 0 && (
            <EmptyState
              icon={Building2}
              title="No projects yet"
              description="Create your first project to start tracking payments"
            />
          )}
          {filteredProjects?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => handleEdit(project)}
              onArchive={() => handleArchive(project)}
            />
          ))}
        </div>
      </PageContainer>

      <FAB onClick={() => setShowForm(true)} />

      <ProjectForm
        open={showForm}
        onClose={handleCloseForm}
        project={editingProject}
      />
    </>
  );
}
