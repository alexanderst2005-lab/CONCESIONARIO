"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash } from 'lucide-react';
import { useUI } from '@/components/UIProvider';

export default function DeleteVehicleBtn({ id }: { id: number }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast, confirmAction } = useUI();

  const handleDelete = async () => {
    confirmAction('¿Estás seguro de que quieres eliminar este vehículo? Esta acción no se puede deshacer.', async () => {
      setIsDeleting(true);
      try {
        const res = await fetch(`/api/vehicles/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          toast('Vehículo eliminado exitosamente', 'success');
          router.refresh();
        } else {
          toast('Error eliminando el vehículo', 'error');
        }
      } catch (e) {
        toast('Error de conexión', 'error');
      } finally {
        setIsDeleting(false);
      }
    });
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isDeleting}
      style={{
        backgroundColor: '#ef4444', 
        color: '#fff', 
        border: 'none', 
        padding: '0.5rem 1rem', 
        borderRadius: '4px', 
        fontSize: '0.85rem', 
        fontWeight: 'bold', 
        cursor: isDeleting ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        textTransform: 'uppercase'
      }}
    >
      <Trash size={14} />
      {isDeleting ? 'Eliminando...' : 'Eliminar'}
    </button>
  );
}
