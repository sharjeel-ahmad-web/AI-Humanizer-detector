import React, { useState } from 'react';
import {
  Search,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Info,
  CheckCircle2,
  FileSearch,
  BookOpen,
} from 'lucide-react';
import type { PlagiarismResult, User } from '../types/index.ts';

interface PlagiarismWorkspaceProps {
  currentUser: User | null;
  onCreditsUpdated: (newCredits: number) => void;
}

const SAMPLE_TEXT_WITH_MATCHES =
  'Machine learning algorithms build a mathematical model based on sample data to make predictions or decisions without being explicitly programmed. In addition, appropriate citation of foundational sources is indispensable to scholarly integrity (Sweller et al., 1998). When information is presented in an overly dense manner, humans struggle to comprehend core tenets.';

const SAMPLE_ORIGINAL_TEXT =
  'Our experimental methodology integrated randomized field trials across three diverse geographical regions. By tracking behavioral friction in real-time, the project team identified unexpected variances in digital adoption rates during the final evaluation quarter.';

export const PlagiarismWorkspace: React.FC<PlagiarismWorkspaceProps> = ({
  currentUser,
  onCreditsUpdated,
}) => {
  const [inputText, setInputText] = useState(SAMPLE_TEXT_WITH_MATCHES);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const estimatedCredits = Math.max(1, Math.ceil(wordCount / 250) * 2);

  const handleScan = async () => {
    if (!inputText.trim()) {
      setErrorMsg('Please input text to analyze for similarity.');
      return;
    }
    setErrorMsg(null);
    setIsScanning(true);

    try {
      const response = await fetch('/api/v1/plagiarism/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser ? { Authorization: `Bearer demo_token` } : {}),
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Plagiarism scan failed.');
      }

      setResult(data.result);
      if (typeof data.result.remainingCredits === 'number') {
        onCreditsUpdated(data.result.remainingCredits);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while running similarity analysis.');
    } finally {
      setIsScanning(false);
    }
  };

  // Helper to color-code the similarity badge
  const getBadgeColor = (percent: number) => {
    if (percent <= 15) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (percent <= 30) return 'text-amber-800 bg-amber-50 border-amber-300';
    return 'text-rose-800 bg-rose-50 border-rose-300';
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header Card */}
      <div className="bg-white border border-[#E8D8C5] rounded-xl p-5 mb-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#0A192F] flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-[#FF6B35]" />
              Plagiarism &amp; Text Similarity Detector
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Multi-layer exact N-gram, token overlap, and semantic similarity check against open research corpora.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#475569]">Preset:</span>
            <button
              onClick={() => setInputText(SAMPLE_TEXT_WITH_MATCHES)}
              className="text-xs px-2.5 py-1 bg-[#FFF9F0] border border-[#E8D8C5] text-[#0A192F] rounded hover:bg-[#FBEED7] transition-colors cursor-pointer"
            >
              Academic Overlap Sample
            </button>
            <button
              onClick={() => setInputText(SAMPLE_ORIGINAL_TEXT)}
              className="text-xs px-2.5 py-1 bg-[#FFF9F0] border border-[#E8D8C5] text-[#0A192F] rounded hover:bg-[#FBEED7] transition-colors cursor-pointer"
            >
              Clean Original Text
            </button>
          </div>
        </div>

        {/* Input & Action */}
        <div className="mt-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste text here to run plagiarism scan..."
            className="w-full h-36 p-4 text-sm text-[#0A192F] bg-[#FFFDF9] border border-[#E8D8C5] rounded-lg focus:outline-none focus:border-[#FF6B35] resize-none"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#64748B] flex items-center gap-3">
              <span>{wordCount} words</span>
              <span>&bull;</span>
              <span>Cost: {estimatedCredits} Credits</span>
              <span>&bull;</span>
              <span>Searches Academic &amp; Open Web Corpora</span>
            </div>

            <button
              onClick={handleScan}
              disabled={isScanning}
              className="py-2 px-5 bg-[#FF6B35] hover:bg-[#E8551E] disabled:bg-[#FFA580] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              {isScanning ? (
                <>
                  <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                  Scanning Corpus Tokens...
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  Run Plagiarism Check
                </>
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Analysis Results View */}
      {result && (
        <div className="space-y-6">
          {/* Top Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E8D8C5] rounded-xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-[#64748B]">Overall Similarity</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-[#0A192F]">
                  {result.overallSimilarityPercent}%
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getBadgeColor(result.overallSimilarityPercent)}`}>
                  {result.overallSimilarityPercent <= 15 ? 'Low Match' : result.overallSimilarityPercent <= 30 ? 'Moderate' : 'High Overlap'}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                {result.matchedTokens} of {result.totalTokens} tokens matched
              </p>
            </div>

            <div className="bg-white border border-[#E8D8C5] rounded-xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-[#64748B]">Exact Sentence Matches</span>
              <div className="text-3xl font-extrabold text-[#0A192F] mt-1">
                {result.exactMatchPercent}%
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                Identical word sequences found
              </p>
            </div>

            <div className="bg-white border border-[#E8D8C5] rounded-xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-[#64748B]">Semantic Overlap</span>
              <div className="text-3xl font-extrabold text-[#0A192F] mt-1">
                {result.semanticMatchPercent}%
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                Paraphrased or structural similarities
              </p>
            </div>

            <div className="bg-white border border-[#E8D8C5] rounded-xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-[#64748B]">Citations Validated</span>
              <div className="text-3xl font-extrabold text-emerald-700 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                {result.detectedCitations.length}
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                Attributed citations recognized
              </p>
            </div>
          </div>

          {/* Matched Passages & Sources Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Matched Text View */}
            <div className="lg:col-span-2 bg-white border border-[#E8D8C5] rounded-xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#0A192F] mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#FF6B35]" />
                Highlighted Text Analysis
              </h3>

              {result.matches.length === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No substantial plagiarism or matching passages detected against our active reference corpus!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[#64748B]">
                    The following segments share high overlap with existing sources. Review to ensure proper quotation and citation:
                  </p>
                  {result.matches.map((m, idx) => (
                    <div key={idx} className="p-3 bg-[#FFFDF9] border border-[#E8D8C5] rounded-lg text-xs">
                      <div className="font-medium text-[#0A192F] bg-orange-50/70 p-2 rounded border-l-2 border-[#FF6B35]">
                        &ldquo;{m.matchedText}&rdquo;
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] text-[#64748B]">
                        <span className="font-semibold text-[#0A192F]">
                          Match Type: <span className="uppercase text-[#FF6B35]">{m.similarityType}</span> ({m.confidence}% confidence)
                        </span>
                        <span className="text-slate-500">Source: {m.sourceTitle}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Legal / Academic Disclaimer */}
              <div className="mt-5 p-3.5 bg-[#FFF9F0] border border-[#E8D8C5] rounded-lg text-xs text-[#475569] flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#FF6B35] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#0A192F] mb-0.5">Important Disclosure</div>
                  <p className="leading-relaxed">
                    {result.disclaimer} Similarity percentage does not constitute academic misconduct. Always verify whether quoted text was intentionally cited and attributed.
                  </p>
                </div>
              </div>
            </div>

            {/* Sources Checked Panel */}
            <div className="bg-white border border-[#E8D8C5] rounded-xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#0A192F] mb-3 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-[#FF6B35]" />
                Sources Found ({result.matches.length})
              </h3>

              {result.matches.length === 0 ? (
                <p className="text-xs text-[#64748B]">No overlapping external links found.</p>
              ) : (
                <div className="space-y-3">
                  {result.matches.map((m, idx) => (
                    <div key={idx} className="p-3 bg-[#FFFDF8] border border-[#E8D8C5] rounded-lg text-xs">
                      <div className="font-bold text-[#0A192F]">{m.sourceTitle}</div>
                      <a
                        href={m.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#FF6B35] hover:underline text-[11px] flex items-center gap-1 mt-1 truncate"
                      >
                        {m.sourceUrl} <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-[#F1E4D4] text-[11px] text-[#64748B]">
                Searched {result.queriedSourcesCount} specialized academic and scientific repository domains.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
