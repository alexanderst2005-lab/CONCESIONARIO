"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash } from 'lucide-react';

export default function DeleteVehicleBtn({ id }: { id: number }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este vehículo? Esta acción no se puede deshacer.')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        alert('Vehículo eliminado exitosamente');
        router.refresh();
      } else {
        alert('Error eliminando el vehículo');
      }
    } catch (e) {
      alert('Error de conexión');
    } finally {
      setIsDeleting(false);
    }
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
