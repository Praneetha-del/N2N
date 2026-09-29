import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

const ErrorState = ({ 
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content.',
  onRetry,
  fullPage = false,
}) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center p-8"
    >
      <div className="bg-red-100 rounded-full p-4 mb-4">
        <AlertCircle className="text-red-600" size={48} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} icon={RefreshCw}>
          Try Again
        </Button>
      )}
    </motion.div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default ErrorState;