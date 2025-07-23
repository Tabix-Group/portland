
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { Tag } from '@/types';

const PREDEFINED_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
];



interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onTagsChange
}) => {
  const { tags } = useData();
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PREDEFINED_COLORS[0]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const addStandardTag = (tag: Tag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const createCustomTag = () => {
    if (newTagName.trim()) {
      const customTag: Tag = {
        id: `custom-${Date.now()}`,
        name: newTagName.trim(),
        color: selectedColor
      };
      onTagsChange([...selectedTags, customTag]);
      setNewTagName('');
      setShowCreateForm(false);
    }
  };

  const removeTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(t => t.id !== tagId));
  };

  return (
    <div className="space-y-4">
      <Label>Etiquetas</Label>
      
      {/* Etiquetas del sistema */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-600">Etiquetas del sistema:</Label>
        <div className="flex flex-wrap gap-2">
          {(Array.isArray(tags) ? tags : []).map((tag) => (
            <Button
              key={tag.id}
              type="button"
              variant={selectedTags.find(t => t.id === tag.id) ? "default" : "outline"}
              size="sm"
              onClick={() => addStandardTag(tag)}
              className="text-xs"
              style={{
                backgroundColor: selectedTags.find(t => t.id === tag.id) ? tag.color : 'transparent',
                borderColor: tag.color,
                color: selectedTags.find(t => t.id === tag.id) ? 'white' : tag.color
              }}
            >
              {tag.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Botón para crear etiqueta personalizada */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowCreateForm(!showCreateForm)}
      >
        <Plus className="h-4 w-4 mr-1" />
        Crear etiqueta personalizada
      </Button>

      {/* Formulario para nueva etiqueta */}
      {showCreateForm && (
        <div className="border rounded-lg p-3 space-y-3 bg-gray-50">
          <Input
            placeholder="Nombre de la etiqueta"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
          />
          <div className="space-y-2">
            <Label className="text-sm">Color:</Label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-6 h-6 rounded-full border-2 ${
                    selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button type="button" size="sm" onClick={createCustomTag}>
              <Plus className="h-4 w-4 mr-1" />
              Crear
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCreateForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Etiquetas seleccionadas */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-gray-600">Etiquetas seleccionadas:</Label>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag.id}
                className="flex items-center gap-1 text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-black/20 text-white"
                  onClick={() => removeTag(tag.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagSelector;
