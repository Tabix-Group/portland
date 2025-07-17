
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, UserPlus, Users, UserCheck, Mail, Info } from 'lucide-react';
import { User, OccasionalParticipant, InformedPerson } from '@/types';

interface UnifiedParticipantSelectorProps {
  users: User[];
  selectedUserIds: string[];
  occasionalParticipants: OccasionalParticipant[];
  informedPersons: InformedPerson[];
  onUserSelectionChange: (userIds: string[]) => void;
  onOccasionalParticipantsChange: (participants: OccasionalParticipant[]) => void;
  onInformedPersonsChange: (persons: InformedPerson[]) => void;
}

const UnifiedParticipantSelector: React.FC<UnifiedParticipantSelectorProps> = ({
  users,
  selectedUserIds,
  occasionalParticipants,
  informedPersons,
  onUserSelectionChange,
  onOccasionalParticipantsChange,
  onInformedPersonsChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newParticipant, setNewParticipant] = useState({ name: '', email: '' });
  const [showAddParticipantForm, setShowAddParticipantForm] = useState(false);
  const [newInformedPerson, setNewInformedPerson] = useState({ name: '', email: '', reason: '', isInternal: false });
  const [showAddInformedForm, setShowAddInformedForm] = useState(false);

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
      setShowAddParticipantForm(false);
    }
  };

  const removeOccasionalParticipant = (id: string) => {
    onOccasionalParticipantsChange(occasionalParticipants.filter(p => p.id !== id));
  };

  const addInformedPerson = () => {
    if (newInformedPerson.name.trim()) {
      const person: InformedPerson = {
        id: `informed-${Date.now()}`,
        name: newInformedPerson.name.trim(),
        email: newInformedPerson.email.trim(),
        reason: newInformedPerson.reason.trim() || undefined,
        isInternal: newInformedPerson.isInternal
      };
      onInformedPersonsChange([...informedPersons, person]);
      setNewInformedPerson({ name: '', email: '', reason: '', isInternal: false });
      setShowAddInformedForm(false);
    }
  };

  const addInternalUserAsInformed = (user: User, reason: string = '') => {
    const person: InformedPerson = {
      id: `informed-internal-${user.id}`,
      name: user.name,
      email: user.email,
      reason: reason || 'Usuario interno',
      isInternal: true
    };
    onInformedPersonsChange([...informedPersons, person]);
  };

  const removeInformedPerson = (id: string) => {
    onInformedPersonsChange(informedPersons.filter(p => p.id !== id));
  };

  const availableInternalUsers = users.filter(user => 
    user.isActive && 
    !selectedUserIds.includes(user.id) && 
    !informedPersons.some(p => p.isInternal && p.email === user.email)
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="participants" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="participants">Participantes</TabsTrigger>
          <TabsTrigger value="informed">A Informar</TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="space-y-4">
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

            {Array.isArray(selectedUserIds) && selectedUserIds.length > 0 && (
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
                onClick={() => setShowAddParticipantForm(!showAddParticipantForm)}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Agregar externo
              </Button>
            </div>

            {showAddParticipantForm && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4 space-y-3">
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
                      onClick={() => setShowAddParticipantForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {occasionalParticipants.length > 0 && (
              <div className="space-y-2">
                {occasionalParticipants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{participant.name}</div>
                      {participant.email && (
                        <div className="text-xs text-gray-600">{participant.email}</div>
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
            )}
          </div>
        </TabsContent>

        <TabsContent value="informed" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-orange-600" />
              <Label className="text-lg font-medium">Personas a Informar</Label>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddInformedForm(!showAddInformedForm)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar persona
            </Button>
          </div>

          <p className="text-sm text-gray-600">
            Estas personas recibirán una copia de la minuta aunque no estén presentes.
          </p>

          {/* Seleccionar usuarios internos */}
          {availableInternalUsers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Usuarios Internos Disponibles:</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                {availableInternalUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-gray-600">{user.email}</div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addInternalUserAsInformed(user)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Informar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showAddInformedForm && (
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="pt-4 space-y-3">
                <div>
                  <Label className="text-sm">Nombre *</Label>
                  <Input
                    placeholder="Nombre completo"
                    value={newInformedPerson.name}
                    onChange={(e) => setNewInformedPerson(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-sm">Email *</Label>
                  <Input
                    placeholder="correo@ejemplo.com"
                    type="email"
                    value={newInformedPerson.email}
                    onChange={(e) => setNewInformedPerson(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-sm">Razón (opcional)</Label>
                  <Textarea
                    placeholder="¿Por qué debe ser informado?"
                    value={newInformedPerson.reason}
                    onChange={(e) => setNewInformedPerson(prev => ({ ...prev, reason: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="button" size="sm" onClick={addInformedPerson}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAddInformedForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {informedPersons.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">
                Personas a informar ({informedPersons.length}):
              </Label>
              <div className="space-y-2">
                {informedPersons.map((person) => (
                  <div key={person.id} className="flex items-center justify-between bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center">
                        <Mail className="h-4 w-4 mr-1 text-orange-600" />
                        {person.name}
                        {person.isInternal && (
                          <Badge variant="secondary" className="ml-2 text-xs">Interno</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">{person.email}</div>
                      {person.reason && (
                        <div className="text-xs text-gray-500 mt-1 flex items-start">
                          <Info className="h-3 w-3 mr-1 mt-0.5 text-orange-500" />
                          {person.reason}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-100"
                      onClick={() => removeInformedPerson(person.id)}
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Resumen total */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm text-gray-600">
          <strong>Resumen:</strong>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          • {selectedUserIds.length} participantes internos
        </div>
        <div className="text-xs text-gray-500">
          • {occasionalParticipants.length} participantes externos
        </div>
        <div className="text-xs text-gray-500">
          • {informedPersons.length} personas a informar
        </div>
        {selectedUserIds.length + occasionalParticipants.length === 0 && (
          <div className="text-red-600 text-xs mt-1">* Debe seleccionar al menos un participante</div>
        )}
      </div>
    </div>
  );
};

export default UnifiedParticipantSelector;
