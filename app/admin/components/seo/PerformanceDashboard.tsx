'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/lib/components/ui/Button';
import { FormSelect } from '@/lib/components/ui/FormSelect';
import { LoadingSpinner } from '@/lib/components/ui/LoadingSpinner';
import { useToast } from '@/lib/components/ui/Toast';
import { 
  Activity, 
  Database, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Trash2,
  Download,
  Zap,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe,
  Search,
  Eye,
  ExternalLink
} from 'lucide-react';

interface PagePerformanceMetrics {
  path: string;
  title: string;
  category: string;
  loadTime: number;
  seoScore: number;
  issues: string[];
  lastChecked: string;
  status: 'healthy' | 'warning' | 'critical';
  metrics: {
    titleLength: number;
    descriptionLength: number;
    hasOpenGraph: boolean;
    robotsDirective: string;
    isIndexable: boolean;
  };
}

interface PerformanceStats {
  timeWindow: number;
  generatedAt: string;
  overview: {
    totalPages: number;
    healthyPages: number;
    warningPages: number;
    criticalPages: number;
    avgLoadTime: number;
    avgSeoScore: number;
    indexablePages: number;
    customPages: number;
  };
  pages: PagePerformanceMetrics[];
  topIssues: Array<{ issue: string; count: number }>;
  categoryStats: Record<string, {
    count: number;
    avgScore: number;
    avgLoadTime: number;
    issues: number;
  }>;
  recommendations: string[];
  trends: {
    seoScores: Array<{ date: string; score: number }>;
    loadTimes: Array<{ date: string; time: number }>;
  };
}

