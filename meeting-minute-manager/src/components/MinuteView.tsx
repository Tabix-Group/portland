import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Minute } from '@/types';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Calendar, Users, Hash, Mail, FolderOpen } from 'lucide-react';
import MentionText from './MentionText';

interface MinuteViewProps {
  minuteId: string;
  onBack: () => void;
}

const MinuteView: React.FC<MinuteViewProps> = ({ minuteId, onBack }) => {
  const { user } = useAuth();
  const { minutes, users, projects } = useData();

  const minute = minutes.find(m => m.id === minuteId);

  if (!minute) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Minuta no encontrada</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publicada';
      case 'draft': return 'Borrador';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return CheckCircle;
      case 'draft': return Clock;
      default: return AlertCircle;
    }
  };

  const StatusIcon = getStatusIcon(minute.status);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Dashboard
        </Button>
        
      </div>

      {/* Información básica */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Hash className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-bold text-blue-600">#{minute.number}</span>
              </div>
              <CardTitle className="text-2xl">{minute.title}</CardTitle>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(minute.meetingDate).toLocaleDateString()}</span>
                  {minute.meetingTime && <span>- {minute.meetingTime}</span>}
                </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{(Array.isArray(minute.participants) ? minute.participants.length : 0) + (Array.isArray(minute.occasionalParticipants) ? minute.occasionalParticipants.length : 0)} participantes</span>
              </div>
              </div>
            </div>
            <Badge className={getStatusColor(minute.status)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {getStatusLabel(minute.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Proyectos relacionados */}
          {Array.isArray(minute.projectIds) && minute.projectIds.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Proyectos relacionados:</h4>
              <div className="flex flex-wrap gap-2">
                {minute.projectIds.map(projectId => {
                  const project = projects.find(p => p.id === projectId);
                  return project ? (
                    <Badge key={projectId} className="bg-green-100 text-green-800">
                      #{project.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Etiquetas */}
          {Array.isArray(minute.tags) && minute.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {minute.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    className="text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Participantes */}
          <div className="space-y-2">
            <h4 className="font-medium">Participantes:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {minute.participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-2">
                  <Badge variant="outline">{participant.name}</Badge>
                </div>
              ))}
              {minute.occasionalParticipants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-2">
                  <Badge variant="secondary">{participant.name} (Ocasional)</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personas Informadas */}
      {Array.isArray(minute.informedPersons) && minute.informedPersons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-orange-600" />
              <span>Personas Informadas (No Presentes)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {minute.informedPersons.map((person) => (
                <div key={person.id} className="flex items-center justify-between bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <div>
                    <div className="font-medium text-sm">{person.name}</div>
                    <div className="text-xs text-gray-600">{person.email}</div>
                    {person.reason && (
                      <div className="text-xs text-gray-500 mt-1">{person.reason}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agrupadores de Temas */}
      {Array.isArray(minute.topicGroups) && minute.topicGroups.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <FolderOpen className="h-5 w-5 text-blue-600" />
            <span>Contenido por Agrupadores</span>
          </h3>
          {(Array.isArray(minute.topicGroups) ? minute.topicGroups : []).map((group) => (
            <Card key={group.id} className="border-l-4" style={{ borderLeftColor: group.color }}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge className="text-white" style={{ backgroundColor: group.color }}>
                    {group.name}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {(Array.isArray(group.topicsDiscussed) ? group.topicsDiscussed.length : 0) + (Array.isArray(group.decisions) ? group.decisions.length : 0) + (Array.isArray(group.pendingTasks) ? group.pendingTasks.length : 0)} elementos
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Temas del grupo */}
                {Array.isArray(group.topicsDiscussed) && group.topicsDiscussed.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-600 mb-2">Temas Tratados</h4>
                    <div className="space-y-2">
                {(Array.isArray(group.topicsDiscussed) ? group.topicsDiscussed : []).map((topic, index) => (
                        <div key={topic.id} className="border-l-4 border-blue-200 pl-4">
                          <div className="flex items-start space-x-2">
                            <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                            <MentionText
                              text={topic.text}
                              mentions={topic.mentions}
                              projectIds={topic.projectIds}
                              users={users}
                              projects={projects}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decisiones del grupo */}
                {Array.isArray(group.decisions) && group.decisions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Decisiones</h4>
                    <div className="space-y-2">
                {(Array.isArray(group.decisions) ? group.decisions : []).map((decision, index) => (
                        <div key={decision.id} className="border-l-4 border-green-200 pl-4">
                          <div className="flex items-start space-x-2">
                            <span className="text-sm font-medium text-green-600">#{index + 1}</span>
                            <MentionText
                              text={decision.text}
                              mentions={decision.mentions}
                              projectIds={decision.projectIds}
                              users={users}
                              projects={projects}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tareas del grupo */}
                {Array.isArray(group.pendingTasks) && group.pendingTasks.length > 0 && (
                  <div>
                    <h4 className="font-medium text-orange-600 mb-2">Tareas Pendientes</h4>
                    <div className="space-y-2">
                {(Array.isArray(group.pendingTasks) ? group.pendingTasks : []).map((task, index) => (
                        <div key={task.id} className="border-l-4 border-orange-200 pl-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-2 flex-1">
                              <span className="text-sm font-medium text-orange-600">#{index + 1}</span>
                              <div className="flex-1">
                                <MentionText
                                  text={task.text}
                                  mentions={task.mentions}
                                  projectIds={task.projectIds}
                                  users={users}
                                  projects={projects}
                                />
                                {task.assignedTo && (
                                  <div className="mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      Asignado a: {users.find(u => u.id === task.assignedTo)?.name}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                            {task.dueDate && (
                              <div className="text-xs text-gray-500">
                                Vence: {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Próxima Reunión */}
      {(minute.nextMeetingDate || minute.nextMeetingNotes) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span>Próxima Reunión</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {minute.nextMeetingDate && (
              <div className="mb-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="font-medium">
                      {new Date(minute.nextMeetingDate).toLocaleDateString()}
                    </span>
                  </div>
                  {minute.nextMeetingTime && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span>{minute.nextMeetingTime}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {minute.nextMeetingNotes && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm whitespace-pre-wrap">{minute.nextMeetingNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mantener secciones tradicionales si no hay agrupadores */}
      {(!Array.isArray(minute.topicGroups) || minute.topicGroups.length === 0) && (
        <>
          {/* Temas tratados */}
          <Card>
            <CardHeader>
              <CardTitle>Temas Tratados</CardTitle>
            </CardHeader>
            <CardContent>
              {(!Array.isArray(minute.topicsDiscussed) || minute.topicsDiscussed.length === 0) ? (
                <p className="text-gray-500">No hay temas registrados</p>
              ) : (
                <div className="space-y-3">
                  {minute.topicsDiscussed.map((topic, index) => (
                    <div key={topic.id} className="border-l-4 border-blue-200 pl-4">
                      <div className="flex items-start space-x-2">
                        <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                        <MentionText
                          text={topic.text}
                          mentions={topic.mentions}
                          projectIds={topic.projectIds}
                          users={users}
                          projects={projects}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Decisiones */}
          <Card>
            <CardHeader>
              <CardTitle>Decisiones</CardTitle>
            </CardHeader>
            <CardContent>
              {(!Array.isArray(minute.decisions) || minute.decisions.length === 0) ? (
                <p className="text-gray-500">No hay decisiones registradas</p>
              ) : (
                <div className="space-y-3">
                  {minute.decisions.map((decision, index) => (
                    <div key={decision.id} className="border-l-4 border-green-200 pl-4">
                      <div className="flex items-start space-x-2">
                        <span className="text-sm font-medium text-green-600">#{index + 1}</span>
                        <MentionText
                          text={decision.text}
                          mentions={decision.mentions}
                          projectIds={decision.projectIds}
                          users={users}
                          projects={projects}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tareas pendientes */}
          <Card>
            <CardHeader>
              <CardTitle>Tareas Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              {(!Array.isArray(minute.pendingTasks) || minute.pendingTasks.length === 0) ? (
                <p className="text-gray-500">No hay tareas pendientes</p>
              ) : (
                <div className="space-y-3">
                  {minute.pendingTasks.map((task, index) => (
                    <div key={task.id} className="border-l-4 border-orange-200 pl-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2 flex-1">
                          <span className="text-sm font-medium text-orange-600">#{index + 1}</span>
                          <div className="flex-1">
                            <MentionText
                              text={task.text}
                              mentions={task.mentions}
                              projectIds={task.projectIds}
                              users={users}
                              projects={projects}
                            />
                            {task.assignedTo && (
                              <div className="mt-1">
                                <Badge variant="outline" className="text-xs">
                                  Asignado a: {users.find(u => u.id === task.assignedTo)?.name}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                        {task.dueDate && (
                          <div className="text-xs text-gray-500">
                            Vence: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Menciones externas */}
      {Array.isArray(minute.externalMentions) && minute.externalMentions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Menciones Externas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {minute.externalMentions.map((mention) => (
                <div key={mention.id} className="flex items-center space-x-2">
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    {mention.name} (Externo)
                  </Badge>
                  {mention.context && (
                    <span className="text-sm text-gray-600">- {mention.context}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notas internas */}
      {minute.internalNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas Internas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{minute.internalNotes}</p>
          </CardContent>
        </Card>
      )}

      {/* Información de creación */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Creación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Creado por: {users.find(u => u.id === minute.createdBy)?.name}</p>
            <p>Fecha de creación: {new Date(minute.createdAt).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MinuteView;
