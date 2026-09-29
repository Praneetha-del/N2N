import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Download, File, Video, Calendar, User, 
  BookOpen, Tag, Clock, Sparkles, FileText, Eye,
  ExternalLink, Lock, Loader2, Building, Hash, CheckCircle2
} from 'lucide-react';
import materialService from '../../services/materialService';
import aiService from '../../services/aiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import toast from 'react-hot-toast';

const MaterialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [hasSummary, setHasSummary] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const fetchMaterial = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await materialService.getMaterialById(id);
      if (response && response.success) {
        setMaterial(response.data);
        checkSummary();
      } else {
        setError('Material not found');
      }
    } catch (error) {
      console.error('Error fetching material:', error);
      setError(error.response?.data?.message || 'Failed to load material');
    } finally {
      setLoading(false);
    }
  };

  const checkSummary = async () => {
    try {
      const response = await aiService.getSummary(id);
      if (response && response.data) {
        setSummary(response.data);
        setHasSummary(true);
      }
    } catch (error) {
      // Summary not yet generated
    }
  };

  const generateSummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await aiService.generateSummary(id);
      if (response && response.success) {
        setSummary(response.data);
        setHasSummary(true);
        toast.success('AI summary generated!');
      } else {
        toast.error('Failed to generate summary');
      }
    } catch (error) {
      console.error('Summary error:', error);
      toast.error('Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloadLoading(true);
    try {
      const blob = await materialService.downloadMaterial(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = material?.fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    } finally {
      setDownloadLoading(false);
    }
  };

  const getFileUrl = () => {
    if (material?.fileUrl) return material.fileUrl;
    if (material?.youTubeUrl) return material.youTubeUrl;
    return null;
  };

  const canPreview = () => {
    if (!material) return false;
    const type = material.type?.toLowerCase() || '';
    const fileUrl = getFileUrl();
    if (!fileUrl) return false;
    if (type === 'youtube' || type === 'video') return true;
    if (type === 'pdf') return true;
    if (fileUrl.includes('cloudinary')) return true;
    return false;
  };

  const getYouTubeEmbedUrl = () => {
    if (!material?.youTubeUrl) return null;
    let url = material.youTubeUrl;
    if (url.includes('watch?v=')) {
      url = url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        url = `https://www.youtube.com/embed/${videoId}`;
      }
    }
    return url;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !material) {
    return <ErrorState message={error || 'Material not found'} onRetry={fetchMaterial} />;
  }

  if (material.status === 'BLOCKED') {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-rose-200 rounded-2xl text-center shadow-sm">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Lock size={24} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Material Moderated</h2>
        <p className="text-xs text-slate-500 mb-4">
          This study material is currently blocked by the academic administrator.
        </p>
        <Link to="/materials" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          ← Return to Materials Catalog
        </Link>
      </div>
    );
  }

  const isYouTube = material.type === 'VIDEO' || material.type === 'YOUTUBE' || material.youTubeUrl;
  const fileUrl = getFileUrl();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Materials
      </button>

      {/* Main Material Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden p-6 sm:p-8">
        {/* Header badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {material.type || 'DOCUMENT'}
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
              {material.departmentName || material.department || 'All Depts'}
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isYouTube && material.status === 'ACTIVE' && (
              <button
                onClick={handleDownload}
                disabled={downloadLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
              >
                {downloadLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                Download File
              </button>
            )}
            {isYouTube && material.youTubeUrl && (
              <a
                href={material.youTubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                <ExternalLink size={14} />
                Watch on YouTube
              </a>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl font-bold text-[#163A70] mb-2">
          {material.title || 'Untitled Material'}
        </h1>
        {material.description && (
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            {material.description}
          </p>
        )}

        {/* Preview Container */}
        {fileUrl && canPreview() && (
          <div className="mb-6 rounded-xl overflow-hidden border border-slate-200">
            {isYouTube ? (
              <div className="aspect-video bg-slate-900">
                <iframe
                  src={getYouTubeEmbedUrl()}
                  className="w-full h-full"
                  allowFullScreen
                  title={material.title || 'Video'}
                />
              </div>
            ) : material.type?.toLowerCase() === 'pdf' ? (
              <div className="w-full bg-slate-50" style={{ height: '520px' }}>
                <iframe
                  src={fileUrl}
                  className="w-full h-full"
                  title={material.title || 'PDF Preview'}
                />
              </div>
            ) : (
              <div className="bg-slate-50 p-8 text-center">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">{material.fileName || 'Attachment'}</p>
                {material.fileSize && (
                  <p className="text-xs text-slate-400 mt-1">
                    {(material.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Academic Details Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Subject</p>
            <p className="text-xs font-bold text-[#163A70] truncate mt-0.5">{material.subjectName || material.subject || 'General'}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Academic Year</p>
            <p className="text-xs font-bold text-slate-800 mt-0.5">Year {material.academicYear || material.year || '1'}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Semester</p>
            <p className="text-xs font-bold text-slate-800 mt-0.5">Semester {material.semester || '1'}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Faculty Author</p>
            <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{material.uploadedByName || 'Faculty Member'}</p>
          </div>
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#163A70]">AI Academic Summary</h2>
              <p className="text-xs text-slate-400">Key takeaway concepts extracted by StudyHub AI</p>
            </div>
          </div>
          {!hasSummary && !summaryLoading && (
            <button
              onClick={generateSummary}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <Sparkles size={13} />
              Generate Summary
            </button>
          )}
        </div>

        {summaryLoading ? (
          <div className="flex items-center justify-center py-8 text-xs text-slate-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Analyzing material contents and generating summary...</span>
          </div>
        ) : hasSummary && summary ? (
          <div className="space-y-4 pt-2">
            {summary.summary && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-700 leading-relaxed">{summary.summary}</p>
              </div>
            )}
            {summary.keyPoints && summary.keyPoints.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Key Takeaways</h4>
                <ul className="space-y-1.5">
                  {summary.keyPoints.map((point, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {summary.importantConcepts && summary.importantConcepts.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Key Concepts</h4>
                <div className="flex flex-wrap gap-1.5">
                  {summary.importantConcepts.map((concept, i) => (
                    <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-medium">
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-3">
            Click "Generate Summary" to instantly summarize this study material with AI.
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default MaterialDetail;