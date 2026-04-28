'use client';

import React, { useState } from 'react';
import { X, Share2, Loader2, AlertCircle, CheckCircle, Eye, MessageSquare, Edit3 } from 'lucide-react';
import { ShareService } from '@/lib/services/ShareService';

interface ShareModalProps {
  dashboardId: string;
  dashboardName: string;
  onClose: () => void;
}

export function ShareModal({ dashboardId, dashboardName, onClose }: ShareModalProps) {
  const [email, setEmail] = useState('');
  const [canView, setCanView] = useState(true);
  const [canComment, setCanComment] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleShare = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await ShareService.shareDashboard(
        dashboardId,
        email.trim(),
        { can_view: canView, can_comment: canComment, can_edit: canEdit },
        message.trim() || undefined
      );
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share dashboard');
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 text-center">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Dashboard Shared!</h2>
          <p className="text-gray-600">
            <strong>{dashboardName}</strong> has been shared with <strong>{email}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <div className="flex items-center gap-2">
            <Share2 size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Share Dashboard</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div>
            <p className="text-sm text-gray-500 mb-1">Sharing: <strong>{dashboardName}</strong></p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Privileges</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="checkbox" checked={canView} onChange={e => setCanView(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                <Eye size={18} className="text-blue-500" />
                <div>
                  <span className="text-sm font-medium text-gray-800">Can View</span>
                  <p className="text-xs text-gray-500">View the dashboard and its charts</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="checkbox" checked={canComment} onChange={e => setCanComment(e.target.checked)} className="w-4 h-4 accent-amber-600" />
                <MessageSquare size={18} className="text-amber-500" />
                <div>
                  <span className="text-sm font-medium text-gray-800">Can Comment</span>
                  <p className="text-xs text-gray-500">Add comments and feedback</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="checkbox" checked={canEdit} onChange={e => setCanEdit(e.target.checked)} className="w-4 h-4 accent-green-600" />
                <Edit3 size={18} className="text-green-500" />
                <div>
                  <span className="text-sm font-medium text-gray-800">Can Edit</span>
                  <p className="text-xs text-gray-500">Modify and edit the dashboard</p>
                </div>
              </label>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Why are you sharing this dashboard?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-gray-50 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={saving || !email.trim()}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
            {saving ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
}
