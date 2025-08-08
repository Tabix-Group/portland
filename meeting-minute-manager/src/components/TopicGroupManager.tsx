import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, X, FolderOpen, Target, CheckSquare, Edit, Save } from 'lucide-react';
import { TopicGroup, MinuteItem, Task, User, Project, GlobalTopicGroup } from '@/types';
import { useData } from '@/contexts/DataContext';
import MentionTextInput from './MentionTextInput';

const TOPIC_GROUP_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', 
  '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'
];

interface TopicGroupManagerProps {
  topicGroups: TopicGroup[];
  onTopicGroupsChange: (groups: TopicGroup[]) => void;
  users: User[];
  projects: Project[];
}

const TopicGroupManager: React.FC<TopicGroupManagerProps> = ({
  topicGroups,
  onTopicGroupsChange,
  users,
  projects
}) => {
  const { globalTopicGroups, addGlobalTopicGroup } = useData();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupColor, setNewGroupColor] = useState(TOPIC_GROUP_COLORS[0]);
  // Estado para controlar los agrupadores abiertos
  const [expandedGroups, setExpandedGroups] = useState<string[]>(topicGroups.map(g => g.id));

  const createTopicGroupFromGlobal = (globalGroup: GlobalTopicGroup) => {
    const newId = `tg-${Date.now()}`;
    const newGroup: TopicGroup = {
      id: newId,
      name: globalGroup.name,
      color: globalGroup.color,
      description: globalGroup.description,
      topicsDiscussed: [{ id: `td-${Date.now()}`, text: '', mentions: [], projectIds: [] }],
      decisions: [{ id: `d-${Date.now()}`, text: '', mentions: [], projectIds: [] }],
      pendingTasks: [{ id: `pt-${Date.now()}`, text: '', assignedTo: '', dueDate: '', completed: false, mentions: [], projectIds: [] }]
    };
    onTopicGroupsChange([...topicGroups, newGroup]);
    setExpandedGroups(prev => [...prev, newId]);
  };

  const createCustomTopicGroup = () => {
    if (newGroupName.trim()) {
      // Crear en agrupadores globales primero
      const globalGroup = {
        name: newGroupName.trim(),
        color: newGroupColor,
        description: newGroupDescription.trim(),
        isActive: true
      };
      addGlobalTopicGroup(globalGroup);

      // Crear en la minuta actual
      const newId = `tg-${Date.now()}`;
      const newGroup: TopicGroup = {
        id: newId,
        name: newGroupName.trim(),
        color: newGroupColor,
        description: newGroupDescription.trim(),
        topicsDiscussed: [{ id: `td-${Date.now()}`, text: '', mentions: [], projectIds: [] }],
        decisions: [{ id: `d-${Date.now()}`, text: '', mentions: [], projectIds: [] }],
        pendingTasks: [{ id: `pt-${Date.now()}`, text: '', assignedTo: '', dueDate: '', completed: false, mentions: [], projectIds: [] }]
      };
      onTopicGroupsChange([...topicGroups, newGroup]);
      setExpandedGroups(prev => [...prev, newId]);
      setNewGroupName('');
      setNewGroupDescription('');
      setNewGroupColor(TOPIC_GROUP_COLORS[0]);
      setShowCreateGroup(false);
    }
  };

  const removeTopicGroup = (groupId: string) => {
    onTopicGroupsChange(topicGroups.filter(group => group.id !== groupId));
  };

  const updateTopicGroup = (groupId: string, updates: Partial<TopicGroup>) => {
    onTopicGroupsChange((Array.isArray(topicGroups) ? topicGroups : []).map(group => 
      group.id === groupId ? { ...group, ...updates } : group
    ));
  };

  const addItemToSection = (groupId: string, section: 'topicsDiscussed' | 'decisions' | 'pendingTasks') => {
    const group = topicGroups.find(g => g.id === groupId);
    if (!group) return;

    let newItem;
    if (section === 'pendingTasks') {
      newItem = {
        id: `${section}-${Date.now()}`,
        text: '',
        assignedTo: '',
        dueDate: '',
        completed: false,
        mentions: [],
        projectIds: []
      };
      newItem.groupId = groupId; // <-- Asignar groupId
    } else {
      newItem = {
        id: `${section}-${Date.now()}`,
        text: '',
        mentions: [],
        projectIds: []
      };
    }

    updateTopicGroup(groupId, {
      [section]: [...group[section], newItem]
    });
  };

  const updateSectionItem = (groupId: string, section: 'topicsDiscussed' | 'decisions' | 'pendingTasks', itemId: string, updates: any) => {
    const group = topicGroups.find(g => g.id === groupId);
    if (!group) return;

    const updatedItems = (Array.isArray(group[section]) ? group[section] : []).map((item: any) =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    updateTopicGroup(groupId, { [section]: updatedItems });
  };

  const removeSectionItem = (groupId: string, section: 'topicsDiscussed' | 'decisions' | 'pendingTasks', itemId: string) => {
    const group = topicGroups.find(g => g.id === groupId);
    if (!group) return;

    const filteredItems = group[section].filter((item: any) => item.id !== itemId);
    updateTopicGroup(groupId, { [section]: filteredItems });
  };

  const availableGlobalGroups = globalTopicGroups.filter(global => 
    global.isActive && !topicGroups.some(existing => existing.name === global.name)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FolderOpen className="h-5 w-5 text-blue-600" />
          <Label className="text-lg font-medium">Agrupadores de Contenido</Label>
        </div>
        <div className="flex space-x-2">
          {Array.isArray(availableGlobalGroups) && availableGlobalGroups.length > 0 && (
            <Select onValueChange={(value) => {
              const globalGroup = globalTopicGroups.find(g => g.id === value);
              if (globalGroup) createTopicGroupFromGlobal(globalGroup);
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Agregar agrupador existente" />
              </SelectTrigger>
              <SelectContent>
                {(Array.isArray(availableGlobalGroups) ? availableGlobalGroups : []).map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <span>{group.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCreateGroup(!showCreateGroup)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Crear nuevo
          </Button>
        </div>
      </div>

      {showCreateGroup && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Nuevo Agrupador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm">Nombre *</Label>
              <Input
                placeholder="Ej: DESARROLLO, PRESUPUESTO..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <Label className="text-sm">Descripción</Label>
              <Input
                placeholder="Descripción del agrupador"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Color:</Label>
              <div className="flex space-x-2">
                {(Array.isArray(TOPIC_GROUP_COLORS) ? TOPIC_GROUP_COLORS : []).map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded border-2 ${
                      newGroupColor === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewGroupColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button type="button" size="sm" onClick={createCustomTopicGroup}>
                <Save className="h-4 w-4 mr-1" />
                Crear y Agregar
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCreateGroup(false)}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(Array.isArray(topicGroups) ? topicGroups : []).length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <FolderOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No hay agrupadores agregados</p>
          <p className="text-sm">Selecciona uno existente o crea uno nuevo</p>
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-2" value={expandedGroups} onValueChange={setExpandedGroups}>
          {(Array.isArray(topicGroups) ? topicGroups : []).map((group) => (
            <AccordionItem key={group.id} value={group.id} className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center space-x-3">
                  <Badge
                    className="text-white"
                    style={{ backgroundColor: group.color }}
                  >
                    <FolderOpen className="h-3 w-3 mr-1" />
                    {group.name}
                  </Badge>
                  {group.description && (
                    <span className="text-sm text-gray-500">{group.description}</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  {/* Temas Tratados */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="flex items-center text-sm font-medium">
                        <Target className="h-4 w-4 mr-1" />
                        Temas Tratados
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addItemToSection(group.id, 'topicsDiscussed')}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(Array.isArray(group.topicsDiscussed) ? group.topicsDiscussed : []).map((topic, idx, arr) => (
                        <div key={topic.id} className="flex gap-2 items-center">
                          <div className="flex-grow">
                            <MentionTextInput
                              value={topic.text}
                              onChange={(text, mentions, projectIds) => 
                                updateSectionItem(group.id, 'topicsDiscussed', topic.id, { text, mentions, projectIds })
                              }
                              users={users}
                              projects={projects}
                              mentions={topic.mentions || []}
                              projectIds={topic.projectIds || []}
                              placeholder="Describe el tema tratado..."
                              autoFocus={idx === arr.length - 1 && topic.text === ''}
                              onKeyPress={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  if (topic.text.trim() !== '') {
                                    addItemToSection(group.id, 'topicsDiscussed');
                                  }
                                }
                              }}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSectionItem(group.id, 'topicsDiscussed', topic.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Decisiones */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="flex items-center text-sm font-medium">
                        <CheckSquare className="h-4 w-4 mr-1" />
                        Decisiones
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addItemToSection(group.id, 'decisions')}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(Array.isArray(group.decisions) ? group.decisions : []).map((decision, idx, arr) => (
                        <div key={decision.id} className="flex gap-2 items-center">
                          <div className="flex-grow">
                            <MentionTextInput
                              value={decision.text}
                              onChange={(text, mentions, projectIds) => 
                                updateSectionItem(group.id, 'decisions', decision.id, { text, mentions, projectIds })
                              }
                              users={users}
                              projects={projects}
                              mentions={decision.mentions || []}
                              projectIds={decision.projectIds || []}
                              placeholder="Describe la decisión tomada..."
                              autoFocus={idx === arr.length - 1 && decision.text === ''}
                              onKeyPress={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  if (decision.text.trim() !== '') {
                                    addItemToSection(group.id, 'decisions');
                                  }
                                }
                              }}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSectionItem(group.id, 'decisions', decision.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tareas Pendientes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="flex items-center text-sm font-medium">
                        <CheckSquare className="h-4 w-4 mr-1" />
                        Tareas Pendientes
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addItemToSection(group.id, 'pendingTasks')}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {(Array.isArray(group.pendingTasks) ? group.pendingTasks : []).map((task) => (
                        <div key={task.id} className="space-y-2 p-3 border rounded bg-gray-50">
                          <div className="flex gap-2 items-center">
                            <div className="flex-grow">
                              <MentionTextInput
                                value={task.text}
                                onChange={(text, mentions, projectIds) => 
                                  updateSectionItem(group.id, 'pendingTasks', task.id, { text, mentions, projectIds })
                                }
                                users={users}
                                projects={projects}
                                mentions={task.mentions || []}
                                projectIds={task.projectIds || []}
                                placeholder="Describe la tarea..."
                                onKeyPress={e => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (task.text.trim() !== '') {
                                      addItemToSection(group.id, 'pendingTasks');
                                    }
                                  }
                                }}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSectionItem(group.id, 'pendingTasks', task.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Asignado a:</Label>
                              <Select
                                value={task.assignedTo}
                                onValueChange={(value) => 
                                  updateSectionItem(group.id, 'pendingTasks', task.id, { assignedTo: value })
                                }
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {(Array.isArray(users) ? users : []).map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                      {user.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Fecha límite:</Label>
                              <Input
                                type="date"
                                className="h-8"
                                value={task.dueDate}
                                onChange={(e) => 
                                  updateSectionItem(group.id, 'pendingTasks', task.id, { dueDate: e.target.value })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTopicGroup(group.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remover agrupador
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default TopicGroupManager;
