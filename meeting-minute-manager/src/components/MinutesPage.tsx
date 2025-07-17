import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Plus, Search, Calendar, Users, CheckCircle, Clock, AlertCircle, Check, ChevronDown, X, Tag, FolderOpen } from 'lucide-react';

interface MinutesPageProps {
  onCreateMinute: () => void;
  onViewMinute: (id: string) => void;
}

const MinutesPage: React.FC<MinutesPageProps> = ({ onCreateMinute, onViewMinute }) => {
  const { user } = useAuth();
  const { minutes, projects, users } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterTopicGroups, setFilterTopicGroups] = useState<string[]>([]);
  const [tagSelectorOpen, setTagSelectorOpen] = useState(false);
  const [topicGroupSelectorOpen, setTopicGroupSelectorOpen] = useState(false);

  // Get all unique tags from all minutes
  const allTags = useMemo(() => {
    const tagMap = new Map();
    minutes.forEach(minute => {
      (Array.isArray(minute.tags) ? minute.tags : []).forEach(tag => {
        tagMap.set(tag.id, tag);
      });
    });
    return Array.from(tagMap.values());
  }, [minutes]);

  // Get all unique topic groups from all minutes
  const allTopicGroups = useMemo(() => {
    const topicGroupMap = new Map();
    minutes.forEach(minute => {
      (Array.isArray(minute.topicGroups) ? minute.topicGroups : []).forEach(group => {
        topicGroupMap.set(group.id, group);
      });
    });
    return Array.from(topicGroupMap.values());
  }, [minutes]);

  // Filter projects based on user access
  const userProjects = useMemo(() => {
    if (user?.role === 'admin' || !user?.hasLimitedAccess) {
      return projects;
    }
    return projects.filter(project => user.projectIds.includes(project.id));
  }, [projects, user]);

  // Filter minutes based on user permissions and project access, sorted by date (newest first)
  const userMinutes = useMemo(() => {
    return minutes
      .filter(minute => {
        // Admin can see all minutes
        if (user?.role === 'admin') return true;
        
        // Users with limited access can only see minutes from their assigned projects
        if (user?.hasLimitedAccess && minute.projectIds && minute.projectIds.length > 0) {
          return minute.projectIds.some(projectId => user.projectIds.includes(projectId));
        }
        
        // Regular users can see minutes they participate in
        return minute.participantIds.includes(user?.id || '');
      })
      .sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());
  }, [minutes, user]);

  // Filter and search minutes
  const filteredMinutes = useMemo(() => {
    return userMinutes.filter(minute => {
      const matchesSearch = minute.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = filterProject === 'all' || (minute.projectIds && minute.projectIds.includes(filterProject));
      const matchesStatus = filterStatus === 'all' || minute.status === filterStatus;
      // Parse tags
      let tags = [];
      if (Array.isArray(minute.tags)) {
        tags = minute.tags;
      } else if (typeof minute.tags === 'string') {
        try { tags = JSON.parse(minute.tags); } catch { tags = []; }
      } else if (typeof minute.tags === 'object' && minute.tags !== null) {
        tags = Object.values(minute.tags);
      }
      // Parse topicGroups
      let topicGroups = [];
      if (Array.isArray(minute.topicGroups)) {
        topicGroups = minute.topicGroups;
      } else if (typeof minute.topicGroups === 'string') {
        try { topicGroups = JSON.parse(minute.topicGroups); } catch { topicGroups = []; }
      } else if (typeof minute.topicGroups === 'object' && minute.topicGroups !== null) {
        topicGroups = Object.values(minute.topicGroups);
      }
      const matchesTags = filterTags.length === 0 || filterTags.some(tagId => tags.some(tag => tag.id === tagId));
      const matchesTopicGroups = filterTopicGroups.length === 0 || filterTopicGroups.some(groupId => topicGroups.some(group => group.id === groupId));
      return matchesSearch && matchesProject && matchesStatus && matchesTags && matchesTopicGroups;
    });
  }, [userMinutes, searchTerm, filterProject, filterStatus, filterTags, filterTopicGroups]);

  const handleTagToggle = (tagId: string) => {
    if (filterTags.includes(tagId)) {
      setFilterTags(filterTags.filter(id => id !== tagId));
    } else {
      setFilterTags([...filterTags, tagId]);
    }
  };

  const handleTopicGroupToggle = (groupId: string) => {
    if (filterTopicGroups.includes(groupId)) {
      setFilterTopicGroups(filterTopicGroups.filter(id => id !== groupId));
    } else {
      setFilterTopicGroups([...filterTopicGroups, groupId]);
    }
  };

  const removeTag = (tagId: string) => {
    setFilterTags(filterTags.filter(id => id !== tagId));
  };

  const removeTopicGroup = (groupId: string) => {
    setFilterTopicGroups(filterTopicGroups.filter(id => id !== groupId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publicada';
      case 'draft': return 'Borrador';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return CheckCircle;
      case 'draft': return Clock;
      default: return AlertCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Minutas</h2>
          <p className="text-gray-600">Gestión de minutas de reuniones</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={onCreateMinute} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nueva Minuta</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar minutas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por proyecto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proyectos</SelectItem>
                {userProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: project.color || '#6b7280' }}
                      />
                      <span>{project.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="published">Publicada</SelectItem>
              </SelectContent>
            </Select>

            <Popover open={tagSelectorOpen} onOpenChange={setTagSelectorOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={tagSelectorOpen}
                  className="justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">
                      {filterTags.length === 0 
                        ? "Etiquetas..." 
                        : `${filterTags.length} etiqueta${filterTags.length > 1 ? 's' : ''}`
                      }
                    </span>
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar etiquetas..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron etiquetas.</CommandEmpty>
                    <CommandGroup>
                      {allTags.map((tag) => (
                        <CommandItem
                          key={tag.id}
                          value={tag.name}
                          onSelect={() => handleTagToggle(tag.id)}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              filterTags.includes(tag.id) ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span>{tag.name}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Popover open={topicGroupSelectorOpen} onOpenChange={setTopicGroupSelectorOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={topicGroupSelectorOpen}
                  className="justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">
                      {filterTopicGroups.length === 0 
                        ? "Agrupadores..." 
                        : `${filterTopicGroups.length} grupo${filterTopicGroups.length > 1 ? 's' : ''}`
                      }
                    </span>
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar agrupadores..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron agrupadores.</CommandEmpty>
                    <CommandGroup>
                      {allTopicGroups.map((group) => (
                        <CommandItem
                          key={group.id}
                          value={group.name}
                          onSelect={() => handleTopicGroupToggle(group.id)}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              filterTopicGroups.includes(group.id) ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: group.color }}
                            />
                            <span>{group.name}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterProject('all');
                setFilterStatus('all');
                setFilterTags([]);
                setFilterTopicGroups([]);
              }}
            >
              Limpiar filtros
            </Button>
          </div>

          {/* Selected Filters Display */}
          {(filterTags.length > 0 || filterTopicGroups.length > 0) && (
            <div className="mt-4 space-y-2">
              {filterTags.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Etiquetas seleccionadas:</div>
                  <div className="flex flex-wrap gap-2">
                    {filterTags.map(tagId => {
                      const tag = allTags.find(t => t.id === tagId);
                      return tag ? (
                        <Badge
                          key={tag.id}
                          className="flex items-center gap-1 text-white"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-black/20 text-white"
                            onClick={() => removeTag(tag.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              {filterTopicGroups.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Agrupadores seleccionados:</div>
                  <div className="flex flex-wrap gap-2">
                    {filterTopicGroups.map(groupId => {
                      const group = allTopicGroups.find(g => g.id === groupId);
                      return group ? (
                        <Badge
                          key={group.id}
                          className="flex items-center gap-1 text-white"
                          style={{ backgroundColor: group.color }}
                        >
                          {group.name}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-black/20 text-white"
                            onClick={() => removeTopicGroup(group.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Minutes List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Minutas</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMinutes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron minutas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMinutes.map((minute) => {
                const StatusIcon = getStatusIcon(minute.status);
                const relatedProjects = minute.projectIds ? userProjects.filter(p => minute.projectIds!.includes(p.id)) : [];
                return (
                  <div
                    key={minute.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onViewMinute(minute.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{minute.title}</h3>
                          <Badge className={getStatusColor(minute.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {getStatusLabel(minute.status)}
                          </Badge>
                          {relatedProjects.map(project => (
                            <Badge 
                              key={project.id} 
                              className="text-white"
                              style={{ backgroundColor: project.color || '#6b7280' }}
                            >
                              {project.name}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(minute.meetingDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                        <span>{Array.isArray(minute.participants) ? minute.participants.length : 0} participantes</span>
                          </div>
                        </div>
                        
                        {/* Topic Groups Display */}
                        {Array.isArray(minute.topicGroups) && minute.topicGroups.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {minute.topicGroups.map(group => (
                              <Badge
                                key={group.id}
                                className="text-xs text-white"
                                style={{ backgroundColor: group.color }}
                              >
                                <FolderOpen className="h-3 w-3 mr-1" />
                                {group.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {/* Tags Display */}
                        {Array.isArray(minute.tags) && minute.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {minute.tags.map(tag => (
                              <Badge
                                key={tag.id}
                                className="text-xs text-white"
                                style={{ backgroundColor: tag.color }}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MinutesPage;
