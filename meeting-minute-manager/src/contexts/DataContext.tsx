import React, { createContext, useState, useContext, useEffect } from 'react';
import * as api from '../lib/api';
import { User, Project, Minute, MinuteTemplate, AuthUser, Tag, GlobalTopicGroup } from '@/types';

interface DataContextType {
  user: AuthUser | null;
  users: User[];
  projects: Project[];
  minutes: Minute[];
  templates: MinuteTemplate[];
  tags: Tag[];
  globalTopicGroups: GlobalTopicGroup[];
  login: (user: AuthUser) => void;
  logout: () => void;
  addMinute: (minute: Omit<Minute, 'id'>) => void;
  updateMinute: (id: string, updates: Partial<Minute>) => void;
  deleteMinute: (id: string) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addTemplate: (template: Omit<MinuteTemplate, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<MinuteTemplate>) => void;
  deleteTemplate: (id: string) => void;
  addTag: (tag: Omit<Tag, 'id'>) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  addGlobalTopicGroup: (group: Omit<GlobalTopicGroup, 'id'>) => void;
  updateGlobalTopicGroup: (id: string, updates: Partial<GlobalTopicGroup>) => void;
  deleteGlobalTopicGroup: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const PREDEFINED_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#22c55e', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#84cc16'  // Lime
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [minutes, setMinutes] = useState<Minute[]>([]);

  useEffect(() => {
    api.getUsers().then(setUsers);
    api.getProjects().then(setProjects);
    api.getMinutes().then(setMinutes);
  }, []);
  const [templates, setTemplates] = useState<MinuteTemplate[]>([
    {
      id: '1',
      name: 'Reunión de Proyecto',
      description: 'Plantilla para reuniones de seguimiento de proyecto',
      icon: 'Briefcase',
      color: 'bg-blue-100 text-blue-800',
      sections: {
        topicsDiscussed: ['Avance del proyecto', 'Bloqueos identificados'],
        decisions: ['Decisión sobre arquitectura', 'Aprobación de presupuesto'],
        pendingTasks: ['Completar documentación', 'Revisar código']
      },
      topicGroups: [
        {
          id: 'tg1',
          name: 'DESARROLLO',
          color: '#3b82f6',
          description: 'Temas relacionados con desarrollo de software'
        },
        {
          id: 'tg2',
          name: 'TESTING',
          color: '#ef4444',
          description: 'Temas relacionados con pruebas y calidad'
        }
      ],
      isCustom: false
    },
    {
      id: '2',
      name: 'Reunión Administrativa',
      description: 'Plantilla para reuniones administrativas',
      icon: 'Users',
      color: 'bg-green-100 text-green-800',
      sections: {
        topicsDiscussed: ['Presupuesto mensual', 'Recursos humanos'],
        decisions: ['Aprobación de gastos', 'Contrataciones'],
        pendingTasks: ['Presentar informes', 'Revisar contratos']
      },
      topicGroups: [
        {
          id: 'tg3',
          name: 'PRESUPUESTO',
          color: '#22c55e',
          description: 'Temas relacionados con presupuesto y finanzas'
        },
        {
          id: 'tg4',
          name: 'RECURSOS HUMANOS',
          color: '#f59e0b',
          description: 'Temas relacionados con personal y contrataciones'
        }
      ],
      isCustom: false
    }
  ]);
  const [tags, setTags] = useState<Tag[]>([
    { id: '1', name: 'Urgente', color: '#ef4444' },
    { id: '2', name: 'Importante', color: '#f59e0b' },
    { id: '3', name: 'En revisión', color: '#3b82f6' }
  ]);
  const [globalTopicGroups, setGlobalTopicGroups] = useState<GlobalTopicGroup[]>([
    {
      id: 'gtg1',
      name: 'DESARROLLO',
      color: '#3b82f6',
      description: 'Temas relacionados con desarrollo de software',
      isActive: true,
      createdBy: '1',
      createdAt: new Date().toISOString()
    },
    {
      id: 'gtg2',
      name: 'TESTING',
      color: '#ef4444',
      description: 'Temas relacionados con pruebas y calidad',
      isActive: true,
      createdBy: '1',
      createdAt: new Date().toISOString()
    },
    {
      id: 'gtg3',
      name: 'PRESUPUESTO',
      color: '#22c55e',
      description: 'Temas relacionados con presupuesto y finanzas',
      isActive: true,
      createdBy: '1',
      createdAt: new Date().toISOString()
    }
  ]);

