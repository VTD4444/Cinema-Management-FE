import React, { useEffect, useRef } from 'react';
import { cn } from '../../utils/mergeClass';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, className }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        'backdrop:bg-black/60 backdrop:backdrop-blur-sm',
        'bg-surface text-white shadow-xl shadow-black/50 overflow-hidden p-0',
        'm-auto w-full max-w-lg rounded-t-2xl rounded-b-none sm:rounded-lg',
        'max-h-[92vh] sm:max-h-[85vh]',
        'open:animate-in open:fade-in-0 open:zoom-in-95',
        className
      )}
      onClose={onClose}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/10 transition-colors focus:outline-none"
          >
            <X className="h-5 w-5 text-gray-400" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </dialog>
  );
};
