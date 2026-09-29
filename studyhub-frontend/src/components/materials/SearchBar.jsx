import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchBar = ({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = 'Search materials...',
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  const handleClear = () => {
    onChange('');
    if (onSearch) onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className={`
        relative flex items-center
        border rounded-lg transition-all
        ${isFocused ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}
      `}>
        <Search className="absolute left-3 text-gray-400" size={18} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-2 bg-transparent focus:outline-none"
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={handleClear}
              className="absolute right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
};

export default SearchBar;