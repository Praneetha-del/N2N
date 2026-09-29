import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  showInput = false,
  inputLabel = '',
  inputPlaceholder = '',
  inputValue = '',
  onInputChange = () => {},
}) => {
  const [localValue, setLocalValue] = useState(inputValue);

  const handleConfirm = () => {
    if (showInput) {
      onConfirm(localValue);
    } else {
      onConfirm();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalValue(value);
    if (onInputChange) onInputChange(value);
  };

  const variantColors = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700',
    success: 'bg-green-600 hover:bg-green-700',
  };

  const variantIcons = {
    danger: <AlertCircle className="text-red-600" size={24} />,
    warning: <AlertTriangle className="text-yellow-600" size={24} />,
    info: <Info className="text-blue-600" size={24} />,
    success: <CheckCircle className="text-green-600" size={24} />,
  };

  const variantBg = {
    danger: 'bg-red-100',
    warning: 'bg-yellow-100',
    info: 'bg-blue-100',
    success: 'bg-green-100',
  };

  const buttonColor = variantColors[confirmVariant] || variantColors.danger;
  const iconElement = variantIcons[confirmVariant] || variantIcons.danger;
  const bgColor = variantBg[confirmVariant] || variantBg.danger;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center w-10 h-10 ${bgColor} rounded-full`}>
                    {iconElement}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
                <button
                  onClick={onCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-gray-600 whitespace-pre-line">{message}</p>
                
                {showInput && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {inputLabel}
                    </label>
                    <input
                      type="text"
                      value={localValue}
                      onChange={handleInputChange}
                      placeholder={inputPlaceholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${buttonColor}`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;