interface PerformanceDashboardProps {
  onClose: () => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ onClose }) => {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState(60);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const toast = useToast();

  const loadPerformanceStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/meta-management/performance?timeWindow=${timeWindow}&siteId=altiorainfotech`);
      if (!response.ok) throw new Error('Failed to load performance statistics');

      const result = await response.json();
      setStats(result.data);
    } catch (error) {
      console.error('Error loading performance stats:', error);
      toast.error('Failed to load performance statistics');
    } finally {
      setLoading(false);
    }
  }, [timeWindow, toast]);

  useEffect(() => {
    loadPerformanceStats();
  }, [loadPerformanceStats]);

  const performAction = async (action: string, siteId?: string, path?: string) => {
    try {
      setActionLoading(action);
      const response = await fetch('/api/admin/meta-management/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, siteId: siteId || 'altiorainfotech', path })
      });

      if (!response.ok) throw new Error(`Failed to ${action}`);

      const result = await response.json();
      
      if (action === 'export_metrics') {
        // Download the exported data
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `seo-performance-metrics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      
      toast.success(result.message);
      
      // Reload stats after cache/metrics operations
      if (action !== 'export_metrics') {
        await loadPerformanceStats();
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
    return `${seconds.toFixed(2)}s`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'critical': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeoScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Performance Dashboard</h2>
              <p className="text-slate-400 text-sm">Monitor SEO performance and page metrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-slate-300 mb-2">Analysis Window</label>
                <select
                  value={timeWindow.toString()}
                  onChange={(e) => setTimeWindow(parseInt(e.target.value))}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="15">Last 15 minutes</option>
                  <option value="60">Last hour</option>
                  <option value="240">Last 4 hours</option>
                  <option value="1440">Last 24 hours</option>
                </select>
              </div>
              
              <button
                onClick={loadPerformanceStats}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-200 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => performAction('export_metrics')}
                disabled={!!actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-200 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
              
              <button
                onClick={() => performAction('clear_cache')}
                disabled={!!actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-200 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cache
              </button>
              
              <button
                onClick={() => performAction('refresh_metrics')}
                disabled={!!actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                Refresh Metrics
              </button>
            </div>
          </div>

          {stats && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{stats.overview.totalPages}</div>
                      <div className="text-sm text-slate-400">Total Pages</div>
                      <div className="text-xs text-blue-400 mt-1">
                        {stats.overview.customPages} custom SEO
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{stats.overview.healthyPages}</div>
                      <div className="text-sm text-slate-400">Healthy Pages</div>
                      <div className="text-xs text-green-400 mt-1">
                        {((stats.overview.healthyPages / stats.overview.totalPages) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{stats.overview.warningPages}</div>
                      <div className="text-sm text-slate-400">Warning Pages</div>
                      <div className="text-xs text-yellow-400 mt-1">
                        Need attention
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{stats.overview.criticalPages}</div>
                      <div className="text-sm text-slate-400">Critical Pages</div>
                      <div className="text-xs text-red-400 mt-1">
                        Urgent fixes needed
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Search className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">
                        {stats.overview.avgSeoScore.toFixed(1)}/100
                      </div>
                      <div className="text-sm text-slate-400">Avg SEO Score</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">
                        {formatDuration(stats.overview.avgLoadTime)}
                      </div>
                      <div className="text-sm text-slate-400">Avg Load Time</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{stats.overview.indexablePages}</div>
                      <div className="text-sm text-slate-400">Indexable Pages</div>
                      <div className="text-xs text-indigo-400 mt-1">
                        {((stats.overview.indexablePages / stats.overview.totalPages) * 100).toFixed(1)}% visible to search engines
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Page Performance Table */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white">Page Performance Analysis</h3>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-700/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-slate-300 font-medium">Page</th>
                          <th className="px-4 py-3 text-left text-slate-300 font-medium">Category</th>
                          <th className="px-4 py-3 text-left text-slate-300 font-medium">Status</th>
                          <th className="px-4 py-3 text-left text-slate-300 font-medium">SEO Score</th>
                          <th className="px-4 py-3 text-left text-slate-300 font-medium">Load Time</th>
                          <th className="px-4 py-3 text-left text-slate-300 font-medium">Issues</th>
                          <th className="px-4 py-3 text-left text-slate-300 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.pages.map((page, index) => (
                          <tr key={index} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium text-white truncate max-w-xs" title={page.title}>
                                  {page.title}
                                </div>
                                <div className="text-xs text-slate-400">{page.path}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-xs capitalize border border-slate-600/50">
                                {page.category}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs border flex items-center gap-1 w-fit ${
                                page.status === 'healthy' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                                page.status === 'warning' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                                'text-red-400 bg-red-500/10 border-red-500/20'
                              }`}>
                                {getStatusIcon(page.status)}
                                {page.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                page.seoScore >= 80 ? 'text-green-400 bg-green-500/10' :
                                page.seoScore >= 60 ? 'text-yellow-400 bg-yellow-500/10' :
                                'text-red-400 bg-red-500/10'
                              }`}>
                                {page.seoScore}/100
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`${
                                page.loadTime > 2 ? 'text-red-400' : 
                                page.loadTime > 1 ? 'text-yellow-400' : 
                                'text-green-400'
                              }`}>
                                {formatDuration(page.loadTime)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="max-w-xs">
                                {page.issues.length > 0 ? (
                                  <div className="text-xs text-red-400">
                                    {page.issues.slice(0, 2).join(', ')}
                                    {page.issues.length > 2 && ` +${page.issues.length - 2} more`}
                                  </div>
                                ) : (
                                  <span className="text-xs text-green-400">No issues</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => performAction('analyze_page', 'altiorainfotech', page.path)}
                                  disabled={!!actionLoading}
                                  className="text-xs px-2 py-1 h-auto bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-300 rounded transition-colors disabled:opacity-50"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => window.open(`https://altiorainfotech.com${page.path}`, '_blank')}
                                  className="text-xs px-2 py-1 h-auto bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-300 rounded transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Top Issues */}
              {stats.topIssues.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Most Common Issues</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats.topIssues.map((issue, index) => (
                      <div key={index} className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg backdrop-blur-xl">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-red-300">{issue.issue}</span>
                          <span className="text-red-400 font-bold">{issue.count} pages</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Performance */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4 text-white">Performance by Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(stats.categoryStats).map(([category, categoryData]) => (
                    <div key={category} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-4 rounded-lg">
                      <h4 className="font-medium text-white capitalize mb-3">{category}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pages:</span>
                          <span className="font-medium text-white">{categoryData.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Avg Score:</span>
                          <span className={`font-medium ${
                            categoryData.avgScore >= 80 ? 'text-green-400' :
                            categoryData.avgScore >= 60 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {categoryData.avgScore.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Avg Load:</span>
                          <span className="font-medium text-white">{formatDuration(categoryData.avgLoadTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Issues:</span>
                          <span className="font-medium text-red-400">{categoryData.issues}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {stats.recommendations.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 text-white">Performance Recommendations</h3>
                  <div className="space-y-3">
                    {stats.recommendations.map((recommendation, index) => (
                      <div key={index} className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg backdrop-blur-xl">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-200">{recommendation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Trends */}
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4 text-white">Performance Trends (Last 7 Days)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-slate-300 mb-2">SEO Score Trend</h4>
                    <div className="space-y-2">
                      {stats.trends.seoScores.map((trend, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-slate-400">{new Date(trend.date).toLocaleDateString()}</span>
                          <span className={`font-medium ${
                            trend.score >= 80 ? 'text-green-400' :
                            trend.score >= 60 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {trend.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-300 mb-2">Load Time Trend</h4>
                    <div className="space-y-2">
                      {stats.trends.loadTimes.map((trend, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-slate-400">{new Date(trend.date).toLocaleDateString()}</span>
                          <span className="font-medium text-white">{formatDuration(trend.time)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>


      </div>
    </div>
  );
};