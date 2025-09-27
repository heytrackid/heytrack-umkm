import React, { useState } from 'react';
import { Edit, Trash2, Plus, MoreVertical, Search, Filter } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  hideOnMobile?: boolean;
  priority?: 'high' | 'medium' | 'low'; // For responsive column priority
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onCreate?: () => void;
  loading?: boolean;
  emptyMessage?: string;
  title?: string;
  createButtonText?: string;
  searchable?: boolean;
  filterable?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onEdit,
  onDelete,
  onCreate,
  loading = false,
  emptyMessage = 'No data available',
  title,
  createButtonText = 'Add New',
  searchable = false,
  filterable = false,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Filter data based on search
  const filteredData = searchTerm
    ? data.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  const toggleRowExpansion = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (expandedRows.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Card View Component
  const MobileCard = ({ item, index }: { item: T; index: number }) => {
    const isExpanded = expandedRows.has(index);
    const primaryColumns = columns.filter(col => col.priority === 'high' || !col.priority).slice(0, 2);
    const secondaryColumns = columns.filter(col => col.priority !== 'high' || col.hideOnMobile);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm">
        {/* Primary Info */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            {primaryColumns.map((column, colIndex) => {
              const value = typeof column.key === 'string'
                ? column.key.split('.').reduce((obj, key) => obj?.[key], item)
                : item[column.key as keyof T];
              
              return (
                <div key={colIndex} className={colIndex === 0 ? 'mb-1' : ''}>
                  {colIndex === 0 ? (
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {column.render ? column.render(value, item) : String(value || '-')}
                    </h4>
                  ) : (
                    <p className="text-xs text-gray-500">
                      {column.render ? column.render(value, item) : String(value || '-')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-1 ml-2">
            {onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(item)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 rounded-full transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            {secondaryColumns.length > 0 && (
              <button
                onClick={() => toggleRowExpansion(index)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                title={isExpanded ? 'Show less' : 'Show more'}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && secondaryColumns.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            {secondaryColumns.map((column, colIndex) => {
              const value = typeof column.key === 'string'
                ? column.key.split('.').reduce((obj, key) => obj?.[key], item)
                : item[column.key as keyof T];
              
              return (
                <div key={colIndex} className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {column.header}
                  </span>
                  <span className="text-sm text-gray-900 text-right">
                    {column.render ? column.render(value, item) : String(value || '-')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* View Toggle for Mobile */}
            <div className="sm:hidden flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 text-xs font-medium rounded-l-md transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-xs font-medium rounded-r-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Table
              </button>
            </div>
            
            {onCreate && (
              <button
                onClick={onCreate}
                className="inline-flex items-center px-3 py-2 sm:px-4 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{createButtonText}</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Search Bar */}
        {searchable && (
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="">
        {filteredData.length === 0 ? (
          <div className="px-4 py-8 sm:px-6 text-center">
            <div className="text-gray-500">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                {data.length === 0 ? 'No data available' : 'No results found'}
              </p>
              <p className="text-sm text-gray-500">
                {data.length === 0 ? emptyMessage : 'Try adjusting your search terms.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className={`sm:hidden ${viewMode === 'cards' ? 'block' : 'hidden'} p-4`}>
              {filteredData.map((item, index) => (
                <MobileCard key={index} item={item} index={index} />
              ))}
            </div>

            {/* Desktop Table View */}
            <div className={`hidden sm:block ${viewMode === 'table' ? 'sm:block' : ''}`}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.filter(col => !col.hideOnMobile).map((column, index) => (
                        <th
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column.header}
                        </th>
                      ))}
                      {(onEdit || onDelete) && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((item, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                        {columns.filter(col => !col.hideOnMobile).map((column, colIndex) => {
                          const value = typeof column.key === 'string'
                            ? column.key.split('.').reduce((obj, key) => obj?.[key], item)
                            : item[column.key as keyof T];
                          
                          return (
                            <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {column.render ? column.render(value, item) : String(value || '-')}
                            </td>
                          );
                        })}
                        {(onEdit || onDelete) && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              {onEdit && (
                                <button
                                  onClick={() => onEdit(item)}
                                  className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  onClick={() => onDelete(item)}
                                  className="text-gray-600 dark:text-gray-400 hover:text-red-900 p-1 rounded hover:bg-gray-100 dark:bg-gray-800 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Table View */}
            <div className={`sm:hidden ${viewMode === 'table' ? 'block' : 'hidden'} overflow-x-auto`}>
              <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '600px' }}>
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.header}
                      </th>
                    ))}
                    {(onEdit || onDelete) && (
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {columns.map((column, colIndex) => {
                        const value = typeof column.key === 'string'
                          ? column.key.split('.').reduce((obj, key) => obj?.[key], item)
                          : item[column.key as keyof T];
                        
                        return (
                          <td key={colIndex} className="px-3 py-4 text-sm text-gray-900">
                            <div className="max-w-[120px] truncate">
                              {column.render ? column.render(value, item) : String(value || '-')}
                            </div>
                          </td>
                        );
                      })}
                      {(onEdit || onDelete) && (
                        <td className="px-3 py-4 text-center">
                          <div className="flex justify-center space-x-1">
                            {onEdit && (
                              <button
                                onClick={() => onEdit(item)}
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(item)}
                                className="text-gray-600 dark:text-gray-400 hover:text-red-900 p-1 rounded hover:bg-gray-100 dark:bg-gray-800 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
