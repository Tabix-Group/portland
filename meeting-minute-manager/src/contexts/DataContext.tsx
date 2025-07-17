import React, { createContext, useState, useContext } from 'react';
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
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      role: 'admin',
      isActive: true,
      projectIds: ['1', '2'],
      hasLimitedAccess: false
    },
    {
      id: '2',
      name: 'Ana Gómez',
      email: 'ana.gomez@example.com',
      role: 'user',
      isActive: true,
      projectIds: ['1'],
      hasLimitedAccess: true
    },
    {
      id: '3',
      name: 'Luis García',
      email: 'luis.garcia@example.com',
      role: 'user',
      isActive: false,
      projectIds: ['2', '3'],
      hasLimitedAccess: true
    }
  ]);
  const [projects, setProjects] = useState<Project[]>([
    { 
      id: '1', 
      name: 'Sistema CRM', 
      description: 'Implementación del nuevo sistema CRM',
      userIds: ['1', '2'], 
      color: '#3b82f6' // Blue
    },
    { 
      id: '2', 
      name: 'Migración Base de Datos', 
      description: 'Migración a PostgreSQL',
      userIds: ['1', '3'], 
      color: '#ef4444' // Red
    },
    { 
      id: '3', 
      name: 'App Móvil', 
      description: 'Desarrollo de aplicación móvil',
      userIds: ['2', '3'], 
      color: '#22c55e' // Green
    }
  ]);
  const [minutes, setMinutes] = useState<Minute[]>([
    {
      id: '1',
      number: 1,
      title: 'Reunión de Kick-off del Proyecto CRM',
      meetingDate: '2024-01-15',
      meetingTime: '10:00',
      nextMeetingDate: '2024-01-22',
      nextMeetingTime: '10:00',
      nextMeetingNotes: 'Revisar avances del sprint y planificar siguiente iteración',
      participantIds: ['1', '2'],
      participants: [users[0], users[1]],
      occasionalParticipants: [],
      informedPersons: [
        {
          id: 'ip1',
          name: 'Carlos Mendoza',
          email: 'carlos.mendoza@company.com',
          reason: 'Stakeholder del proyecto'
        }
      ],
      topicGroups: [
        {
          id: 'tg1',
          name: 'DESARROLLO',
          color: '#3b82f6',
          description: 'Temas de desarrollo',
          topicsDiscussed: [
            { id: 'td1', text: 'Definición de arquitectura del sistema', mentions: ['1'], projectIds: ['1'] }
          ],
          decisions: [
            { id: 'd1', text: 'Usar React con TypeScript para el frontend', mentions: ['2'], projectIds: ['1'] }
          ],
          pendingTasks: [
            { id: 'pt1', text: 'Crear mockups de interfaz', assignedTo: '2', dueDate: '2024-01-20', completed: false, mentions: ['2'], projectIds: ['1'] }
          ]
        }
      ],
      topicsDiscussed: [
        { id: 'topic1', text: 'Presentación del equipo y objetivos del proyecto', projectIds: ['1'] }
      ],
      decisions: [
        { id: 'decision1', text: 'Metodología ágil con sprints de 2 semanas', projectIds: ['1'] }
      ],
      pendingTasks: [
        { id: 'task1', text: 'Configurar entorno de desarrollo', assignedTo: '1', completed: false, projectIds: ['1'] }
      ],
      files: [],
      status: 'published',
      
      createdBy: '1',
      createdAt: '2024-01-15T08:00:00Z',
      
      projectIds: ['1']
    },
    {
      id: '2',
      number: 2,
      title: 'Revisión de Avances - Semana 2',
      meetingDate: '2024-01-22',
      meetingTime: '14:30',
      participantIds: ['1', '2', '3'],
      participants: [users[0], users[1], users[2]],
      occasionalParticipants: [],
      informedPersons: [],
      topicGroups: [],
      topicsDiscussed: [
        { id: 'topic2', text: 'Revisión del progreso del desarrollo', mentions: ['1', '2'], projectIds: ['1'] }
      ],
      decisions: [
        { id: 'decision2', text: 'Implementar autenticación con JWT', mentions: ['1'], projectIds: ['1'] }
      ],
      pendingTasks: [
        { id: 'task2', text: 'Completar módulo de usuarios', assignedTo: '2', dueDate: '2024-01-30', completed: false, mentions: ['2'], projectIds: ['1'] }
      ],
      files: [],
      status: 'published',
      
      createdBy: '1',
      createdAt: '2024-01-22T12:00:00Z',
      projectIds: ['1']
    }
  ]);
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

  const addMinute = (minute: Omit<Minute, 'id'>) => {
    const newMinute: Minute = {
      ...minute,
      id: Date.now().toString(),
      status: 'draft',
      
      createdBy: user?.id || '',
      createdAt: new Date().toISOString(),
      participants: users.filter(u => minute.participantIds.includes(u.id))
    };
    setMinutes([...minutes, newMinute]);
  };

  const updateMinute = (id: string, updates: Partial<Minute>) => {
    setMinutes(minutes.map(minute => minute.id === id ? { ...minute, ...updates } : minute));
  };

  const deleteMinute = (id: string) => {
    setMinutes(minutes.filter(minute => minute.id !== id));
  };

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString()
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(projects.map(project => project.id === id ? { ...project, ...updates } : project));
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser: User = {
      ...user,
      id: Date.now().toString()
    };
    setUsers([...users, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(users.map(user => user.id === id ? { ...user, ...updates } : user));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const addTemplate = (template: Omit<MinuteTemplate, 'id'>) => {
    const newTemplate: MinuteTemplate = {
      ...template,
      id: Date.now().toString()
    };
    setTemplates([...templates, newTemplate]);
  };

  const updateTemplate = (id: string, updates: Partial<MinuteTemplate>) => {
    setTemplates(templates.map(template => template.id === id ? { ...template, ...updates } : template));
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(template => template.id !== id));
  };

  const addTag = (tag: Omit<Tag, 'id'>) => {
    const newTag: Tag = {
      ...tag,
      id: Date.now().toString()
    };
    setTags([...tags, newTag]);
  };

  const updateTag = (id: string, updates: Partial<Tag>) => {
    setTags(tags.map(tag => tag.id === id ? { ...tag, ...updates } : tag));
  };

  const deleteTag = (id: string) => {
    setTags(tags.filter(tag => tag.id !== id));
  };

  const addGlobalTopicGroup = (group: Omit<GlobalTopicGroup, 'id'>) => {
    const newGroup: GlobalTopicGroup = {
      ...group,
      id: `gtg-${Date.now()}`,
      createdBy: user?.id || '',
      createdAt: new Date().toISOString()
    };
    setGlobalTopicGroups([...globalTopicGroups, newGroup]);
  };

  const updateGlobalTopicGroup = (id: string, updates: Partial<GlobalTopicGroup>) => {
    setGlobalTopicGroups(groups => groups.map(group => 
      group.id === id ? { ...group, ...updates } : group
    ));
  };

  const deleteGlobalTopicGroup = (id: string) => {
    setGlobalTopicGroups(groups => groups.filter(group => group.id !== id));
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
