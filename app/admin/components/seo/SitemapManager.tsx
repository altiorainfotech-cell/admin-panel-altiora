'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/lib/components/ui/Button';
import { LoadingSpinner } from '@/lib/components/ui/LoadingSpinner';
import { useToast } from '@/lib/components/ui/Toast';
import { 
  Globe, 
  Download, 
  RefreshCw, 
  ExternalLink,
  BarChart3,
  FileText,
  Clock,
  TrendingUp
} from 'lucide-react';

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: string;
  priority: number;
}

interface SitemapStats {
  totalUrls: number;
  lastModified: string;
  categoryBreakdown: Record<string, number>;
  priorityBreakdown: Record<number, number>;
  averagePriority: number;
}

interface SitemapInfo {
  totalEntries: number;
  needsSitemapIndex: boolean;
  sitemapCount: number;
  sitemapUrls: string[];
  indexUrl: string | null;
}

interface SitemapManagerProps {
  onClose: () => void;
}

export const SitemapManager: React.FC<SitemapManagerProps> = ({ onClose }) => {
  const [stats, setStats] = useState<SitemapStats | null>(null);
  const [sitemapInfo, setSitemapInfo] = useState<SitemapInfo | null>(null);
  const [previewEntries, setPreviewEntries] = useState<SitemapEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const toast = useToast();

  const loadSitemapInfo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/meta-management/sitemap');
      if (!response.ok) throw new Error('Failed to load sitemap information');

      const result = await response.json();
      setStats(result.data.stats);
      setSitemapInfo(result.data.sitemapInfo);
      setPreviewEntries(result.data.previewEntries);
    } catch (error) {
      console.error('Error loading sitemap info:', error);
      toast.error('Failed to load sitemap information');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSitemapInfo();
  }, [loadSitemapInfo]);

  const generateSitemap = async (format: 'xml' | 'json' = 'xml', chunk?: number) => {
    try {
      setGenerating(true);
      const response = await fetch('/api/admin/meta-management/sitemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, chunk })
      });

      if (!response.ok) throw new Error('Failed to generate sitemap');

      if (format === 'xml') {
        // Download XML file
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sitemap${chunk !== undefined ? `-${chunk + 1}` : ''}.xml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('Sitemap downloaded successfully');
      } else {
        // Handle JSON response
        const result = await response.json();
        const dataStr = JSON.stringify(result.data.sitemap, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sitemap.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('Sitemap JSON downloaded successfully');
      }
    } catch (error) {
      console.error('Error generating sitemap:', error);
      toast.error('Failed to generate sitemap');
    } finally {
      setGenerating(false);
    }
  };

  const openSitemapUrl = (url: string) => {
    window.open(url, '_blank');
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
      <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Sitemap Management</h2>
              <p className="text-slate-400 text-sm">Generate and manage XML sitemaps</p>
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
          {/* Statistics */}
          {stats && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-lg font-medium text-white">Sitemap Statistics</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{stats.totalUrls}</div>
                      <div className="text-sm text-slate-400">Total URLs</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{stats.averagePriority.toFixed(2)}</div>
                      <div className="text-sm text-slate-400">Avg Priority</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        {new Date(stats.lastModified).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-slate-400">Last Modified</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">
                        {Object.keys(stats.categoryBreakdown).length}
                      </div>
                      <div className="text-sm text-slate-400">Categories</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-4 rounded-lg">
                <h4 className="font-medium mb-3 text-white">Category Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm text-slate-400 capitalize">{category}</span>
                      <span className="font-medium text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sitemap Information */}
          {sitemapInfo && (
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-white">Sitemap Configuration</h3>
              
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-400">Total Entries:</span>
                    <div className="font-medium text-white">{sitemapInfo.totalEntries}</div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400">Sitemap Type:</span>
                    <div className="font-medium text-white">
                      {sitemapInfo.needsSitemapIndex ? 'Sitemap Index' : 'Single Sitemap'}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400">Sitemap Count:</span>
                    <div className="font-medium text-white">{sitemapInfo.sitemapCount}</div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400">Index URL:</span>
                    <div className="font-medium">
                      {sitemapInfo.indexUrl ? (
                        <button
                          onClick={() => openSitemapUrl(sitemapInfo.indexUrl!)}
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-white">N/A</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sitemap URLs */}
              <div className="space-y-2">
                <h4 className="font-medium text-white">Sitemap URLs</h4>
                {sitemapInfo.sitemapUrls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg">
                    <span className="text-sm font-mono text-slate-300">{url}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openSitemapUrl(url)}
                        className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-300 rounded transition-colors text-sm"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => generateSitemap('xml', sitemapInfo.needsSitemapIndex ? index : undefined)}
                        disabled={generating}
                        className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded transition-colors text-sm disabled:opacity-50"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 text-white">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => generateSitemap('xml')}
                disabled={generating}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download XML Sitemap
              </button>
              
              <button
                onClick={() => generateSitemap('json')}
                disabled={generating}
                className="flex items-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-200 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download JSON
              </button>
              
              <button
                onClick={loadSitemapInfo}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-200 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Preview */}
          {previewEntries.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4 text-white">Preview (First 10 URLs)</h3>
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-slate-300 font-medium">URL</th>
                        <th className="px-4 py-2 text-left text-slate-300 font-medium">Priority</th>
                        <th className="px-4 py-2 text-left text-slate-300 font-medium">Change Freq</th>
                        <th className="px-4 py-2 text-left text-slate-300 font-medium">Last Modified</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewEntries.map((entry, index) => (
                        <tr key={index} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-2 font-mono text-xs text-slate-300">{entry.url}</td>
                          <td className="px-4 py-2 text-white">{entry.priority.toFixed(1)}</td>
                          <td className="px-4 py-2 capitalize text-white">{entry.changeFrequency}</td>
                          <td className="px-4 py-2 text-white">
                            {new Date(entry.lastModified).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>


      </div>
    </div>
  );
};