import { useState } from 'react';

export default function FormLogin({ onLogin, children }) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const login = async () => {
    setStatus('busy');
    setMessage('');
    try {
      await onLogin();
      setStatus('idle');
    } catch (error) {
      const messages = {
        'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes y vuelve a intentarlo.',
        'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase Authentication.',
        'auth/network-request-failed': 'No se pudo conectar con Google. Comprueba tu conexión.',
        'auth/operation-not-allowed': 'El proveedor de Google no está habilitado en Firebase.',
        'auth/web-storage-unsupported': 'El navegador no permite guardar la sesión. Abre el sitio en tu navegador habitual.',
      };
      setMessage(messages[error.code] || 'No se pudo iniciar sesión. Inténtalo de nuevo.');
      setStatus(['auth/popup-closed-by-user','auth/cancelled-popup-request'].includes(error.code) ? 'idle' : 'error');
    }
  };

  return (
    <div className="ng-form-login">
      <p>{children}</p>
      <button type="button" className="ng-button ng-button--line" disabled={status === 'busy'} onClick={login}>
        {status === 'busy' ? 'Conectando…' : 'Iniciar sesión con Google'}
      </button>
      {status === 'error' && <p className="ng-inline-error" role="alert">{message}</p>}
    </div>
  );
}
