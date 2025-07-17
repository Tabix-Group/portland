
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Hash } from 'lucide-react';
import { MinuteTemplate, TopicGroup, InformedPerson } from '@/types';
import UnifiedParticipantSelector from './UnifiedParticipantSelector';
import TopicGroupManager from './TopicGroupManager';
import TagSelector from './TagSelector';
import ProjectSelector from './ProjectSelector';
import AIRecordingButton from './AIRecordingButton';

interface CreateMinuteFormProps {
  onBack: () => void;
  onSuccess: () => void;
  selectedTemplate?: MinuteTemplate | null;
}

const CreateMinuteForm: React.FC<CreateMinuteFormProps> = ({ onBack, onSuccess, selectedTemplate }) => {
  const { user } = useAuth();
  const { users, projects, minutes, addMinute } = useData();
  const { toast } = useToast();
  
  // Obtener fecha y hora actuales
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().slice(0, 5);

  // Calcular el próximo número de minuta
  const nextMinuteNumber = Math.max(0, ...minutes.map(m => m.number || 0)) + 1;

  const [formData, setFormData] = useState({
    title: selectedTemplate?.name || '',
    meetingDate: today,
    meetingTime: currentTime,
    nextMeetingDate: '',
    nextMeetingTime: '',
    nextMeetingNotes: '',
    participantIds: Array.isArray(user?.id ? [user.id] : []) ? (user?.id ? [user.id] : []) : [],
    occasionalParticipants: [],
    informedPersons: [] as InformedPerson[],
    topicGroups: [],
    // Mantener compatibilidad con versión anterior
    topicsDiscussed: [{ id: '1', text: '', mentions: [], projectIds: [] }],
    decisions: [{ id: '1', text: '', mentions: [], projectIds: [] }],
    pendingTasks: [{ id: '1', text: '', assignedTo: '', dueDate: '', completed: false, mentions: [], projectIds: [] }],
    internalNotes: '',
    tags: [],
    files: [],
    projectIds: Array.isArray(selectedTemplate?.projectIds) ? selectedTemplate?.projectIds : []
  });

  const userProjects = user?.role === 'admin' 
    ? projects 
    : projects.filter(p => user?.projectIds.includes(p.id));

  const availableUsers = users.filter(u => u.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const participantIds = Array.isArray(formData.participantIds) ? formData.participantIds : [];
    const occasionalParticipants = Array.isArray(formData.occasionalParticipants) ? formData.occasionalParticipants : [];
    if (!formData.title || !formData.meetingDate || (participantIds.length === 0 && occasionalParticipants.length === 0)) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    // Limpiar arrays y asegurar que los campos sean válidos
    const cleanArray = (arr) => Array.isArray(arr) ? arr.filter(item => item && (item.text ? item.text.trim() !== '' : true)) : [];
    const minute = {
      number: nextMinuteNumber,
      title: formData.title,
      meetingDate: formData.meetingDate,
      meetingTime: formData.meetingTime,
      nextMeetingDate: formData.nextMeetingDate,
      nextMeetingTime: formData.nextMeetingTime,
      nextMeetingNotes: formData.nextMeetingNotes,
      participantIds: formData.participantIds,
      participants: users.filter(u => formData.participantIds.includes(u.id)),
      occasionalParticipants: cleanArray(formData.occasionalParticipants),
      informedPersons: cleanArray(formData.informedPersons),
      topicGroups: Array.isArray(formData.topicGroups) ? formData.topicGroups.map(g => ({
        ...g,
        topicsDiscussed: cleanArray(g.topicsDiscussed),
        decisions: cleanArray(g.decisions),
        pendingTasks: cleanArray(g.pendingTasks)
      })) : [],
      topicsDiscussed: cleanArray(formData.topicsDiscussed),
      decisions: cleanArray(formData.decisions),
      pendingTasks: cleanArray(formData.pendingTasks),
      internalNotes: formData.internalNotes,
      tags: Array.isArray(formData.tags) ? formData.tags : [],
      files: Array.isArray(formData.files) ? formData.files : [],
      status: 'draft',
      createdBy: user?.id || '',
      createdAt: new Date().toISOString(),
      projectIds: Array.isArray(formData.projectIds) ? formData.projectIds : [],
    };

    addMinute(minute);

    toast({
      title: "Minuta creada",
      description: `La minuta #${nextMinuteNumber} ha sido creada exitosamente`,
    });

    onSuccess();
  };

  const handleAITranscription = (transcription: {
    topics: string[];
    decisions: string[];
    tasks: string[];
    title?: string;
  }) => {
    // Update title if provided
    if (transcription.title) {
      setFormData(prev => ({ ...prev, title: transcription.title }));
    }

    // Si hay agrupadores de temas, agregar al primer grupo, sino crear contenido general
    const topicGroups = Array.isArray(formData.topicGroups) ? formData.topicGroups : [];
    if (topicGroups.length > 0) {
      const firstGroup = formData.topicGroups[0];
      const updatedGroups = formData.topicGroups.map(group => {
        if (group.id === firstGroup.id) {
          return {
            ...group,
            topicsDiscussed: [
              ...group.topicsDiscussed,
              ...transcription.topics.map((text, index) => ({
                id: (Date.now() + index).toString(),
                text,
                mentions: [],
                projectIds: []
              }))
            ],
            decisions: [
              ...group.decisions,
              ...transcription.decisions.map((text, index) => ({
                id: (Date.now() + index + 1000).toString(),
                text,
                mentions: [],
                projectIds: []
              }))
            ],
            pendingTasks: [
              ...group.pendingTasks,
              ...transcription.tasks.map((text, index) => ({
                id: (Date.now() + index + 2000).toString(),
                text,
                assignedTo: '',
                dueDate: '',
                completed: false,
                mentions: [],
                projectIds: []
              }))
            ]
          };
        }
        return group;
      });
      setFormData(prev => ({ ...prev, topicGroups: updatedGroups }));
    } else {
      // Agregar a las secciones tradicionales
      const newTopics = transcription.topics.map((text, index) => ({
        id: (Date.now() + index).toString(),
        text,
        mentions: [],
        projectIds: []
      }));
      
      const newDecisions = transcription.decisions.map((text, index) => ({
        id: (Date.now() + index + 1000).toString(),
        text,
        mentions: [],
        projectIds: []
      }));
      
      const newTasks = transcription.tasks.map((text, index) => ({
        id: (Date.now() + index + 2000).toString(),
        text,
        assignedTo: '',
        dueDate: '',
        completed: false,
        mentions: [],
        projectIds: []
      }));
      
      setFormData(prev => ({
        ...prev,
        topicsDiscussed: [...prev.topicsDiscussed.filter(t => t.text.trim() !== ''), ...newTopics],
        decisions: [...prev.decisions.filter(d => d.text.trim() !== ''), ...newDecisions],
        pendingTasks: [...prev.pendingTasks.filter(t => t.text.trim() !== ''), ...newTasks]
      }));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2">
            <Hash className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Nueva Minuta #{nextMinuteNumber}
            </h2>
          </div>
          <p className="text-gray-600">
            {selectedTemplate ? selectedTemplate.description : 'Crear una nueva minuta de reunión'}
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AI Recording Section */}
        <AIRecordingButton onTranscriptionComplete={handleAITranscription} />

        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título de la Reunión *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Reunión de Planificación Q1"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meetingDate">Fecha de la Reunión *</Label>
                <Input
                  id="meetingDate"
                  type="date"
                  value={formData.meetingDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, meetingDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="meetingTime">Hora de la Reunión</Label>
                <Input
                  id="meetingTime"
                  type="time"
                  value={formData.meetingTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, meetingTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nextMeetingDate">Próxima Reunión (fecha)</Label>
                <Input
                  id="nextMeetingDate"
                  type="date"
                  value={formData.nextMeetingDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextMeetingDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="nextMeetingTime">Próxima Reunión (hora)</Label>
                <Input
                  id="nextMeetingTime"
                  type="time"
                  value={formData.nextMeetingTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextMeetingTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="nextMeetingNotes">Notas próxima reunión</Label>
                <Input
                  id="nextMeetingNotes"
                  value={formData.nextMeetingNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextMeetingNotes: e.target.value }))}
                  placeholder="Agenda/notas..."
                />
              </div>
            </div>

            <ProjectSelector
              projects={userProjects}
              selectedProjectIds={formData.projectIds}
              onProjectsChange={(projectIds) => setFormData(prev => ({ ...prev, projectIds }))}
              label="Proyectos relacionados con esta reunión"
            />
          </CardContent>
        </Card>

        {/* Participantes y Personas a Informar Unificado */}
        <Card>
          <CardHeader>
            <CardTitle>Participantes y Personas a Informar</CardTitle>
          </CardHeader>
          <CardContent>
            <UnifiedParticipantSelector
              users={availableUsers}
              selectedUserIds={formData.participantIds}
              occasionalParticipants={formData.occasionalParticipants}
              informedPersons={formData.informedPersons}
              onUserSelectionChange={(userIds) => setFormData(prev => ({ ...prev, participantIds: userIds }))}
              onOccasionalParticipantsChange={(participants) => setFormData(prev => ({ ...prev, occasionalParticipants: participants }))}
              onInformedPersonsChange={(informedPersons) => setFormData(prev => ({ ...prev, informedPersons }))}
            />
          </CardContent>
        </Card>

        {/* Agrupadores de Temas */}
        <Card>
          <CardHeader>
            <CardTitle>Contenido por Agrupadores</CardTitle>
          </CardHeader>
          <CardContent>
            <TopicGroupManager
              topicGroups={formData.topicGroups}
              onTopicGroupsChange={(topicGroups) => setFormData(prev => ({ ...prev, topicGroups }))}
              users={availableUsers}
              projects={userProjects}
            />
          </CardContent>
        </Card>

        {/* Información Adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes">Notas Internas</Label>
              <Textarea
                id="notes"
                value={formData.internalNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
                placeholder="Notas internas para el equipo..."
                rows={3}
              />
            </div>

            <TagSelector
              selectedTags={formData.tags}
              onTagsChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancelar
          </Button>
          <Button type="submit">
            Crear Minuta #{nextMinuteNumber}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateMinuteForm;
