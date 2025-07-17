
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useData } from '@/contexts/DataContext';
import { Search, X, Plus } from 'lucide-react';
import { User } from '@/types';

interface ProjectSelectorProps {
  user: User;
  onUpdateUser: (updates: Partial<User>) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ user, onUpdateUser }) => {
  const { projects } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProjectToggle = (projectId: string, isAssigned: boolean) => {
    const updatedProjectIds = isAssigned
      ? user.projectIds.filter(id => id !== projectId)
      : [...user.projectIds, projectId];
    
    onUpdateUser({ projectIds: updatedProjectIds });
  };

  const handleAccessToggle = (hasLimitedAccess: boolean) => {
    onUpdateUser({ hasLimitedAccess });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asignación de Proyectos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Access Control Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Acceso Limitado</Label>
            <p className="text-xs text-gray-600">
              {user.hasLimitedAccess 
                ? 'Solo puede ver proyectos asignados' 
                : 'Puede ver todos los proyectos'
              }
            </p>
          </div>
          <Switch
            checked={user.hasLimitedAccess || false}
            onCheckedChange={handleAccessToggle}
          />
        </div>

        {/* Project Search */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Current Assignments */}
          {Array.isArray(user.projectIds) && user.projectIds.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Proyectos Asignados ({user.projectIds.length})</Label>
              <div className="flex flex-wrap gap-2">
                {user.projectIds.map(projectId => {
                  const project = projects.find(p => p.id === projectId);
                  if (!project) return null;
                  return (
                    <Badge 
                      key={projectId} 
                      variant="secondary" 
                      className="flex items-center gap-1"
                      style={{ 
                        borderColor: project.color || '#22c55e', 
                        backgroundColor: `${project.color || '#22c55e'}20` 
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: project.color || '#22c55e' }}
                      />
                      {project.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleProjectToggle(projectId, true)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Available Projects */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Proyectos Disponibles</Label>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredProjects
              .filter(project => !user.projectIds.includes(project.id))
              .map(project => (
                <div 
                  key={project.id} 
                  className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: project.color || '#22c55e' }}
                    />
                    <div>
                      <p className="text-sm font-medium">{project.name}</p>
                      {project.description && (
                        <p className="text-xs text-gray-600">{project.description}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleProjectToggle(project.id, false)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Asignar
                  </Button>
                </div>
              ))}
          </div>
          
          {filteredProjects.filter(project => !user.projectIds.includes(project.id)).length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              {searchTerm ? 'No se encontraron proyectos' : 'Todos los proyectos están asignados'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectSelector;
