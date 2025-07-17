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
  const [templates, setTemplates] = useState<MinuteTemplate[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [globalTopicGroups, setGlobalTopicGroups] = useState<GlobalTopicGroup[]>([]);

  useEffect(() => {
    api.getUsers().then(setUsers);
    api.getProjects().then(setProjects);
    api.getMinutes().then(setMinutes);
    api.getTemplates().then(setTemplates);
    api.getTags().then(setTags);
    api.getGlobalTopicGroups().then(setGlobalTopicGroups);
  }, []);

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
  const addTemplate = async (template: Omit<MinuteTemplate, 'id'>) => {
    const created = await api.createTemplate(template);
    setTemplates(prev => [...prev, created]);
  };
  const updateTemplate = async (id: string, updates: Partial<MinuteTemplate>) => {
    const updated = await api.updateTemplate(id, updates);
    setTemplates(prev => prev.map(t => t.id === id ? updated : t));
  };
  const deleteTemplate = async (id: string) => {
    await api.deleteTemplate(id);
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
  const addGlobalTopicGroup = async (group: Omit<GlobalTopicGroup, 'id'>) => {
    const created = await api.createGlobalTopicGroup({ ...group, createdBy: user?.id || '' });
    setGlobalTopicGroups(prev => [...prev, created]);
  };
  const updateGlobalTopicGroup = async (id: string, updates: Partial<GlobalTopicGroup>) => {
    const updated = await api.updateGlobalTopicGroup(id, updates);
    setGlobalTopicGroups(prev => prev.map(g => g.id === id ? updated : g));
  };
  const deleteGlobalTopicGroup = async (id: string) => {
    await api.deleteGlobalTopicGroup(id);
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
