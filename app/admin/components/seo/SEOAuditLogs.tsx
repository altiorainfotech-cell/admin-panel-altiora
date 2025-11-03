'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/lib/components/ui/Button';
import { FormInput } from '@/lib/components/ui/FormInput';
import { FormSelect } from '@/lib/components/ui/FormSelect';
import { LoadingSpinner } from '@/lib/components/ui/LoadingSpinner';
import { useToast } from '@/lib/components/ui/Toast';
import { Pagination } from '@/lib/components/Pagination';
import { 
  Clock, 
  User, 
  FileText, 
  RotateCcw, 
  Edit, 
  Trash2, 
  Plus,
  ArrowRight,
  Filter,
  Download,
  TrendingUp
} from 'lucide-react';

interface AuditLog {
  _id: string;
  action: string;
  entityType: string;
  path?: string;
  oldSlug?: string;
  newSlug?: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata: {
    bulkOperation?: boolean;
    affectedPaths?: string[];
    redirectCreated?: boolean;
  };
  performedBy: {
    _id: string;
    email: string;
    role: string;
  };
  performedAt: string;
}

interface AuditStats {
  totalChanges: number;
  uniquePagesModified: number;
  actionBreakdown: Record<string, number>;
  topUsers: {
    userId: string;
    email: string;
    changeCount: number;
  }[];
}

interface SEOAuditLogsProps {
  onClose: () => void;
}

const ACTION_LABELS = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  reset: 'Reset',
  bulk_update: 'Bulk Update',
  bulk_delete: 'Bulk Delete',
  bulk_reset: 'Bulk Reset',
  slug_change: 'Slug Changed',
  redirect_create: 'Redirect Created'
};

const ACTION_ICONS = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  reset: RotateCcw,
  bulk_update: Edit,
  bulk_delete: Trash2,
  bulk_reset: RotateCcw,
  slug_change: ArrowRight,
  redirect_create: ArrowRight
};

const ACTION_COLORS = {
  create: 'text-green-600 bg-green-50',
  update: 'text-blue-600 bg-blue-50',
  delete: 'text-red-600 bg-red-50',
  reset: 'text-orange-600 bg-orange-50',
  bulk_update: 'text-blue-600 bg-blue-50',
  bulk_delete: 'text-red-600 bg-red-50',
  bulk_reset: 'text-orange-600 bg-orange-50',
  slug_change: 'text-purple-600 bg-purple-50',
  redirect_create: 'text-indigo-600 bg-indigo-50'
};

