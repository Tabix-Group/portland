import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';
import { Plus, Edit, Trash, Search, X, FolderOpen } from 'lucide-react';
import { User, Project, MinuteTemplate, Tag, GlobalTopicGroup } from '@/types';
import ProjectSelector from './Settings/ProjectSelector';
import TagSelector from './TagSelector';

const PREDEFINED_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
];

const TOPIC_GROUP_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', 
  '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'
];

const Settings: React.FC = () => {
  const { 
    users, projects, templates, tags, globalTopicGroups,
    addUser, updateUser, addProject, updateProject, 
    addTemplate, updateTemplate, deleteTemplate,
    addTag, updateTag, deleteTag,
    addGlobalTopicGroup, updateGlobalTopicGroup, deleteGlobalTopicGroup,
    deleteUser
  } = useData();
  
  const [activeTab, setActiveTab] = useState('users');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(PREDEFINED_COLORS[0]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PREDEFINED_COLORS[0]);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupColor, setNewGroupColor] = useState(TOPIC_GROUP_COLORS[0]);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);

  // ...existing code...

  const handleAddUser = () => {
    if (newUserName && newUserEmail) {
      addUser({
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        isActive: true,
        projectIds: [],
        hasLimitedAccess: false,
      });
      setNewUserName('');
      setNewUserEmail('');
    }
  };

  const handleAddProject = () => {
    if (newProjectName) {
      addProject({
        name: newProjectName,
        description: newProjectDescription,
        userIds: [],
        color: newProjectColor,
      });
      setNewProjectName('');
      setNewProjectDescription('');
      setNewProjectColor(PREDEFINED_COLORS[0]);
    }
  };

  const handleAddTag = () => {
    if (newTagName.trim()) {
      addTag({
        name: newTagName.trim(),
        color: selectedColor
      });
      setNewTagName('');
      setSelectedColor(PREDEFINED_COLORS[0]);
    }
  };

  const handleUpdateTag = (id: string, updates: Partial<Tag>) => {
    updateTag(id, updates);
  };

  const handleDeleteTag = (id: string) => {
    deleteTag(id);
  };

  const handleAddTopicGroup = () => {
    if (newGroupName.trim()) {
      addGlobalTopicGroup({
        name: newGroupName.trim().toUpperCase(),
        color: newGroupColor,
        description: newGroupDescription.trim(),
        isActive: true
      });
      setNewGroupName('');
      setNewGroupDescription('');
      setNewGroupColor(TOPIC_GROUP_COLORS[0]);
    }
  };

  const handleUpdateTopicGroup = (id: string, updates: Partial<GlobalTopicGroup>) => {
    updateGlobalTopicGroup(id, updates);
  };

  const handleDeleteTopicGroup = (id: string) => {
    deleteGlobalTopicGroup(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
          <p className="text-gray-600">Administrar usuarios, proyectos, plantillas, agrupadores y etiquetas</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="projects">Proyectos</TabsTrigger>
          <TabsTrigger value="topic-groups">Agrupadores</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="tags">Etiquetas</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Add User Form */}
          <Card>
            <CardHeader>
              <CardTitle>Agregar Nuevo Usuario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Nombre del usuario"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="Email del usuario"
                />
              </div>
              <div>
                <Label htmlFor="role">Rol</Label>
                <select
                  id="role"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'user')}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <Button onClick={handleAddUser}>Agregar Usuario</Button>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id}>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="text-lg font-semibold">{user.name}</h3>
                        <p className="text-gray-500">{user.email}</p>
                        <Badge className="mt-1">{user.role}</Badge>
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={(checked) => updateUser(user.id, { isActive: checked })}
                          className="ml-2"
                        />
                      </div>
                      <div className="space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingUser(user.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteUser(user.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {editingUser === user.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                        <div>
                          <Label htmlFor="editName">Nombre</Label>
                          <Input
                            id="editName"
                            value={user.name}
                            onChange={(e) => updateUser(user.id, { name: e.target.value })}
                            placeholder="Nombre del usuario"
                          />
                        </div>
                        <div>
                          <Label htmlFor="editEmail">Email</Label>
                          <Input
                            id="editEmail"
                            type="email"
                            value={user.email}
                            onChange={(e) => updateUser(user.id, { email: e.target.value })}
                            placeholder="Email del usuario"
                          />
                        </div>
                        <div>
                          <Label htmlFor="editRole">Rol</Label>
                          <select
                            id="editRole"
                            className="w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                            value={user.role}
                            onChange={(e) => updateUser(user.id, { role: e.target.value as 'admin' | 'user' })}
                          >
                            <option value="user">Usuario</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </div>
                        
                        <ProjectSelector
                          user={user}
                          onUpdateUser={(updates) => updateUser(user.id, updates)}
                        />
                        
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" onClick={() => setEditingUser(null)}>
                            Cancelar
                          </Button>
                          <Button onClick={() => setEditingUser(null)}>Guardar</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {/* Add Project Form */}
          <Card>
            <CardHeader>
              <CardTitle>Agregar Nuevo Proyecto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="projectName">Nombre del Proyecto</Label>
                <Input
                  id="projectName"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Nombre del proyecto"
                />
              </div>
              <div>
                <Label htmlFor="projectDescription">Descripción</Label>
                <Textarea
                  id="projectDescription"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Descripción del proyecto"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Color del Proyecto:</Label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        newProjectColor === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewProjectColor(color)}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleAddProject}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Proyecto
              </Button>
            </CardContent>
          </Card>

          {/* Projects List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Proyectos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                        style={{ backgroundColor: project.color || '#22c55e' }}
                      />
                      <div>
                        <h3 className="text-lg font-semibold">{project.name}</h3>
                        <p className="text-gray-500">{project.description}</p>
                      </div>
                    </div>
                    <div className="space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topic-groups" className="space-y-6">
          {/* Add Topic Group Form */}
          <Card>
            <CardHeader>
              <CardTitle>Agregar Nuevo Agrupador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="groupName">Nombre del Agrupador</Label>
                <Input
                  id="groupName"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value.toUpperCase())}
                  placeholder="Ej: DESARROLLO, PRESUPUESTO, TESTING..."
                />
              </div>
              <div>
                <Label htmlFor="groupDescription">Descripción</Label>
                <Textarea
                  id="groupDescription"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Descripción del agrupador"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Color del Agrupador:</Label>
                <div className="flex flex-wrap gap-2">
                  {TOPIC_GROUP_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        newGroupColor === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewGroupColor(color)}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleAddTopicGroup}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Agrupador
              </Button>
            </CardContent>
          </Card>

          {/* Topic Groups List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Agrupadores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {globalTopicGroups.map((group) => (
                  <div key={group.id}>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
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
                        <Switch
                          checked={group.isActive}
                          onCheckedChange={(checked) => handleUpdateTopicGroup(group.id, { isActive: checked })}
                        />
                      </div>
                      <div className="space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingGroup(group.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteTopicGroup(group.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {editingGroup === group.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                        <div>
                          <Label htmlFor="editGroupName">Nombre</Label>
                          <Input
                            id="editGroupName"
                            value={group.name}
                            onChange={(e) => handleUpdateTopicGroup(group.id, { name: e.target.value.toUpperCase() })}
                            placeholder="Nombre del agrupador"
                          />
                        </div>
                        <div>
                          <Label htmlFor="editGroupDescription">Descripción</Label>
                          <Textarea
                            id="editGroupDescription"
                            value={group.description || ''}
                            onChange={(e) => handleUpdateTopicGroup(group.id, { description: e.target.value })}
                            placeholder="Descripción del agrupador"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Color:</Label>
                          <div className="flex flex-wrap gap-2">
                            {TOPIC_GROUP_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-8 h-8 rounded-full border-2 ${
                                  group.color === color ? 'border-gray-800' : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => handleUpdateTopicGroup(group.id, { color })}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" onClick={() => setEditingGroup(null)}>
                            Cancelar
                          </Button>
                          <Button onClick={() => setEditingGroup(null)}>Guardar</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Add Template Form */}
          <Card>
            <CardHeader>
              <CardTitle>Agregar Nueva Plantilla</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="templateName">Nombre de la Plantilla</Label>
                <Input
                  id="templateName"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Nombre de la plantilla"
                />
              </div>
              <div>
                <Label htmlFor="templateDescription">Descripción</Label>
                <Textarea
                  id="templateDescription"
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                  placeholder="Descripción de la plantilla"
                />
              </div>
              <Button onClick={() => {
                if (newTemplateName) {
                  addTemplate({
                    name: newTemplateName,
                    description: newTemplateDescription,
                    icon: 'FileText',
                    color: 'bg-gray-100 text-gray-800',
                    sections: JSON.stringify({
                      topicsDiscussed: [],
                      decisions: [],
                      pendingTasks: [],
                    }),
                    topicGroups: [],
                    isCustom: true,
                  });
                  setNewTemplateName('');
                  setNewTemplateDescription('');
                }
              }}>Agregar Plantilla</Button>
            </CardContent>
          </Card>

          {/* Templates List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Plantillas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="text-lg font-semibold">{template.name}</h3>
                      <p className="text-gray-500">{template.description}</p>
                    </div>
                    <div className="space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        // Implement edit template functionality
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        deleteTemplate(template.id)
                      }}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="space-y-6">
          {/* Add Tag Form */}
          <Card>
            <CardHeader>
              <CardTitle>Agregar Nueva Etiqueta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tagName">Nombre de la Etiqueta</Label>
                <Input
                  id="tagName"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Nombre de la etiqueta"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Color:</Label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleAddTag}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Etiqueta
              </Button>
            </CardContent>
          </Card>

          {/* Tags List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Etiquetas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tags.map((tag) => (
                  <div key={tag.id}>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge
                          className="text-white"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                        <span className="text-sm text-gray-500">{tag.color}</span>
                      </div>
                      <div className="space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTag(tag.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTag(tag.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {editingTag === tag.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                        <div>
                          <Label htmlFor="editTagName">Nombre</Label>
                          <Input
                            id="editTagName"
                            value={tag.name}
                            onChange={(e) => handleUpdateTag(tag.id, { name: e.target.value })}
                            placeholder="Nombre de la etiqueta"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Color:</Label>
                          <div className="flex flex-wrap gap-2">
                            {PREDEFINED_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-8 h-8 rounded-full border-2 ${
                                  tag.color === color ? 'border-gray-800' : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => handleUpdateTag(tag.id, { color })}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" onClick={() => setEditingTag(null)}>
                            Cancelar
                          </Button>
                          <Button onClick={() => setEditingTag(null)}>Guardar</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
