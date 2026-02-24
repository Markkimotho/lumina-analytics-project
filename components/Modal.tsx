import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 md:p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg md:rounded-xl shadow-2xl w-full max-w-sm md:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-3 md:p-4 border-b border-slate-800">
          <h3 className="text-lg md:text-xl font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors flex-shrink-0">
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};