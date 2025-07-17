
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Mail, Info } from 'lucide-react';
import { InformedPerson } from '@/types';

interface InformedPersonsSelectorProps {
  informedPersons: InformedPerson[];
  onInformedPersonsChange: (persons: InformedPerson[]) => void;
}

const InformedPersonsSelector: React.FC<InformedPersonsSelectorProps> = ({
  informedPersons,
  onInformedPersonsChange
}) => {
  const [newPerson, setNewPerson] = useState({ name: '', email: '', reason: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const addInformedPerson = () => {
    if (newPerson.name.trim() && newPerson.email.trim()) {
      const person: InformedPerson = {
        id: `informed-${Date.now()}`,
        name: newPerson.name.trim(),
        email: newPerson.email.trim(),
        reason: newPerson.reason.trim() || undefined
      };
      onInformedPersonsChange([...informedPersons, person]);
      setNewPerson({ name: '', email: '', reason: '' });
      setShowAddForm(false);
    }
  };

  const removeInformedPerson = (id: string) => {
    onInformedPersonsChange(informedPersons.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-orange-600" />
          <Label className="text-lg font-medium">Personas a Informar (No Presentes)</Label>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Agregar persona a informar
        </Button>
      </div>

      <p className="text-sm text-gray-600">
        Estas personas recibirán una copia de la minuta aunque no hayan estado presentes en la reunión.
      </p>

      {showAddForm && (
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Nueva Persona a Informar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm">Nombre *</Label>
              <Input
                placeholder="Nombre completo"
                value={newPerson.name}
                onChange={(e) => setNewPerson(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm">Email *</Label>
              <Input
                placeholder="correo@ejemplo.com"
                type="email"
                value={newPerson.email}
                onChange={(e) => setNewPerson(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm">Razón (opcional)</Label>
              <Textarea
                placeholder="¿Por qué debe ser informado? Ej: Responsable del área, Necesita conocer las decisiones..."
                value={newPerson.reason}
                onChange={(e) => setNewPerson(prev => ({ ...prev, reason: e.target.value }))}
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
                onClick={() => setShowAddForm(false)}
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
    </div>
  );
};

export default InformedPersonsSelector;
