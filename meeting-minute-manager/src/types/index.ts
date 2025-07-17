
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  projectIds: string[];
  hasLimitedAccess?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  userIds: string[];
  color?: string; // New: color for projects
}

export interface MinuteItem {
  id: string;
  text: string;
  mentions?: string[];
  projectIds?: string[];
}

export interface Task {
  id: string;
  text: string;
  assignedTo?: string;
  dueDate?: string;
  completed: boolean;
  mentions?: string[];
  projectIds?: string[];
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface OccasionalParticipant {
  id: string;
  name: string;
  email: string;
}

export interface ExternalMention {
  id: string;
  name: string;
  context?: string;
}

// Nueva interfaz para personas informadas (no presentes)
export interface InformedPerson {
  id: string;
  name: string;
  email: string;
  reason?: string; // Razón por la cual debe ser informado
  isInternal?: boolean; // Nuevo: indica si es usuario interno
}

// Nueva interfaz para agrupadores de temas (ahora globales)
export interface TopicGroup {
  id: string;
  name: string;
  color: string;
  description?: string;
  topicsDiscussed: MinuteItem[];
  decisions: MinuteItem[];
  pendingTasks: Task[];
}

// Agrupadores globales configurables
export interface GlobalTopicGroup {
  id: string;
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
}

// Template topic group (for predefined topic groups in templates)
export interface TemplateTopicGroup {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface MinuteTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sections: {
    topicsDiscussed: string[];
    decisions: string[];
    pendingTasks: string[];
  };
  topicGroups?: TemplateTopicGroup[]; // New: predefined topic groups with colors
  isCustom: boolean;
  createdBy?: string;
  projectIds?: string[];
}

export interface Minute {
  id: string;
  number: number; // Numeración automática
  title: string;
  meetingDate: string;
  meetingTime: string;
  nextMeetingDate?: string; // Nueva: fecha de próxima reunión
  nextMeetingTime?: string; // Nueva: hora de próxima reunión
  nextMeetingNotes?: string; // Nueva: notas sobre la próxima reunión
  participantIds: string[];
  participants: User[];
  occasionalParticipants: OccasionalParticipant[];
  informedPersons: InformedPerson[]; // Nueva: personas informadas no presentes
  topicGroups: TopicGroup[]; // Nueva: agrupadores de temas
  // Mantener compatibilidad con versión anterior
  topicsDiscussed: MinuteItem[];
  decisions: MinuteItem[];
  pendingTasks: Task[];
  internalNotes?: string;
  tags?: Tag[];
  files: FileAttachment[];
  status: 'draft' | 'published';
  externalMentions?: ExternalMention[];
  createdBy: string;
  createdAt: string;
  projectIds?: string[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  projectIds: string[];
  hasLimitedAccess?: boolean;
}
