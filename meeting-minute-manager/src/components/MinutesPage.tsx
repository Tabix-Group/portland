"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useAuth } from "@/contexts/AuthContext"
import { useData } from "@/contexts/DataContext"
import type { Minute } from '@/types';
import {
  Plus,
  Search,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Check,
  ChevronDown,
  X,
  Tag,
  FolderOpen,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface MinutesPageProps {
  onCreateMinute: () => void
  onViewMinute: (id: string) => void
  onEditMinute: (minute: Minute) => void
}

const MinutesPage: React.FC<MinutesPageProps> = ({ onCreateMinute, onViewMinute, onEditMinute }) => {
  const { user } = useAuth()
  const { minutes, projects, users } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterProject, setFilterProject] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [filterTopicGroups, setFilterTopicGroups] = useState<string[]>([])
  const [tagSelectorOpen, setTagSelectorOpen] = useState(false)
  const [topicGroupSelectorOpen, setTopicGroupSelectorOpen] = useState(false)
  const [editMinute, setEditMinute] = useState<Minute | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Minute | null>(null);
  const [editStep, setEditStep] = useState<number>(1);
  const { updateMinute, deleteMinute } = useData();
  const { toast } = useToast();
  const [editTitle, setEditTitle] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>(editMinute?.status || 'draft');
  const [editDate, setEditDate] = useState<string>(editMinute ? editMinute.meetingDate?.slice(0, 10) : '');
  const [editProjectIds, setEditProjectIds] = useState<string[]>(editMinute?.projectIds || []);
  const [editTagIds, setEditTagIds] = useState<string[]>(editMinute?.tags?.map((t:any) => t.id) || []);
  const [editTopicGroupIds, setEditTopicGroupIds] = useState<string[]>(editMinute?.topicGroups?.map((g:any) => g.id) || []);
  const [editParticipantIds, setEditParticipantIds] = useState<string[]>(editMinute?.participantIds || []);

  // Helper function to safely get array
  const safeArray = (arr: any): any[] => (Array.isArray(arr) ? arr : [])

  // Get all unique tags from all minutes
  const allTags = useMemo(() => {
    const tagMap = new Map()
    safeArray(minutes).forEach((minute) => {
      safeArray(minute.tags).forEach((tag) => {
        if (tag && tag.id) tagMap.set(tag.id, tag)
      })
    })
    return Array.from(tagMap.values())
  }, [minutes])

  // Get all unique topic groups from all minutes
  const allTopicGroups = useMemo(() => {
    const topicGroupMap = new Map()
    safeArray(minutes).forEach((minute) => {
      safeArray(minute.topicGroups).forEach((group) => {
        if (group && group.id) topicGroupMap.set(group.id, group)
      })
    })
    return Array.from(topicGroupMap.values())
  }, [minutes])

  // Filter projects based on user access
  const userProjects = useMemo(() => {
    if (user?.role === "admin" || !user?.hasLimitedAccess) {
      return safeArray(projects)
    }
    return safeArray(projects).filter((project) => safeArray(user.projectIds).includes(project.id))
  }, [projects, user])

  // Filter minutes based on user permissions and project access, sorted by date (newest first)
  // All users can view all minutes; backend controla edición/borrado
  const userMinutes = useMemo(() => {
    const sortByDateDesc = (arr) => arr.slice().sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());
    if (user?.role === "admin") {
      return sortByDateDesc(safeArray(minutes));
    }
    // USER: show minutes created by user or where user is a participant
    return sortByDateDesc(
      safeArray(minutes)
        .filter((minute) =>
          minute.createdBy === user?.id || safeArray(minute.participantIds).includes(user?.id)
        )
    );
  }, [minutes, user])

  // Filter and search minutes
  const filteredMinutes = useMemo(() => {
    return safeArray(userMinutes).filter((minute) => {
      const matchesSearch = minute.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false
      const matchesProject = filterProject === "all" || safeArray(minute.projectIds).includes(filterProject)
      const matchesStatus = filterStatus === "all" || minute.status === filterStatus

      // Parse tags safely
      const tags = safeArray(minute.tags)

      // Parse topicGroups safely
      const topicGroups = safeArray(minute.topicGroups)

      const matchesTags = filterTags.length === 0 || filterTags.some((tagId) => tags.some((tag) => tag?.id === tagId))
      const matchesTopicGroups =
        filterTopicGroups.length === 0 ||
        filterTopicGroups.some((groupId) => topicGroups.some((group) => group?.id === groupId))

      return matchesSearch && matchesProject && matchesStatus && matchesTags && matchesTopicGroups
    })
  }, [userMinutes, searchTerm, filterProject, filterStatus, filterTags, filterTopicGroups])

  const handleTagToggle = (tagId: string) => {
    if (filterTags.includes(tagId)) {
      setFilterTags(filterTags.filter((id) => id !== tagId))
    } else {
      setFilterTags([...filterTags, tagId])
    }
  }

  const handleTopicGroupToggle = (groupId: string) => {
    if (filterTopicGroups.includes(groupId)) {
      setFilterTopicGroups(filterTopicGroups.filter((id) => id !== groupId))
    } else {
      setFilterTopicGroups([...filterTopicGroups, groupId])
    }
  }

  const removeTag = (tagId: string) => {
    setFilterTags(filterTags.filter((id) => id !== tagId))
  }

  const removeTopicGroup = (groupId: string) => {
    setFilterTopicGroups(filterTopicGroups.filter((id) => id !== groupId))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "published":
        return "Publicada"
      case "draft":
        return "Borrador"
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return CheckCircle
      case "draft":
        return Clock
      default:
        return AlertCircle
    }
  }

  // Estado local para edición de tareas reales
  const [editTasks, setEditTasks] = useState<any[]>([]);
  const handleEditMinute = (minute: Minute) => {
    setEditMinute(minute);
    setEditTitle(minute.title);
    setEditStep(1);
    setEditStatus(minute.status || 'draft');
    setEditDate(minute.meetingDate?.slice(0, 10) || '');
    setEditProjectIds(minute.projectIds || []);
    setEditTagIds(safeArray(minute.tags).map((t:any) => t.id));
    setEditTopicGroupIds(safeArray(minute.topicGroups).map((g:any) => g.id));
    setEditParticipantIds(minute.participantIds || []);
    // Cargar tareas reales asociadas a la minuta (si existen)
    fetch(`/api/minutes/${minute.id}/tasks`).then(r => r.json()).then(setEditTasks).catch(() => setEditTasks([]));
  };
  const handleDeleteMinute = (minute: Minute) => setShowDeleteConfirm(minute);

  const handleEditSave = async () => {
    if (!editMinute) return;
    const newTitle = editTitle;
    // Limpiar y validar tareas antes de enviar
    const cleanedTasks = editTasks
      .filter(t => t && typeof t.text === 'string' && t.text.trim() !== '')
      .map(t => ({
        ...t,
        assignedTo: t.assignedTo === 'none' ? '' : (typeof t.assignedTo === 'string' ? t.assignedTo : ''),
        groupId: t.groupId === 'none' ? '' : (typeof t.groupId === 'string' ? t.groupId : ''),
        completed: !!t.completed
      }));
    try {
      await updateMinute(editMinute.id, {
        // Minute scalar fields
        number: editMinute.number,
        title: newTitle,
        meetingDate: editDate,
        meetingTime: editMinute.meetingTime || '',
        nextMeetingDate: editMinute.nextMeetingDate || '',
        nextMeetingTime: editMinute.nextMeetingTime || '',
        nextMeetingNotes: editMinute.nextMeetingNotes || '',
        // Participant and JSON fields
        participantIds: editParticipantIds,
        // Persist participant objects from IDs
        participants: users.filter(u => editParticipantIds.includes(u.id)),
        occasionalParticipants: editMinute.occasionalParticipants || [],
        informedPersons: editMinute.informedPersons || [],
        // Persist updated topic groups
        topicGroups: allTopicGroups.filter(g => editTopicGroupIds.includes(g.id)),
        topicsDiscussed: editMinute.topicsDiscussed || [],
        decisions: editMinute.decisions || [],
        internalNotes: editMinute.internalNotes || '',
        // Persist updated tags
        tags: allTags.filter(tag => editTagIds.includes(tag.id)),
        files: editMinute.files || [],
        status: editStatus as 'draft' | 'published',
        projectIds: editProjectIds,
        externalMentions: editMinute.externalMentions || [],
        // Enviar tareas limpias (SQL) al backend
        tasks: cleanedTasks,
      });
      toast({ title: 'Minuta actualizada', description: 'La minuta fue actualizada correctamente.' });
      setEditMinute(null);
      setEditTasks([]);
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudo actualizar la minuta', variant: 'destructive' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!showDeleteConfirm) return;
    try {
      await deleteMinute(showDeleteConfirm.id);
      toast({ title: 'Minuta eliminada', description: 'La minuta fue eliminada.' });
      setShowDeleteConfirm(null);
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudo eliminar la minuta', variant: 'destructive' });
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
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color || "#6b7280" }} />
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
                  className="justify-between bg-transparent"
                >
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">
                      {filterTags.length === 0
                        ? "Etiquetas..."
                        : `${filterTags.length} etiqueta${filterTags.length > 1 ? "s" : ""}`}
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
                        <CommandItem key={tag.id} value={tag.name} onSelect={() => handleTagToggle(tag.id)}>
                          <Check
                            className={`mr-2 h-4 w-4 ${filterTags.includes(tag.id) ? "opacity-100" : "opacity-0"}`}
                          />
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
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
                  className="justify-between bg-transparent"
                >
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">
                      {filterTopicGroups.length === 0
                        ? "Agrupadores..."
                        : `${filterTopicGroups.length} grupo${filterTopicGroups.length > 1 ? "s" : ""}`}
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
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
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
                setSearchTerm("")
                setFilterProject("all")
                setFilterStatus("all")
                setFilterTags([])
                setFilterTopicGroups([])
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
                    {filterTags.map((tagId) => {
                      const tag = allTags.find((t) => t.id === tagId)
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
                      ) : null
                    })}
                  </div>
                </div>
              )}
              {filterTopicGroups.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Agrupadores seleccionados:</div>
                  <div className="flex flex-wrap gap-2">
                    {filterTopicGroups.map((groupId) => {
                      const group = allTopicGroups.find((g) => g.id === groupId)
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
                      ) : null
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
                const StatusIcon = getStatusIcon(minute.status)
                const relatedProjects = safeArray(minute.projectIds)
                  .map((id) => userProjects.find((p) => p.id === id))
                  .filter(Boolean)

                const participantCount =
                  safeArray(minute.participants).length + safeArray(minute.occasionalParticipants).length

                return (
                  <div
                    key={minute.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors group relative"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 cursor-pointer" onClick={() => onViewMinute(minute.id)}>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{minute.title}</h3>
                          <Badge className={getStatusColor(minute.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {getStatusLabel(minute.status)}
                          </Badge>
                          {relatedProjects.map((project) => (
                            <Badge
                              key={project.id}
                              className="text-white"
                              style={{ backgroundColor: project.color || "#6b7280" }}
                            >
                              {project.name}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{minute.meetingDate}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{participantCount} participantes</span>
                          </div>
                        </div>

                        {/* Topic Groups Display */}
                        {safeArray(minute.topicGroups).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {safeArray(minute.topicGroups).map((group) => (
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
                        {safeArray(minute.tags).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {safeArray(minute.tags).map((tag) => (
                              <Badge key={tag.id} className="text-xs text-white" style={{ backgroundColor: tag.color }}>
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Botones admin o creador de borrador: editar/borrar */}
                    {(user?.role === 'admin' || (minute.createdBy === user?.id && minute.status === 'draft')) && (
                      <div className="absolute top-4 right-4 flex gap-2 opacity-80 group-hover:opacity-100">
                        <Button size="sm" variant="outline" onClick={() => onEditMinute(minute)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteMinute(minute)}>
                          Borrar
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL DE EDICIÓN */}
      <Dialog open={!!editMinute} onOpenChange={v => !v && setEditMinute(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Minuta</DialogTitle>
          </DialogHeader>
          {/* Wizard Steps */}
          <ul className="flex justify-between mb-4">
            <li className={`flex-1 px-2 py-1 text-center rounded ${editStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1. Básicos</li>
            <li className={`flex-1 px-2 py-1 text-center rounded ${editStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2. Detalles</li>
            <li className={`flex-1 px-2 py-1 text-center rounded ${editStep === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>3. Tareas</li>
          </ul>

          {editStep === 1 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium">Título</label>
              <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full" />

              <label className="block text-sm font-medium">Estado</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="published">Publicada</SelectItem>
                </SelectContent>
              </Select>

              <label className="block text-sm font-medium">Fecha de reunión</label>
              <input
                type="date"
                className="w-full border rounded px-2 py-1"
                value={editDate}
                onChange={e => setEditDate(e.target.value)}
              />
            </div>
          )}

          {editStep === 2 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium">Proyecto(s)</label>
              <Select
                value={editProjectIds[0] || ''}
                onValueChange={v => setEditProjectIds([v])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {userProjects.map(project => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <label className="block text-sm font-medium">Etiquetas</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge
                    key={tag.id}
                    className={`cursor-pointer ${editTagIds.includes(tag.id) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    style={{ backgroundColor: editTagIds.includes(tag.id) ? tag.color : undefined }}
                    onClick={() => setEditTagIds(editTagIds.includes(tag.id) ? editTagIds.filter(id => id !== tag.id) : [...editTagIds, tag.id])}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>

              <label className="block text-sm font-medium">Agrupadores</label>
              <div className="flex flex-wrap gap-2">
                {allTopicGroups.map(group => (
                  <Badge
                    key={group.id}
                    className={`cursor-pointer ${editTopicGroupIds.includes(group.id) ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    style={{ backgroundColor: editTopicGroupIds.includes(group.id) ? group.color : undefined }}
                    onClick={() => setEditTopicGroupIds(editTopicGroupIds.includes(group.id) ? editTopicGroupIds.filter(id => id !== group.id) : [...editTopicGroupIds, group.id])}
                  >
                    {group.name}
                  </Badge>
                ))}
              </div>

              <label className="block text-sm font-medium">Participantes</label>
              <div className="flex flex-wrap gap-2">
                {users.map(u => (
                  <Badge
                    key={u.id}
                    className={`cursor-pointer ${editParticipantIds.includes(u.id) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setEditParticipantIds(editParticipantIds.includes(u.id) ? editParticipantIds.filter(id => id !== u.id) : [...editParticipantIds, u.id])}
                  >
                    {u.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {editStep === 3 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium">Tareas</label>
              <div className="space-y-2">
                {editTasks.map((task, idx) => {
                  // Normalizar valores para evitar undefined/null
                  // Usar 'none' para evitar value="" en SelectItem (Radix error)
                  const assignedTo = typeof task.assignedTo === 'string' && task.assignedTo !== '' ? task.assignedTo : 'none';
                  const groupId = typeof task.groupId === 'string' && task.groupId !== '' ? task.groupId : 'none';
                  return (
                    <div key={task.id || idx} className="flex items-center gap-2">
                      <Input
                        className="flex-1"
                        value={task.text || ''}
                        placeholder="Descripción de la tarea"
                        onChange={e => {
                          const newTasks = [...editTasks];
                          newTasks[idx] = { ...task, text: e.target.value };
                          setEditTasks(newTasks);
                        }}
                      />
                      <Select
                        value={assignedTo}
                        onValueChange={v => {
                          const newTasks = [...editTasks];
                          newTasks[idx] = { ...task, assignedTo: v === 'none' ? '' : v };
                          setEditTasks(newTasks);
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Asignado a" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin asignar</SelectItem>
                          {users.filter(u => typeof u.id === 'string' && u.id).map(u => (
                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {/* Grupo de tema para la tarea */}
                      <Select
                        value={groupId}
                        onValueChange={v => {
                          const newTasks = [...editTasks];
                          newTasks[idx] = { ...task, groupId: v === 'none' ? '' : v };
                          setEditTasks(newTasks);
                        }}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Agrupador" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin agrupador</SelectItem>
                          {allTopicGroups.filter(group => typeof group.id === 'string' && group.id).map(group => (
                            <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="destructive" onClick={() => setEditTasks(editTasks.filter((_, i) => i !== idx))}>Eliminar</Button>
                    </div>
                  );
                })}
                <Button size="sm" variant="outline" onClick={() => setEditTasks([
                  ...editTasks,
                  { text: '', assignedTo: 'none', completed: false, groupId: 'none' }
                ])}>Agregar tarea</Button>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between w-full">
            <div>
              {editStep > 1 ? (
                <Button variant="outline" onClick={() => setEditStep(editStep - 1)}>Anterior</Button>
              ) : (
                <Button variant="outline" onClick={() => setEditMinute(null)}>Cancelar</Button>
              )}
            </div>
            <div>
              {editStep < 3 ? (
                <Button onClick={() => setEditStep(editStep + 1)}>Siguiente</Button>
              ) : (
                <Button onClick={handleEditSave}>Guardar</Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE CONFIRMACIÓN DE BORRADO */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={v => !v && setShowDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar minuta?</DialogTitle>
          </DialogHeader>
          <p>¿Estás seguro que deseas eliminar la minuta "{showDeleteConfirm?.title}"? Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MinutesPage
