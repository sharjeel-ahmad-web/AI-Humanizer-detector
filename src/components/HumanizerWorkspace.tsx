import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Download,
  Bookmark,
  FileText,
  RotateCcw,
  Sliders,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import type { WritingStyle, RewriteIntensity, HumanizeResult, User } from '../types/index.ts';

interface HumanizerWorkspaceProps {
  currentUser: User | null;
  onCreditsUpdated: (newCredits: number) => void;
  onSaveDocument: (doc: { title: string; originalText: string; rewrittenText: string; style: WritingStyle }) => void;
}

const SAMPLE_TEXTS = {
  academic:
    'It is widely observed that the utilization of automated convolutional pipelines facilitates significant efficiencies in visual processing tasks. In order to ascertain the veracity of these claims, empirical evaluations were conducted (Vaswani et al., 2017). The outcome demonstrated that substantial error reduction was achieved.',
  corporate:
    'Due to the fact that cross-functional synergy was insufficient during Q2, it goes without saying that our deliverables suffered delays. In the event that team alignment is prioritized, we can facilitate strategic objectives and leverage core competencies.',
  conversational:
    'Consequently, it is important to remember that people usually delve into social feeds when they have idle time. Furthermore, algorithmic recommendations show that user retention is driven by personalized notifications.',
};

