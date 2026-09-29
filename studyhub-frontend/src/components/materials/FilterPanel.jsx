import React from 'react';
import { X } from 'lucide-react';
import Select from '../common/Select';
import Input from '../common/Input';
import Button from '../common/Button';

const FilterPanel = ({
  filters,
  onFilterChange,
  onClearFilters,
  onApply,
  isOpen,
  onClose,
}) => {
  const years = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
  ];

  const semesters = [
    { value: '1', label: 'Semester 1' },
    { value: '2', label: 'Semester 2' },
    { value: '3', label: 'Semester 3' },
    { value: '4', label: 'Semester 4' },
    { value: '5', label: 'Semester 5' },
    { value: '6', label: 'Semester 6' },
    { value: '7', label: 'Semester 7' },
    { value: '8', label: 'Semester 8' },
  ];

  const types = [
    { value: 'PDF', label: 'PDF' },
    { value: 'PPT', label: 'PPT' },
    { value: 'DOC', label: 'DOC' },
    { value: 'VIDEO', label: 'Video' },
  ];

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <Input
          label="Search"
          value={filters.searchTerm || ''}
          onChange={(e) => onFilterChange('searchTerm', e.target.value)}
          placeholder="Search by title or subject"
        />

        <Select
          label="Year"
          value={filters.year || ''}
          onChange={(e) => onFilterChange('year', e.target.value)}
          options={years}
          placeholder="All Years"
        />

        <Select
          label="Semester"
          value={filters.semester || ''}
          onChange={(e) => onFilterChange('semester', e.target.value)}
          options={semesters}
          placeholder="All Semesters"
        />

        <Input
          label="Subject"
          value={filters.subject || ''}
          onChange={(e) => onFilterChange('subject', e.target.value)}
          placeholder="Subject name"
        />

        <Select
          label="Type"
          value={filters.type || ''}
          onChange={(e) => onFilterChange('type', e.target.value)}
          options={types}
          placeholder="All Types"
        />

        <div className="flex space-x-3 pt-2">
          <Button onClick={onApply} className="flex-1">
            Apply Filters
          </Button>
          <Button variant="secondary" onClick={onClearFilters}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;