import React from 'react';

const MenuSemanal = () => {
  return (
    <div style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ 
        fontSize: '3rem', 
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, #FF6B35, #2ECC71)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        Menú Semanal
      </h1>
      <p style={{ 
        fontSize: '1.25rem', 
        color: '#6B7280',
        marginBottom: '2rem'
      }}>
        Esta página está en construcción. Pronto podrás planificar tus menús semanales aquí.
      </p>
      <div style={{
        padding: '1rem 2rem',
        background: 'linear-gradient(135deg, #FF6B35, #2ECC71)',
        color: 'white',
        borderRadius: '12px',
        fontWeight: '600'
      }}>
        🚧 Próximamente
      </div>
    </div>
  );
};

export default MenuSemanal;