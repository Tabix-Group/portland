
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { ArrowLeft, FileText, Plus } from 'lucide-react';
import { MinuteTemplate } from '@/types';

interface TemplateSelectorProps {
  onBack: () => void;
  onSelectTemplate: (template: MinuteTemplate | null) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onBack, onSelectTemplate }) => {
  const { templates } = useData();

  // Debugging: verificar si templates está undefined
  if (templates === undefined) {
    console.error('TemplateSelector: templates is undefined!');
    return <div>Cargando plantillas...</div>;
  }

  const handleStandardMinute = () => {
    onSelectTemplate(null);
  };

  const handleTemplateSelect = (template: MinuteTemplate) => {
    onSelectTemplate(template);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Minuta</h2>
          <p className="text-gray-600">Selecciona una plantilla o crea una minuta estándar</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>

      {/* Standard Minute Option */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer transition-colors">
        <CardContent className="p-6" onClick={handleStandardMinute}>
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Minuta Estándar</h3>
              <p className="text-gray-600">Crear una minuta desde cero con los campos básicos</p>
            </div>
            <Plus className="h-5 w-5 text-gray-400" />
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      {(Array.isArray(templates) ? templates.length : 0) > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plantillas Disponibles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Array.isArray(templates) ? templates : []).map((template) => (
              <Card
  key={template.id}
  className="cursor-pointer hover:shadow-md transition-shadow"
  onClick={() => handleTemplateSelect(template)}
>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${template.color}`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    {template.isCustom ? (
                      <Badge variant="secondary">Personalizada</Badge>
                    ) : (
                      <Badge variant="outline">Predefinida</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                </CardHeader>
                 <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Temas:</span> {template.sections?.topicsDiscussed?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Decisiones:</span> {template.sections?.decisions?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Tareas:</span> {template.sections?.pendingTasks?.length || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
