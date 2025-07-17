
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, UserPlus, Users, UserCheck } from 'lucide-react';
import { User, OccasionalParticipant } from '@/types';

interface ParticipantSelectorProps {
  users: User[];
  selectedUserIds: string[];
  occasionalParticipants: OccasionalParticipant[];
  onUserSelectionChange: (userIds: string[]) => void;
  onOccasionalParticipantsChange: (participants: OccasionalParticipant[]) => void;
}

const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
  users,
  selectedUserIds,
  occasionalParticipants,
  onUserSelectionChange,
  onOccasionalParticipantsChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newParticipant, setNewParticipant] = useState({ name: '', email: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredUsers = users.filter(user => 
    user.isActive && (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleUserToggle = (userId: string, checked: boolean) => {
    if (checked) {
      onUserSelectionChange([...selectedUserIds, userId]);
    } else {
      onUserSelectionChange(selectedUserIds.filter(id => id !== userId));
    }
  };

  const addOccasionalParticipant = () => {
    if (newParticipant.name.trim()) {
      const participant: OccasionalParticipant = {
        id: `occasional-${Date.now()}`,
        name: newParticipant.name.trim(),
        email: newParticipant.email.trim() || ''
      };
      onOccasionalParticipantsChange([...occasionalParticipants, participant]);
      setNewParticipant({ name: '', email: '' });
      setShowAddForm(false);
    }
  };

  const removeOccasionalParticipant = (id: string) => {
    onOccasionalParticipantsChange(occasionalParticipants.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Participantes Internos */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <UserCheck className="h-5 w-5 text-blue-600" />
          <Label className="text-lg font-medium">Participantes Internos</Label>
        </div>
        
        <Input
          placeholder="Buscar usuarios registrados..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
          {filteredUsers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-2">No se encontraron usuarios</p>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                <Checkbox
                  id={`user-${user.id}`}
                  checked={selectedUserIds.includes(user.id)}
                  onCheckedChange={(checked) => handleUserToggle(user.id, checked as boolean)}
                />
                <label htmlFor={`user-${user.id}`} className="text-sm cursor-pointer flex-1">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-gray-500 text-xs">{user.email}</div>
                </label>
              </div>
            ))
          )}
        </div>

        {/* Usuarios seleccionados */}
        {selectedUserIds.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Usuarios internos seleccionados ({selectedUserIds.length}):</Label>
            <div className="flex flex-wrap gap-2">
              {selectedUserIds.map(userId => {
                const user = users.find(u => u.id === userId);
                return user ? (
                  <Badge key={userId} variant="default" className="bg-blue-100 text-blue-800">
                    {user.name}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Participantes Externos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-green-600" />
            <Label className="text-lg font-medium">Participantes Externos</Label>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Agregar participante externo
          </Button>
        </div>

        {/* Formulario para nuevo participante externo */}
        {showAddForm && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Nuevo Participante Externo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm">Nombre *</Label>
                <Input
                  placeholder="Nombre completo"
                  value={newParticipant.name}
                  onChange={(e) => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm">Email (opcional)</Label>
                <Input
                  placeholder="correo@ejemplo.com"
                  type="email"
                  value={newParticipant.email}
                  onChange={(e) => setNewParticipant(prev => ({ ...prev, email: e.target.value }))}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Si proporciona email, se enviará una copia de la minuta
                </p>
              </div>
              <div className="flex space-x-2">
                <Button type="button" size="sm" onClick={addOccasionalParticipant}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de participantes externos */}
        {occasionalParticipants.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">
              Participantes externos agregados ({occasionalParticipants.length}):
            </Label>
            <div className="space-y-2">
              {occasionalParticipants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{participant.name}</div>
                    {participant.email && (
                      <div className="text-xs text-gray-600">{participant.email}</div>
                    )}
                    {!participant.email && (
                      <div className="text-xs text-gray-500">Sin email - no recibirá copia</div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-100"
                    onClick={() => removeOccasionalParticipant(participant.id)}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resumen total */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm text-gray-600">
          <strong>Total de participantes:</strong>{' '}
          {selectedUserIds.length + occasionalParticipants.length}
          {selectedUserIds.length + occasionalParticipants.length === 0 && (
            <span className="text-red-600 ml-2">* Debe seleccionar al menos un participante</span>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          • {selectedUserIds.length} participantes internos
        </div>
        <div className="text-xs text-gray-500">
          • {occasionalParticipants.length} participantes externos
        </div>
        {occasionalParticipants.some(p => p.email) && (
          <div className="text-xs text-gray-500">
            • {occasionalParticipants.filter(p => p.email).length} participantes externos recibirán copia por email
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantSelector;
