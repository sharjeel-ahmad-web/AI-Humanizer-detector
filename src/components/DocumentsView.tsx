import React, { useState, useEffect } from 'react';
import { FileText, Trash2, Download, Search, Calendar, CheckCircle } from 'lucide-react';
import type { SavedDocument } from '../types/index.ts';

interface DocumentsViewProps {
  onSelectDocument?: (doc: SavedDocument) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = () => {
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<SavedDocument | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/documents');
      const data = await res.json();
      if (data.success && Array.isArray(data.documents)) {
        setDocuments(data.documents);
        if (data.documents.length > 0 && !selectedDoc) {
          setSelectedDoc(data.documents[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load documents:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/documents/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        if (selectedDoc?.id === id) {
          setSelectedDoc(null);
        }
      }
    } catch (e) {
      console.error('Error deleting doc:', e);
    }
  };

  const handleDownload = (doc: SavedDocument) => {
    const content = doc.rewrittenText || doc.originalText;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.originalText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white border border-[#E8D8C5] rounded-xl p-5 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0A192F] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FF6B35]" />
            Saved Documents &amp; Version History
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage your humanized drafts, reports, and original input documents.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#FFFDF9] border border-[#E8D8C5] rounded-md text-xs text-[#0A192F] focus:outline-none focus:border-[#FF6B35]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Documents List */}
        <div className="bg-white border border-[#E8D8C5] rounded-xl p-4 shadow-xs">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3">
            Your Library ({filteredDocs.length})
          </h3>

          {loading ? (
            <p className="text-xs text-[#64748B] p-4 text-center">Loading library...</p>
          ) : filteredDocs.length === 0 ? (
            <p className="text-xs text-[#64748B] p-4 text-center">No documents found.</p>
          ) : (
            <div className="space-y-2">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedDoc?.id === doc.id
                      ? 'border-[#FF6B35] bg-[#FFF9F0]'
                      : 'border-[#E8D8C5] bg-[#FFFDF9] hover:bg-[#FDF6ED]'
                  }`}
                >
                  <div className="font-bold text-xs text-[#0A192F] truncate">{doc.title}</div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#64748B]">
                    <span>{doc.wordCount} words</span>
                    <span className="capitalize px-1.5 py-0.2 bg-white border border-[#E8D8C5] rounded">
                      {doc.style || 'academic'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Document Viewer */}
        <div className="lg:col-span-2 bg-white border border-[#E8D8C5] rounded-xl p-6 shadow-xs">
          {!selectedDoc ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-[#64748B]">
              <FileText className="w-8 h-8 text-[#FF6B35] mb-2 opacity-60" />
              <p className="text-xs">Select a document from the library to view details.</p>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#F1E4D4]">
                <div>
                  <h3 className="text-base font-bold text-[#0A192F]">{selectedDoc.title}</h3>
                  <div className="text-xs text-[#64748B] mt-1 flex items-center gap-3">
                    <span>{selectedDoc.wordCount} words</span>
                    <span>&bull;</span>
                    <span>Style: {selectedDoc.style || 'academic'}</span>
                    {typeof selectedDoc.similarityScore === 'number' && (
                      <>
                        <span>&bull;</span>
                        <span className="text-emerald-700 font-semibold">
                          Similarity: {selectedDoc.similarityScore}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(selectedDoc)}
                    className="px-3 py-1.5 border border-[#E8D8C5] rounded-md bg-white hover:bg-[#FFF9F0] text-xs font-semibold text-[#0A192F] flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download TXT
                  </button>
                  <button
                    onClick={() => handleDelete(selectedDoc.id)}
                    className="p-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rewritten Text Section */}
              {selectedDoc.rewrittenText && (
                <div className="mt-5">
                  <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider mb-2 flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Humanized Revision
                  </h4>
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200/60 rounded-lg text-xs leading-relaxed text-[#0A192F] whitespace-pre-wrap">
                    {selectedDoc.rewrittenText}
                  </div>
                </div>
              )}

              {/* Original Text Section */}
              <div className="mt-5">
                <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider mb-2 text-[#64748B]">
                  Original Submission Text
                </h4>
                <div className="p-4 bg-[#FFFDF9] border border-[#E8D8C5] rounded-lg text-xs leading-relaxed text-[#475569] whitespace-pre-wrap">
                  {selectedDoc.originalText}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
