import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BASE_URL } from '@/lib/api';

interface UserPasswordFieldsProps {
  userId: string;
  onPasswordChanged?: () => void;
}

const UserPasswordFields: React.FC<UserPasswordFieldsProps> = ({ userId, onPasswordChanged }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast({ title: 'Error', description: 'Completa ambos campos', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Las contraseñas no coinciden', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/users/${userId}/admin-change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ newPassword })
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: 'Contraseña actualizada', description: 'La contraseña fue cambiada correctamente' });
      setNewPassword('');
      setConfirmPassword('');
      if (onPasswordChanged) onPasswordChanged();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'No se pudo cambiar la contraseña', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleChangePassword} className="space-y-2 mt-2">
      <div>
        <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
        <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Confirmar nueva contraseña</label>
        <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={loading}>{loading ? 'Guardando...' : 'Actualizar contraseña'}</Button>
      </div>
    </form>
  );
};

export default UserPasswordFields;