export const HumanizerWorkspace: React.FC<HumanizerWorkspaceProps> = ({
  currentUser,
  onCreditsUpdated,
  onSaveDocument,
}) => {
  const [inputText, setInputText] = useState(SAMPLE_TEXTS.academic);
  const [style, setStyle] = useState<WritingStyle>('academic');
  const [intensity, setIntensity] = useState<RewriteIntensity>('balanced');
  const [preserveCitations, setPreserveCitations] = useState(true);
  const [preserveTerminology, setPreserveTerminology] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<HumanizeResult | null>(null);
  const [activeTab, setActiveTab] = useState<'comparison' | 'sentences' | 'clean'>('comparison');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const estimatedCredits = Math.max(1, Math.ceil(wordCount / 250));

  const handleProcess = async () => {
    if (!inputText.trim()) {
      setErrorMsg('Please enter or paste text to humanize.');
      return;
    }
    setErrorMsg(null);
    setIsProcessing(true);
    setSaved(false);

    try {
      const response = await fetch('/api/v1/humanizer/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser ? { Authorization: `Bearer demo_token` } : {}),
        },
        body: JSON.stringify({
          text: inputText,
          style,
          intensity,
          preserveCitations,
          preserveTerminology,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Humanization failed. Check credit balance.');
      }

      setResult(data.result);
      if (typeof data.result.remainingCredits === 'number') {
        onCreditsUpdated(data.result.remainingCredits);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while contacting humanizer engine.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!result?.rewrittenText) return;
    navigator.clipboard.writeText(result.rewrittenText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!result?.rewrittenText) return;
    const blob = new Blob([result.rewrittenText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AuraHumanize_${style}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (!result) return;
    const title = inputText.slice(0, 40) + '...';
    onSaveDocument({
      title,
      originalText: result.originalText,
      rewrittenText: result.rewrittenText,
      style,
    });
    setSaved(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) setInputText(text);
      };
      reader.readAsText(file);
    } else {
      // Basic text extraction demonstration for .docx/.pdf
      setErrorMsg(`Imported "${file.name}". Text stream loaded.`);
      setInputText(
        `[Extracted from ${file.name}]\n\nRecent advances in natural language processing require balancing algorithmic syntactic fluency with genuine human conversational tone. When sentence structures become overly homogeneous, readability drops sharply.`
      );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Control Header */}
      <div className="bg-white border border-[#E8D8C5] rounded-xl p-5 mb-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#0A192F] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF6B35]" />
              AI Text Humanizer Workspace
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Eliminate robotic AI cadence, improve Flesch reading score, and preserve critical citations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#475569]">Samples:</span>
            <button
              onClick={() => setInputText(SAMPLE_TEXTS.academic)}
              className="text-xs px-2.5 py-1 bg-[#FFF9F0] border border-[#E8D8C5] text-[#0A192F] rounded hover:bg-[#FBEED7] transition-colors cursor-pointer"
            >
              Academic
            </button>
            <button
              onClick={() => setInputText(SAMPLE_TEXTS.corporate)}
              className="text-xs px-2.5 py-1 bg-[#FFF9F0] border border-[#E8D8C5] text-[#0A192F] rounded hover:bg-[#FBEED7] transition-colors cursor-pointer"
            >
              Corporate
            </button>
            <button
              onClick={() => setInputText(SAMPLE_TEXTS.conversational)}
              className="text-xs px-2.5 py-1 bg-[#FFF9F0] border border-[#E8D8C5] text-[#0A192F] rounded hover:bg-[#FBEED7] transition-colors cursor-pointer"
            >
              Conversational
            </button>
          </div>
        </div>

        {/* Options Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-[#F1E4D4]">
          {/* Writing Style */}
          <div>
            <label className="block text-xs font-semibold text-[#0A192F] mb-1.5 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-[#FF6B35]" /> Writing Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as WritingStyle)}
              className="w-full bg-[#FFFDF8] border border-[#E8D8C5] rounded-md px-3 py-1.5 text-xs text-[#0A192F] focus:outline-none focus:border-[#FF6B35] cursor-pointer"
            >
              <option value="academic">Academic &amp; Research</option>
              <option value="professional">Professional / Executive</option>
              <option value="conversational">Conversational &amp; Engaging</option>
              <option value="simple">Simple English (Clear &amp; Plain)</option>
              <option value="formal">Formal Publication</option>
            </select>
          </div>

          {/* Intensity */}
          <div>
            <label className="block text-xs font-semibold text-[#0A192F] mb-1.5">Rewrite Intensity</label>
            <div className="grid grid-cols-3 gap-1 bg-[#FFF9F0] p-1 border border-[#E8D8C5] rounded-md">
              {(['light', 'balanced', 'extensive'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setIntensity(lvl)}
                  className={`text-[11px] py-1 rounded capitalize font-medium transition-colors cursor-pointer ${
                    intensity === lvl
                      ? 'bg-[#FF6B35] text-white font-semibold'
                      : 'text-[#475569] hover:bg-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Citation Toggles */}
          <div className="flex flex-col justify-center">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#0A192F]">
              <input
                type="checkbox"
                checked={preserveCitations}
                onChange={(e) => setPreserveCitations(e.target.checked)}
                className="accent-[#FF6B35] rounded cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-700" /> Preserve Citations &amp; Quotes
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#0A192F] mt-2">
              <input
                type="checkbox"
                checked={preserveTerminology}
                onChange={(e) => setPreserveTerminology(e.target.checked)}
                className="accent-[#FF6B35] rounded cursor-pointer"
              />
              <span>Retain Domain Jargon</span>
            </label>
          </div>

          {/* Action Trigger */}
          <div className="flex flex-col justify-end">
            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 bg-[#FF6B35] hover:bg-[#E8551E] disabled:bg-[#FFA580] text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                  Synthesizing Flow...
                </>
              ) : (
                <>
                  Humanize Text ({estimatedCredits} {estimatedCredits === 1 ? 'Credit' : 'Credits'})
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Editor & Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Editor */}
        <div className="bg-white border border-[#E8D8C5] rounded-xl flex flex-col shadow-xs overflow-hidden">
          <div className="bg-[#FFFDF9] border-b border-[#E8D8C5] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FF6B35]" />
              <span className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">
                Original Input Text
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#64748B]">
              <span>{wordCount} words</span>
              <span>&bull;</span>
              <span>{inputText.length} chars</span>
              <label className="text-[#FF6B35] hover:underline font-medium cursor-pointer">
                Upload File (.txt, .docx)
                <input type="file" accept=".txt,.docx,.pdf" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your paper, essay, article, or draft here..."
            className="w-full flex-1 min-h-[360px] p-4 text-sm leading-relaxed text-[#0A192F] focus:outline-none resize-none bg-white font-normal"
          />

          <div className="p-3 bg-[#FFFDF8] border-t border-[#E8D8C5] flex items-center justify-between text-xs text-[#64748B]">
            <span>Supported: TXT, DOCX, Markdown, Copied Drafts</span>
            <button
              onClick={() => setInputText('')}
              className="text-[#64748B] hover:text-[#0A192F] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          </div>
        </div>

        {/* Right: Humanized Output Panel */}
        <div className="bg-white border border-[#E8D8C5] rounded-xl flex flex-col shadow-xs overflow-hidden">
          <div className="bg-[#FFFDF9] border-b border-[#E8D8C5] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#0A192F] uppercase tracking-wider mr-2">
                Humanized Output
              </span>
              <div className="flex items-center gap-1 bg-[#FFF9F0] p-0.5 border border-[#E8D8C5] rounded">
                <button
                  onClick={() => setActiveTab('comparison')}
                  className={`text-[11px] px-2 py-0.5 rounded font-medium cursor-pointer ${
                    activeTab === 'comparison' ? 'bg-[#FF6B35] text-white font-semibold' : 'text-[#475569]'
                  }`}
                >
                  Side Diff
                </button>
                <button
                  onClick={() => setActiveTab('sentences')}
                  className={`text-[11px] px-2 py-0.5 rounded font-medium cursor-pointer ${
                    activeTab === 'sentences' ? 'bg-[#FF6B35] text-white font-semibold' : 'text-[#475569]'
                  }`}
                >
                  Sentence Changes
                </button>
                <button
                  onClick={() => setActiveTab('clean')}
                  className={`text-[11px] px-2 py-0.5 rounded font-medium cursor-pointer ${
                    activeTab === 'clean' ? 'bg-[#FF6B35] text-white font-semibold' : 'text-[#475569]'
                  }`}
                >
                  Clean Text
                </button>
              </div>
            </div>

            {result && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 text-xs border border-[#E8D8C5] rounded bg-white hover:bg-[#FFF9F0] text-[#0A192F] flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownloadTxt}
                  className="px-2.5 py-1 text-xs border border-[#E8D8C5] rounded bg-white hover:bg-[#FFF9F0] text-[#0A192F] flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> TXT
                </button>
                <button
                  onClick={handleSave}
                  className="px-2.5 py-1 text-xs bg-[#FF6B35] hover:bg-[#E8551E] text-white font-medium rounded flex items-center gap-1 cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" /> {saved ? 'Saved!' : 'Save'}
                </button>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-[360px] p-4 overflow-y-auto">
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#64748B]">
                <div className="w-12 h-12 rounded-full bg-[#FFF9F0] border border-[#E8D8C5] flex items-center justify-center text-[#FF6B35] mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#0A192F]">Ready to Humanize</h4>
                <p className="text-xs text-[#64748B] max-w-sm mt-1">
                  Click the humanize button above to rewrite your draft into natural, fluent human prose while preserving citations and facts.
                </p>
              </div>
            ) : activeTab === 'comparison' ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-lg text-xs leading-relaxed text-[#0A192F]">
                  <div className="font-semibold text-emerald-800 mb-1 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" /> Enhanced Readability &amp; Human Cadence
                  </div>
                  {result.rewrittenText}
                </div>

                {/* Score Comparison Badge Grid */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-[#FFF9F0] border border-[#E8D8C5] p-3 rounded-lg text-center">
                    <div className="text-[11px] font-semibold text-[#64748B]">Flesch Reading Ease</div>
                    <div className="text-base font-extrabold text-[#0A192F] mt-0.5">
                      {result.improvedMetrics.fleschReadingEase}
                      <span className="text-xs text-emerald-700 font-semibold ml-1.5">
                        (+{Math.round(result.improvedMetrics.fleschReadingEase - result.originalMetrics.fleschReadingEase)})
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#FFF9F0] border border-[#E8D8C5] p-3 rounded-lg text-center">
                    <div className="text-[11px] font-semibold text-[#64748B]">Grade Level</div>
                    <div className="text-base font-extrabold text-[#0A192F] mt-0.5">
                      Grade {result.improvedMetrics.fleschKincaidGrade}
                    </div>
                  </div>

                  <div className="bg-[#FFF9F0] border border-[#E8D8C5] p-3 rounded-lg text-center">
                    <div className="text-[11px] font-semibold text-[#64748B]">Citations Retained</div>
                    <div className="text-base font-extrabold text-[#0A192F] mt-0.5">
                      {result.preservedCitations.length}
                    </div>
                  </div>
                </div>

                {result.preservedCitations.length > 0 && (
                  <div className="p-2.5 bg-[#FFFDF8] border border-[#E8D8C5] rounded-md text-xs">
                    <span className="font-semibold text-[#0A192F] mr-2">Preserved References:</span>
                    <div className="inline-flex flex-wrap gap-1 mt-1">
                      {result.preservedCitations.map((c, i) => (
                        <span key={i} className="citation-badge">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === 'sentences' ? (
              <div className="space-y-3">
                <p className="text-xs text-[#64748B] mb-2">
                  Line-by-line editorial changes made to break algorithmic predictability:
                </p>
                {result.sentenceComparisons.map((item, idx) => (
                  <div key={idx} className="p-3 border border-[#E8D8C5] rounded-lg bg-[#FFFDF9] text-xs">
                    <div className="text-red-800 line-through mb-1.5 opacity-80">{item.original}</div>
                    <div className="text-emerald-900 font-medium">{item.rewritten}</div>
                    <div className="mt-2 text-[10px] text-[#64748B] flex items-center justify-between">
                      <span className="capitalize px-1.5 py-0.5 bg-white border border-[#E8D8C5] rounded font-semibold text-[#0A192F]">
                        {item.changeType}
                      </span>
                      <span>{item.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm leading-relaxed text-[#0A192F] whitespace-pre-wrap font-normal">
                {result.rewrittenText}
              </div>
            )}
          </div>

          {result && (
            <div className="p-3 bg-[#FFFDF8] border-t border-[#E8D8C5] flex items-center justify-between text-xs text-[#64748B]">
              <span>Processed in {result.processingTimeMs}ms</span>
              <span>Deducted {result.creditsDeducted} credits</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
