
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, FileText } from 'lucide-react';

interface NextMeetingPlannerProps {
  nextMeetingDate: string;
  nextMeetingTime: string;
  nextMeetingNotes: string;
  onNextMeetingChange: (field: string, value: string) => void;
}

const NextMeetingPlanner: React.FC<NextMeetingPlannerProps> = ({
  nextMeetingDate,
  nextMeetingTime,
  nextMeetingNotes,
  onNextMeetingChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-green-600" />
          <span>Próxima Reunión</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Planifica la próxima reunión para facilitar la coordinación con los participantes.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nextMeetingDate" className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Fecha de la Próxima Reunión</span>
            </Label>
            <Input
              id="nextMeetingDate"
              type="date"
              value={nextMeetingDate}
              onChange={(e) => onNextMeetingChange('nextMeetingDate', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="nextMeetingTime" className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Hora</span>
            </Label>
            <Input
              id="nextMeetingTime"
              type="time"
              value={nextMeetingTime}
              onChange={(e) => onNextMeetingChange('nextMeetingTime', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="nextMeetingNotes" className="flex items-center space-x-1">
            <FileText className="h-4 w-4" />
            <span>Notas sobre la Próxima Reunión</span>
          </Label>
          <Textarea
            id="nextMeetingNotes"
            value={nextMeetingNotes}
            onChange={(e) => onNextMeetingChange('nextMeetingNotes', e.target.value)}
            placeholder="Temas a tratar en la próxima reunión, lugar, preparativos necesarios..."
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            Esta información aparecerá en la minuta para que todos sepan cuándo será la próxima reunión.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextMeetingPlanner;
