import { useState } from 'react';

export default function FormLogin({ onLogin, children }) {
  const [status, setStatus] = useState('idle');

  const login = async () => {
    setStatus('busy');
    try {
      await onLogin();
      setStatus('idle');
    } catch (error) {
      setStatus(error.code === 'auth/popup-closed-by-user' ? 'idle' : 'error');
    }
  };

  return (
    <div className="ng-form-login">
      <p>{children}</p>
      <button type="button" className="ng-button ng-button--line" disabled={status === 'busy'} onClick={login}>
        {status === 'busy' ? 'Conectando…' : 'Iniciar sesión con Google'}
      </button>
      {status === 'error' && <p className="ng-inline-error" role="alert">No se pudo iniciar sesión. Inténtalo de nuevo.</p>}
    </div>
  );
}
