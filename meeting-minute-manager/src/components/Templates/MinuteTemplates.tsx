
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Calendar, Users, Target, Briefcase } from 'lucide-react';

interface MinuteTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  sections: {
    topicsDiscussed: string[];
    decisions: string[];
    pendingTasks: string[];
  };
}

interface MinuteTemplatesProps {
  onSelectTemplate: (template: MinuteTemplate) => void;
}

const MinuteTemplates: React.FC<MinuteTemplatesProps> = ({ onSelectTemplate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<MinuteTemplate | null>(null);

  const templates: MinuteTemplate[] = [
    {
      id: 'standup',
      name: 'Reunión Diaria (Stand-up)',
      description: 'Para reuniones diarias de seguimiento del equipo',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-800',
      sections: {
        topicsDiscussed: [
          '¿Qué hiciste ayer?',
          '¿Qué planeas hacer hoy?',
          '¿Hay algún impedimento?'
        ],
        decisions: [
          'Prioridades del día',
          'Bloqueadores identificados'
        ],
        pendingTasks: [
          'Resolver impedimentos identificados',
          'Seguimiento de tareas atrasadas'
        ]
      }
    },
    {
      id: 'planning',
      name: 'Planificación de Proyecto',
      description: 'Para reuniones de planificación y definición de objetivos',
      icon: Target,
      color: 'bg-green-100 text-green-800',
      sections: {
        topicsDiscussed: [
          'Objetivos del proyecto',
          'Recursos disponibles',
          'Cronograma propuesto',
          'Riesgos identificados'
        ],
        decisions: [
          'Alcance del proyecto aprobado',
          'Fechas de entrega definidas',
          'Responsabilidades asignadas'
        ],
        pendingTasks: [
          'Crear cronograma detallado',
          'Asignar recursos específicos',
          'Definir métricas de éxito'
        ]
      }
    },
    {
      id: 'review',
      name: 'Revisión de Resultados',
      description: 'Para evaluar el progreso y resultados obtenidos',
      icon: Briefcase,
      color: 'bg-purple-100 text-purple-800',
      sections: {
        topicsDiscussed: [
          'Resultados obtenidos',
          'Métricas alcanzadas',
          'Problemas encontrados',
          'Lecciones aprendidas'
        ],
        decisions: [
          'Acciones correctivas necesarias',
          'Mejoras a implementar',
          'Próximos pasos'
        ],
        pendingTasks: [
          'Implementar mejoras identificadas',
          'Documentar lecciones aprendidas',
          'Planificar siguiente iteración'
        ]
      }
    },
    {
      id: 'client',
      name: 'Reunión con Cliente',
      description: 'Para reuniones con clientes externos',
      icon: Users,
      color: 'bg-orange-100 text-orange-800',
      sections: {
        topicsDiscussed: [
          'Necesidades del cliente',
          'Feedback recibido',
          'Propuestas presentadas',
          'Expectativas y timeline'
        ],
        decisions: [
          'Acuerdos alcanzados',
          'Cambios aprobados',
          'Siguiente reunión programada'
        ],
        pendingTasks: [
          'Preparar propuesta detallada',
          'Enviar documentación solicitada',
          'Programar seguimiento'
        ]
      }
    }
  ];

  const handleSelectTemplate = (template: MinuteTemplate) => {
    onSelectTemplate(template);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Plantillas de Minutas</h3>
        <Badge variant="secondary" className="text-xs">
          {templates.length} disponibles
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(template => {
          const IconComponent = template.icon;
          return (
            <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${template.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 mb-4">
                  <div className="text-xs text-gray-500">
                    • {template.sections.topicsDiscussed.length} temas sugeridos
                  </div>
                  <div className="text-xs text-gray-500">
                    • {template.sections.decisions.length} decisiones tipo
                  </div>
                  <div className="text-xs text-gray-500">
                    • {template.sections.pendingTasks.length} tareas comunes
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Vista Previa
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <IconComponent className="h-5 w-5" />
                          <span>{template.name}</span>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-gray-600">{template.description}</p>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm mb-2">Temas a Tratar:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {template.sections.topicsDiscussed.map((topic, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <span className="text-blue-500">•</span>
                                  <span>{topic}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Decisiones Típicas:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {template.sections.decisions.map((decision, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <span className="text-green-500">•</span>
                                  <span>{decision}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Tareas Comunes:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {template.sections.pendingTasks.map((task, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <span className="text-orange-500">•</span>
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2 pt-4 border-t">
                          <Button 
                            onClick={() => handleSelectTemplate(template)}
                            className="flex items-center space-x-2"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Usar esta Plantilla</span>
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    size="sm" 
                    onClick={() => handleSelectTemplate(template)}
                    className="flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Usar</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MinuteTemplates;
