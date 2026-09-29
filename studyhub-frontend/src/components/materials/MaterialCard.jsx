import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  File, 
  Download, 
  Eye, 
  Trash2, 
  Edit, 
  FileText, 
  Video, 
  FileImage,
  ExternalLink,
  BookOpen,
  User,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import materialService from '../../services/materialService';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../common/ConfirmDialog';

const MaterialCard = ({ material, onUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOwner = user?.id === material.uploadedBy || user?.id === material.uploadedById;
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const getFileIcon = () => {
    const type = material.type?.toLowerCase() || '';
    if (type === 'pdf') return <FileText className="w-5 h-5 text-[#2563EB]" />;
    if (type === 'video' || type === 'youtube') return <Video className="w-5 h-5 text-rose-500" />;
    if (type === 'ppt' || type === 'pptx') return <FileImage className="w-5 h-5 text-amber-500" />;
    return <FileText className="w-5 h-5 text-slate-500" />;
  };

  const getTypeBadge = () => {
    const type = (material.type || 'PDF').toUpperCase();
    if (type === 'VIDEO' || type === 'YOUTUBE') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          Video Lecture
        </span>
      );
    }
    if (type === 'PDF') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EFF6FF] text-[#163A70] border border-blue-200">
          PDF Note
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        {type}
      </span>
    );
  };

  const handleView = () => {
    navigate(`/materials/${material.id}`);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const blob = await materialService.downloadMaterial(material.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = material.fileName || `${material.title || 'material'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await materialService.deleteMaterial(material.id);
      toast.success('Material deleted successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to delete material');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEdit = () => {
    navigate(`/materials/edit/${material.id}`);
  };

  const handleOpenYouTube = (e) => {
    e.stopPropagation();
    if (material.youTubeUrl) {
      window.open(material.youTubeUrl, '_blank');
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-blue-200 hover:shadow-md transition-all p-5 flex flex-col justify-between group">
        <div>
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-center justify-center">
                {getFileIcon()}
              </div>
              {getTypeBadge()}
            </div>

            {material.status === 'BLOCKED' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                BLOCKED
              </span>
            )}
          </div>

          {/* Title & Description */}
          <h3 
            onClick={handleView}
            className="font-bold text-base text-[#163A70] group-hover:text-[#2563EB] cursor-pointer line-clamp-1 transition-colors"
          >
            {material.title || 'Untitled Material'}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-4 leading-relaxed">
            {material.description || 'No description provided for this academic resource.'}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="px-2.5 py-1 bg-[#EFF6FF] text-[#163A70] text-xs font-semibold rounded-md border border-blue-100">
              {material.subjectName || material.subject || 'General'}
            </span>
            <span className="px-2.5 py-1 bg-[#F8FAFC] text-slate-600 text-xs font-medium rounded-md border border-slate-200">
              Year {material.academicYear || material.year || 'N/A'} • Sem {material.semester || 'N/A'}
            </span>
          </div>

          {/* Meta Info */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5 truncate">
              <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                {material.uploadedByName?.charAt(0) || 'F'}
              </div>
              <span className="truncate font-medium text-slate-700">
                {material.uploadedByName || 'Faculty'}
              </span>
            </div>
            <span className="text-slate-400 text-[11px] flex-shrink-0">
              {material.createdAt ? new Date(material.createdAt).toLocaleDateString() : ''}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={handleView}
            className="flex-1 py-2 px-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Open</span>
          </button>

          {material.fileUrl && (
            <button
              onClick={handleDownload}
              disabled={loading}
              className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
              title="Download File"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
            </button>
          )}

          {material.youTubeUrl && (
            <button
              onClick={handleOpenYouTube}
              className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
              title="Watch on YouTube"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {(isOwner || isAdmin) && (
            <>
              <button
                onClick={handleEdit}
                className="p-2 text-slate-500 hover:text-[#2563EB] hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
                title="Edit Details"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
                title="Delete Material"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Study Material"
        message={`Are you sure you want to delete "${material.title}"? This cannot be undone.`}
        confirmText="Delete Material"
        cancelText="Cancel"
        loading={loading}
      />
    </>
  );
};

export default MaterialCard;