export const SEOAuditLogs: React.FC<SEOAuditLogsProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    action: '',
    entityType: '',
    path: '',
    dateFrom: '',
    dateTo: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const toast = useToast();

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      console.log('Fetching audit logs with params:', params.toString());
      const response = await fetch(`/api/admin/meta-management/audit-logs?${params}`);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        let errorMessage = 'Failed to load audit logs';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
          if (errorData.details) {
            console.error('Validation errors:', errorData.details);
          }
        } catch (e) {
          console.error('Could not parse error response');
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Audit logs result:', result);
      
      if (result.success && result.data) {
        setLogs(result.data.logs || []);
        setPagination(result.data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        });
      } else {
        throw new Error(result.error || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  const loadAuditStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      console.log('Fetching audit stats...');
      
      const response = await fetch('/api/admin/meta-management/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 30 })
      });
      
      console.log('Stats response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stats error response:', errorText);
        throw new Error('Failed to load audit stats');
      }

      const result = await response.json();
      console.log('Stats result:', result);
      
      if (result.success && result.data) {
        setStats(result.data);
      } else {
        console.warn('No stats data received');
      }
    } catch (error) {
      console.error('Error loading audit stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  useEffect(() => {
    loadAuditStats();
  }, [loadAuditStats]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const exportAuditLogs = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'page' && key !== 'limit') {
          params.append(key, value.toString());
        }
      });
      params.append('limit', '1000'); // Export more records

      const response = await fetch(`/api/admin/meta-management/audit-logs?${params}`);
      if (!response.ok) throw new Error('Failed to export audit logs');

      const result = await response.json();
      const csvContent = [
        ['Date', 'Action', 'Entity Type', 'Path', 'User', 'Changes'],
        ...result.data.logs.map((log: AuditLog) => [
          new Date(log.performedAt).toLocaleString(),
          ACTION_LABELS[log.action as keyof typeof ACTION_LABELS] || log.action,
          log.entityType,
          log.path || '',
          log.performedBy.email,
          log.changes.map(c => `${c.field}: ${c.oldValue} → ${c.newValue}`).join('; ')
        ])
      ].map(row => row.map((cell: any) => `"${cell}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `seo-audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Audit logs exported successfully');
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast.error('Failed to export audit logs');
    }
  };

  const formatChangeValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">SEO Audit Logs</h2>
              <p className="text-slate-400 text-sm">Track all SEO changes and modifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Statistics */}
        {!statsLoading && stats && (
          <div className="p-6 border-b border-slate-700/50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{stats.totalChanges}</div>
                    <div className="text-sm text-slate-400">Total Changes</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{stats.uniquePagesModified}</div>
                    <div className="text-sm text-slate-400">Pages Modified</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Edit className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">
                      {Object.entries(stats.actionBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                    </div>
                    <div className="text-sm text-slate-400">Most Common</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white truncate">
                      {stats.topUsers[0]?.email || 'N/A'}
                    </div>
                    <div className="text-sm text-slate-400">Top User</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Action</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Actions</option>
                {Object.entries(ACTION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Entity Type</label>
              <select
                value={filters.entityType}
                onChange={(e) => handleFilterChange('entityType', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Types</option>
                <option value="seo_page">SEO Page</option>
                <option value="redirect">Redirect</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Path</label>
              <input
                value={filters.path}
                onChange={(e) => handleFilterChange('path', e.target.value)}
                placeholder="Filter by path..."
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={exportAuditLogs}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-200 rounded-lg font-medium transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {logs.map((log) => {
                  const ActionIcon = ACTION_ICONS[log.action as keyof typeof ACTION_ICONS] || FileText;
                  const actionColorClass = log.action === 'create' ? 'text-green-400 bg-green-500/10' :
                                         log.action === 'update' ? 'text-blue-400 bg-blue-500/10' :
                                         log.action === 'delete' ? 'text-red-400 bg-red-500/10' :
                                         log.action === 'reset' ? 'text-orange-400 bg-orange-500/10' :
                                         'text-slate-400 bg-slate-500/10';
                  
                  return (
                    <div key={log._id} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${actionColorClass}`}>
                            <ActionIcon className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-white">
                                {ACTION_LABELS[log.action as keyof typeof ACTION_LABELS] || log.action}
                              </span>
                              {log.path && (
                                <span className="text-sm text-slate-400">
                                  on {log.path}
                                </span>
                              )}
                              {log.metadata.bulkOperation && (
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                                  Bulk Operation
                                </span>
                              )}
                            </div>
                            
                            <div className="text-sm text-slate-400 mb-2">
                              by {log.performedBy.email} • {new Date(log.performedAt).toLocaleString()}
                            </div>
                            
                            {log.changes.length > 0 && (
                              <div className="space-y-1">
                                {log.changes.map((change, index) => (
                                  <div key={index} className="text-sm">
                                    <span className="font-medium text-slate-300">{change.field}:</span>
                                    <span className="text-red-400 mx-1">{formatChangeValue(change.oldValue)}</span>
                                    <ArrowRight className="w-3 h-3 inline mx-1 text-slate-400" />
                                    <span className="text-green-400">{formatChangeValue(change.newValue)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {log.metadata.affectedPaths && log.metadata.affectedPaths.length > 0 && (
                              <div className="text-sm text-slate-400 mt-2">
                                Affected {log.metadata.affectedPaths.length} pages
                              </div>
                            )}
                            
                            {log.metadata.redirectCreated && (
                              <div className="text-sm text-blue-400 mt-1">
                                Redirect created: {log.oldSlug} → {log.newSlug}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {logs.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  No audit logs found matching your criteria
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-6 border-t border-slate-700/50">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}


      </div>
    </div>
  );
};