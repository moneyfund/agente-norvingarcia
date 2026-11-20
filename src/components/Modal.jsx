import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

function Modal({ open, onClose, title, className = '', children }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      className={`ng-dialog ${className}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="ng-dialog-inner">
        <header className="ng-dialog-head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="ng-icon-button" aria-label="Cerrar" onClick={onClose}>
            <X size={21} aria-hidden="true" />
          </button>
        </header>
        {children}
      </div>
    </dialog>,
    document.body,
  );
}

export default Modal;