  const login = (user: AuthUser) => {
    setUser(user);
  };

  const logout = () => {
    setUser(null);
  };

  // MINUTES CRUD
  const addMinute = async (minute: Omit<Minute, 'id'>) => {
    const created = await api.createMinute({ ...minute, createdBy: user?.id || '' });
    setMinutes(prev => [...prev, created]);
  };
  const updateMinute = async (id: string, updates: Partial<Minute>) => {
    const updated = await api.updateMinute(id, updates);
    setMinutes(prev => prev.map(m => m.id === id ? updated : m));
  };
  const deleteMinute = async (id: string) => {
    await api.deleteMinute(id);
    setMinutes(prev => prev.filter(m => m.id !== id));
  };

  // PROJECTS CRUD
  const addProject = async (project: Omit<Project, 'id'>) => {
    const created = await api.createProject(project);
    setProjects(prev => [...prev, created]);
  };
  const updateProject = async (id: string, updates: Partial<Project>) => {
    const updated = await api.updateProject(id, updates);
    setProjects(prev => prev.map(p => p.id === id ? updated : p));
  };
  const deleteProject = async (id: string) => {
    await api.deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // USERS CRUD
  const addUser = async (user: Omit<User, 'id'>) => {
    const created = await api.createUser(user);
    setUsers(prev => [...prev, created]);
  };
  const updateUser = async (id: string, updates: Partial<User>) => {
    const updated = await api.updateUser(id, updates);
    setUsers(prev => prev.map(u => u.id === id ? updated : u));
  };
  const deleteUser = async (id: string) => {
    await api.deleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };


  // TEMPLATES CRUD
  const addTemplate = (template: Omit<MinuteTemplate, 'id'>) => {
    const newTemplate: MinuteTemplate = {
      ...template,
      id: Date.now().toString()
    };
    setTemplates(prev => [...prev, newTemplate]);
  };
  const updateTemplate = (id: string, updates: Partial<MinuteTemplate>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };
  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  // TAGS CRUD
  const addTag = async (tag: Omit<Tag, 'id'>) => {
    const created = await api.createTag(tag);
    setTags(prev => [...prev, created]);
  };
  const updateTag = async (id: string, updates: Partial<Tag>) => {
    const updated = await api.updateTag(id, updates);
    setTags(prev => prev.map(t => t.id === id ? updated : t));
  };
  const deleteTag = async (id: string) => {
    await api.deleteTag(id);
    setTags(prev => prev.filter(t => t.id !== id));
  };

  // GLOBAL TOPIC GROUPS CRUD
  const addGlobalTopicGroup = (group: Omit<GlobalTopicGroup, 'id'>) => {
    const newGroup: GlobalTopicGroup = {
      ...group,
      id: `gtg-${Date.now()}`,
      createdBy: user?.id || '',
      createdAt: new Date().toISOString()
    };
    setGlobalTopicGroups(prev => [...prev, newGroup]);
  };
  const updateGlobalTopicGroup = (id: string, updates: Partial<GlobalTopicGroup>) => {
    setGlobalTopicGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };
  const deleteGlobalTopicGroup = (id: string) => {
    setGlobalTopicGroups(prev => prev.filter(g => g.id !== id));
  };


  const value: DataContextType = {
    user,
    users,
    projects,
    minutes,
    templates,
    tags,
    globalTopicGroups,
    login,
    logout,
    addMinute,
    updateMinute,
    deleteMinute,
    addProject,
    updateProject,
    deleteProject,
    addUser,
    updateUser,
    deleteUser,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    addTag,
    updateTag,
    deleteTag,
    addGlobalTopicGroup,
    updateGlobalTopicGroup,
    deleteGlobalTopicGroup,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
