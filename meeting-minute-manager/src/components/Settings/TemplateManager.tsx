import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useData } from '@/contexts/DataContext';
import { MinuteTemplate, TemplateTopicGroup } from '@/types';
import { Plus, Edit, Trash2, Save, X, Calendar, Target, Users, Briefcase, FolderOpen } from 'lucide-react';

const ICON_OPTIONS = [
  { name: 'Calendar', icon: Calendar },
  { name: 'Target', icon: Target },
  { name: 'Users', icon: Users },
  { name: 'Briefcase', icon: Briefcase }
];

const COLOR_OPTIONS = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-orange-100 text-orange-800',
  'bg-red-100 text-red-800',
  'bg-yellow-100 text-yellow-800'
];

const TOPIC_GROUP_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#22c55e', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#84cc16'  // Lime
];

const TemplateManager: React.FC = () => {
  const { templates, projects, addTemplate, updateTemplate, deleteTemplate } = useData();
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<MinuteTemplate>>({
    name: '',
    description: '',
    icon: 'Calendar',
    color: 'bg-blue-100 text-blue-800',
    sections: {
      topicsDiscussed: [''],
      decisions: [''],
      pendingTasks: ['']
    },
    topicGroups: [],
    isCustom: true
  });

  const handleAddTemplate = () => {
    if (!newTemplate.name || !newTemplate.description || !newTemplate.icon || !newTemplate.color || !Array.isArray(newTemplate.topicGroups) || newTemplate.topicGroups.length === 0) {
      // Show error or return
      return;
    }
    const payload = {
      name: newTemplate.name,
      description: newTemplate.description,
      icon: newTemplate.icon,
      color: newTemplate.color,
      topicGroups: newTemplate.topicGroups.map(g => ({ name: g.name, color: g.color, description: g.description || "" })),
      sections: JSON.stringify(newTemplate.sections),
      isCustom: true
    };
    addTemplate(payload);
    setNewTemplate({
      name: '',
      description: '',
      icon: 'Calendar',
      color: 'bg-blue-100 text-blue-800',
      sections: {
        topicsDiscussed: [''],
        decisions: [''],
        pendingTasks: ['']
      },
      topicGroups: [],
      isCustom: true
    });
  }
  };

  const updateSection = (sectionType: keyof MinuteTemplate['sections'], index: number, value: string) => {
    setNewTemplate(prev => ({
      ...prev,
      sections: {
        ...prev.sections!,
        [sectionType]: prev.sections![sectionType].map((item, i) => i === index ? value : item)
      }
    }));
  };

  const addSectionItem = (sectionType: keyof MinuteTemplate['sections']) => {
    setNewTemplate(prev => ({
      ...prev,
      sections: {
        ...prev.sections!,
        [sectionType]: [...prev.sections![sectionType], '']
      }
    }));
  };

  const removeSectionItem = (sectionType: keyof MinuteTemplate['sections'], index: number) => {
    setNewTemplate(prev => ({
      ...prev,
      sections: {
        ...prev.sections!,
        [sectionType]: prev.sections![sectionType].filter((_, i) => i !== index)
      }
    }));
  };

  const addTopicGroup = () => {
    const newGroup: TemplateTopicGroup = {
      id: `tg-${Date.now()}`,
      name: '',
      color: TOPIC_GROUP_COLORS[0],
      description: ''
    };
    setNewTemplate(prev => ({
      ...prev,
      topicGroups: [...(prev.topicGroups || []), newGroup]
    }));
  };

  const updateTopicGroup = (index: number, field: keyof TemplateTopicGroup, value: string) => {
    setNewTemplate(prev => ({
      ...prev,
      topicGroups: prev.topicGroups?.map((group, i) => 
        i === index ? { ...group, [field]: value } : group
      ) || []
    }));
  };

  const removeTopicGroup = (index: number) => {
    setNewTemplate(prev => ({
      ...prev,
      topicGroups: prev.topicGroups?.filter((_, i) => i !== index) || []
    }));
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = ICON_OPTIONS.find(opt => opt.name === iconName);
    return iconOption ? iconOption.icon : Calendar;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Crear Nueva Plantilla</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="templateName">Nombre *</Label>
              <Input
                id="templateName"
                value={newTemplate.name || ''}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre de la plantilla"
              />
            </div>
            <div>
              <Label htmlFor="templateDescription">Descripción *</Label>
              <Input
                id="templateDescription"
                value={newTemplate.description || ''}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción de la plantilla"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Ícono</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {ICON_OPTIONS.map((iconOption) => {
                  const IconComponent = iconOption.icon;
                  return (
                    <button
                      key={iconOption.name}
                      type="button"
                      className={`p-2 rounded border-2 ${
                        newTemplate.icon === iconOption.name ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                      onClick={() => setNewTemplate(prev => ({ ...prev, icon: iconOption.name }))}
                    >
                      <IconComponent className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`px-3 py-1 rounded text-xs ${color} border-2 ${
                      newTemplate.color === color ? 'border-gray-800' : 'border-transparent'
                    }`}
                    onClick={() => setNewTemplate(prev => ({ ...prev, color }))}
                  >
                    Ejemplo
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Topic Groups Section */}
          <div className="mb-6">
            <Label className="text-base font-medium">Agrupadores de Temas</Label>
            <p className="text-sm text-gray-600 mb-3">Define agrupadores con colores para organizar temas, decisiones y tareas</p>
            {newTemplate.topicGroups && newTemplate.topicGroups.length > 0 && (
              <div className="space-y-3 mb-3">
                {newTemplate.topicGroups.map((group, index) => (
                  <div key={group.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                      <Input
                        placeholder="Nombre del agrupador"
                        value={group.name}
                        onChange={(e) => updateTopicGroup(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Descripción (opcional)"
                        value={group.description || ''}
                        onChange={(e) => updateTopicGroup(index, 'description', e.target.value)}
                      />
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm">Color:</Label>
                        <div className="flex space-x-1">
                          {TOPIC_GROUP_COLORS.map(color => (
                            <button
                              key={color}
                              type="button"
                              className={`w-6 h-6 rounded border-2 ${
                                group.color === color ? 'border-gray-800' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => updateTopicGroup(index, 'color', color)}
                            />
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTopicGroup(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {group.name && (
                      <Badge 
                        className="text-white"
                        style={{ backgroundColor: group.color }}
                      >
                        <FolderOpen className="h-3 w-3 mr-1" />
                        {group.name}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={addTopicGroup}
              className="mb-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Agrupador
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Temas a Tratar</Label>
              {newTemplate.sections?.topicsDiscussed.map((topic, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={topic}
                    onChange={(e) => updateSection('topicsDiscussed', index, e.target.value)}
                    placeholder="Tema a tratar"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSectionItem('topicsDiscussed', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSectionItem('topicsDiscussed')}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar tema
              </Button>
            </div>

            <div>
              <Label>Decisiones Típicas</Label>
              {newTemplate.sections?.decisions.map((decision, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={decision}
                    onChange={(e) => updateSection('decisions', index, e.target.value)}
                    placeholder="Decisión típica"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSectionItem('decisions', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSectionItem('decisions')}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar decisión
              </Button>
            </div>

            <div>
              <Label>Tareas Comunes</Label>
              {newTemplate.sections?.pendingTasks.map((task, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={task}
                    onChange={(e) => updateSection('pendingTasks', index, e.target.value)}
                    placeholder="Tarea común"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSectionItem('pendingTasks', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSectionItem('pendingTasks')}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar tarea
              </Button>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleAddTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Plantilla
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plantillas Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Agrupadores</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => {
                const IconComponent = getIconComponent(template.icon);
                return (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded ${template.color}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{template.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{template.description}</TableCell>
                    <TableCell>
                      {template.topicGroups && template.topicGroups.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {template.topicGroups.map(group => (
                            <Badge
                              key={group.id}
                              className="text-xs text-white"
                              style={{ backgroundColor: group.color }}
                            >
                              {group.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Sin agrupadores</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.isCustom ? 'default' : 'secondary'}>
                        {template.isCustom ? 'Personalizada' : 'Predefinida'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {template.isCustom && (
                          <>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deleteTemplate(template.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateManager;
