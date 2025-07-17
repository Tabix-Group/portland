
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Project } from '@/types';
import { Check, ChevronDown, X, Search } from 'lucide-react';

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectIds: string[];
  onProjectsChange: (projectIds: string[]) => void;
  label?: string;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  selectedProjectIds,
  onProjectsChange,
  label = "Proyectos relacionados"
}) => {
  const [open, setOpen] = useState(false);

  const handleProjectToggle = (projectId: string) => {
    if (selectedProjectIds.includes(projectId)) {
      onProjectsChange(selectedProjectIds.filter(id => id !== projectId));
    } else {
      onProjectsChange([...selectedProjectIds, projectId]);
    }
  };

  const removeProject = (projectId: string) => {
    onProjectsChange(selectedProjectIds.filter(id => id !== projectId));
  };

  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeSelectedProjectIds = Array.isArray(selectedProjectIds) ? selectedProjectIds : [];
  const selectedProjects = safeProjects.filter(p => safeSelectedProjectIds.includes(p.id));

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">
                {safeSelectedProjectIds.length === 0
                  ? "Seleccionar proyectos..."
                  : `${safeSelectedProjectIds.length} proyecto${safeSelectedProjectIds.length > 1 ? 's' : ''} seleccionado${safeSelectedProjectIds.length > 1 ? 's' : ''}`
                }
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar proyectos..." />
            <CommandList>
              <CommandEmpty>No se encontraron proyectos.</CommandEmpty>
              <CommandGroup>
                {safeProjects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={project.name}
                    onSelect={() => handleProjectToggle(project.id)}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        safeSelectedProjectIds.includes(project.id) ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <div className="flex items-center flex-1">
                      <div
                        className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                        style={{ backgroundColor: project.color || '#22c55e' }}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{project.name}</div>
                        {project.description && (
                          <div className="text-xs text-gray-500">{project.description}</div>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="mb-2">
        <Label className="text-sm font-medium">Proyectos asignados</Label>
        <div className="text-xs text-gray-500 mb-1">
          {safeSelectedProjectIds.length === 0
            ? 'Ningún proyecto seleccionado'
            : `${safeSelectedProjectIds.length} proyecto${safeSelectedProjectIds.length > 1 ? 's' : ''} seleccionado${safeSelectedProjectIds.length > 1 ? 's' : ''}`}
        </div>
        <div className="flex flex-wrap gap-2">
          {safeProjects.map((project) => (
            <Badge key={project.id} className="bg-gray-200 text-gray-800">
              {project.name}
            </Badge>
          ))}
        </div>
      </div>
      {(Array.isArray(selectedProjects) ? selectedProjects.length : 0) > 0 && (
        <div className="mt-2">
          <Label className="text-sm font-medium">Proyectos seleccionados</Label>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(selectedProjects) ? selectedProjects : []).map(project => (
              <Badge key={project.id} className="bg-blue-200 text-blue-800">
                {project.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectSelector;
