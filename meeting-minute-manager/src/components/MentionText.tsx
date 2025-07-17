
import React from 'react';
import { User, Project, ExternalMention } from '@/types';

interface MentionTextProps {
  text: string;
  mentions?: string[];
  projectIds?: string[];
  externalMentions?: ExternalMention[];
  users: User[];
  projects: Project[];
}

const MentionText: React.FC<MentionTextProps> = ({
  text,
  mentions = [],
  projectIds = [],
  externalMentions = [],
  users,
  projects
}) => {
  const renderTextWithMentions = (text: string) => {
    if (!mentions.length && !projectIds.length && !externalMentions.length) {
      return <span>{text}</span>;
    }

    let result = text;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Reemplazar menciones de usuarios internos
    mentions.forEach(userId => {
      const user = users.find(u => u.id === userId);
      if (user) {
        const mention = `@${user.name}`;
        const index = result.indexOf(mention, lastIndex);
        if (index !== -1) {
          if (index > lastIndex) {
            parts.push(result.substring(lastIndex, index));
          }
          parts.push(
            <span key={`user-${userId}`} className="font-bold text-blue-600 bg-blue-50 px-1 rounded">
              @{user.name}
            </span>
          );
          lastIndex = index + mention.length;
        }
      }
    });

    // Reemplazar menciones externas
    externalMentions.forEach(external => {
      const mention = `@${external.name}`;
      const index = result.indexOf(mention, lastIndex);
      if (index !== -1) {
        if (index > lastIndex) {
          parts.push(result.substring(lastIndex, index));
        }
        parts.push(
          <span key={`external-${external.id}`} className="font-bold text-purple-600 bg-purple-50 px-1 rounded border border-purple-200">
            @{external.name} (Externo)
          </span>
        );
        lastIndex = index + mention.length;
      }
    });

    // Reemplazar menciones de proyectos con colores
    projectIds.forEach(projectId => {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        const mention = `#${project.name}`;
        const index = result.indexOf(mention, lastIndex);
        if (index !== -1) {
          // Agregar texto antes de la mención
          if (index > lastIndex) {
            parts.push(result.substring(lastIndex, index));
          }
          // Agregar la mención del proyecto resaltada con su color
          const projectColor = project.color || '#22c55e';
          parts.push(
            <span 
              key={`project-${projectId}`} 
              className="font-bold px-2 py-1 rounded text-white"
              style={{ backgroundColor: projectColor }}
            >
              #{project.name}
            </span>
          );
          lastIndex = index + mention.length;
        }
      }
    });

    // Agregar el resto del texto
    if (lastIndex < result.length) {
      parts.push(result.substring(lastIndex));
    }

    return parts.length > 0 ? <span>{parts}</span> : <span>{text}</span>;
  };

  return <div>{renderTextWithMentions(text)}</div>;
};

export default MentionText;
