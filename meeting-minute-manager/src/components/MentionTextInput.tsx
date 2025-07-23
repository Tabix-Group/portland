
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, Project } from '@/types';
import { X, Hash, AtSign } from 'lucide-react';

interface MentionTextInputProps {
  value: string;
  onChange: (value: string, mentions: string[], projectIds?: string[]) => void;
  placeholder?: string;
  users: User[];
  projects: Project[];
  mentions: string[];
  projectIds?: string[];
  onKeyPress?: (e: React.KeyboardEvent) => void;
}

const MentionTextInput: React.FC<MentionTextInputProps> = ({
  value,
  onChange,
  placeholder,
  users,
  projects,
  mentions,
  projectIds = [],
  onKeyPress
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{type: 'user' | 'project', id: string, name: string}>>([]);
  const [currentMentionType, setCurrentMentionType] = useState<'user' | 'project' | null>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const position = e.target.selectionStart || 0;
    setCursorPosition(position);

    // Detectar menciones
    const beforeCursor = newValue.substring(0, position);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    const lastHashIndex = beforeCursor.lastIndexOf('#');
    
    let mentionStart = -1;
    let mentionType: 'user' | 'project' | null = null;
    
    if (lastAtIndex > -1 && (lastHashIndex === -1 || lastAtIndex > lastHashIndex)) {
      const afterAt = newValue.substring(lastAtIndex + 1, position);
      if (!afterAt.includes(' ')) {
        mentionStart = lastAtIndex;
        mentionType = 'user';
      }
    } else if (lastHashIndex > -1 && (lastAtIndex === -1 || lastHashIndex > lastAtIndex)) {
      const afterHash = newValue.substring(lastHashIndex + 1, position);
      if (!afterHash.includes(' ')) {
        mentionStart = lastHashIndex;
        mentionType = 'project';
      }
    }

    if (mentionStart > -1 && mentionType) {
      const query = newValue.substring(mentionStart + 1, position).toLowerCase();
      let filteredSuggestions: Array<{type: 'user' | 'project', id: string, name: string}> = [];
      
      if (mentionType === 'user') {
        filteredSuggestions = users
          .filter(user => user.name.toLowerCase().includes(query))
          .map(user => ({ type: 'user' as const, id: user.id, name: user.name }));
      } else if (mentionType === 'project') {
        filteredSuggestions = projects
          .filter(project => project.name.toLowerCase().includes(query))
          .map(project => ({ type: 'project' as const, id: project.id, name: project.name }));
      }

      setSuggestions(filteredSuggestions);
      setCurrentMentionType(mentionType);
      setShowSuggestions(filteredSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
      setCurrentMentionType(null);
    }

    // Extraer menciones actualizadas del texto
    const userMentions = extractMentions(newValue, '@', users.map(u => u.name));
    const projectMentions = extractMentions(newValue, '#', projects.map(p => p.name));
    
    const userIds = userMentions.map(name => users.find(u => u.name === name)?.id).filter(Boolean) as string[];
    const projectIds = projectMentions.map(name => projects.find(p => p.name === name)?.id).filter(Boolean) as string[];

    onChange(newValue, userIds, projectIds);
  };

  const extractMentions = (text: string, symbol: string, validNames: string[]): string[] => {
    const regex = new RegExp(`\\${symbol}([\\w\\s]+?)(?=\\s|$|\\${symbol}|@)`, 'g');
    const matches = text.match(regex) || [];
    return matches
      .map(match => match.substring(1).trim())
      .filter(name => validNames.some(validName => 
        validName.toLowerCase() === name.toLowerCase()
      ));
  };

  const handleSuggestionClick = (suggestion: {type: 'user' | 'project', id: string, name: string}) => {
    const symbol = suggestion.type === 'user' ? '@' : '#';
    const beforeCursor = value.substring(0, cursorPosition);
    const afterCursor = value.substring(cursorPosition);
    
    const mentionStart = suggestion.type === 'user' 
      ? beforeCursor.lastIndexOf('@')
      : beforeCursor.lastIndexOf('#');
    
    const newValue = value.substring(0, mentionStart) + symbol + suggestion.name + ' ' + afterCursor;
    
    // Extraer menciones actualizadas
    const userMentions = extractMentions(newValue, '@', users.map(u => u.name));
    const projectMentions = extractMentions(newValue, '#', projects.map(p => p.name));
    
    const userIds = userMentions.map(name => users.find(u => u.name === name)?.id).filter(Boolean) as string[];
    const projectIds = projectMentions.map(name => projects.find(p => p.name === name)?.id).filter(Boolean) as string[];

    onChange(newValue, userIds, projectIds);
    setShowSuggestions(false);
  };

  const removeMention = (mentionId: string, type: 'user' | 'project') => {
    if (type === 'user') {
      const user = users.find(u => u.id === mentionId);
      if (user) {
        const newValue = value.replace(new RegExp(`@${user.name}`, 'g'), '').trim();
        const newMentions = mentions.filter(id => id !== mentionId);
        onChange(newValue, newMentions, projectIds);
      }
    } else {
      const project = projects.find(p => p.id === mentionId);
      if (project) {
        const newValue = value.replace(new RegExp(`#${project.name}`, 'g'), '').trim();
        const newProjectIds = projectIds.filter(id => id !== mentionId);
        onChange(newValue, mentions, newProjectIds);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyPress) {
      onKeyPress(e);
    }
  };

  return (
    <div className="space-y-2 w-full min-w-[400px]">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="w-full min-w-[400px]"
        />
        
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.type}-${suggestion.id}`}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.type === 'user' ? (
                  <AtSign className="h-4 w-4 text-blue-600" />
                ) : (
                  <Hash className="h-4 w-4 text-green-600" />
                )}
                <span>{suggestion.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Mostrar menciones activas */}
      {(mentions.length > 0 || projectIds.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {mentions.map(mentionId => {
            const user = users.find(u => u.id === mentionId);
            return user ? (
              <Badge key={mentionId} variant="secondary" className="flex items-center space-x-1">
                <AtSign className="h-3 w-3" />
                <span>{user.name}</span>
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-red-600" 
                  onClick={() => removeMention(mentionId, 'user')}
                />
              </Badge>
            ) : null;
          })}
          {projectIds.map(projectId => {
            const project = projects.find(p => p.id === projectId);
            return project ? (
              <Badge key={projectId} variant="outline" className="flex items-center space-x-1">
                <Hash className="h-3 w-3" />
                <span>{project.name}</span>
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-red-600" 
                  onClick={() => removeMention(projectId, 'project')}
                />
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};

export default MentionTextInput;
