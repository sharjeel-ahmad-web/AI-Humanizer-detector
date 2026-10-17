import React, { useState } from 'react';
import { Smartphone, Code, Terminal, Check, Copy, ArrowRight, Server, ShieldCheck } from 'lucide-react';

export const MobileApiDocsView: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [testEndpointResult, setTestEndpointResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleTestApi = async () => {
    setIsTesting(true);
    setTestEndpointResult(null);
    try {
      const res = await fetch('/api/v1/mobile/spec');
      const data = await res.json();
      setTestEndpointResult(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setTestEndpointResult(`Error: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const reactNativeSnippet = `// React Native (AuraHumanizeClient.ts)
// Compatible with Expo & React Native CLI on Android / iOS
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://YOUR_BACKEND_URL/api/v1';

// 1. Authenticate user & store JWT token
export async function loginUser(email, password) {
  const response = await fetch(\`\${API_BASE_URL}/auth/login\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (data.token) {
    await AsyncStorage.setItem('@aura_token', data.token);
  }
  return data;
}

// 2. Humanize text on Android device
export async function humanizeText(text, style = 'academic') {
  const token = await AsyncStorage.getItem('@aura_token');
  const response = await fetch(\`\${API_BASE_URL}/humanizer/process\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`,
    },
    body: JSON.stringify({
      text,
      style,
      intensity: 'balanced',
      preserveCitations: true
    }),
  });
  return await response.json();
}

// 3. Check Plagiarism & Text Similarity
export async function checkPlagiarism(text) {
  const token = await AsyncStorage.getItem('@aura_token');
  const response = await fetch(\`\${API_BASE_URL}/plagiarism/check\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`,
    },
    body: JSON.stringify({ text }),
  });
  return await response.json();
}`;

  const curlSnippet = `# Test Humanizer via cURL from any terminal or mobile test script
curl -X POST http://localhost:3000/api/v1/humanizer/process \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "text": "It is observed that the utilization of convolutional models improves accuracy.",
    "style": "academic",
    "intensity": "balanced",
    "preserveCitations": true
  }'`;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Intro Banner */}
      <div className="bg-white border border-[#E8D8C5] rounded-xl p-6 mb-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFF9F0] border border-[#E8D8C5] rounded-md text-xs font-bold text-[#FF6B35] mb-2">
              <Smartphone className="w-3.5 h-3.5" /> Ready for React Native &amp; Android
            </div>
            <h2 className="text-2xl font-extrabold text-[#0A192F] tracking-tight">
              Android &amp; React Native Mobile API Architecture
            </h2>
            <p className="text-sm text-[#475569] mt-1 max-w-2xl leading-relaxed">
              As requested, the entire backend is architected with a decoupled REST API standard. Any future Android or iOS application built with React Native, Flutter, or native Kotlin can connect directly without rewriting backend logic.
            </p>
          </div>

          <button
            onClick={handleTestApi}
            disabled={isTesting}
            className="px-4 py-2.5 bg-[#FF6B35] hover:bg-[#E8551E] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Server className="w-4 h-4" />
            {isTesting ? 'Pinging API...' : 'Test Mobile API Spec'}
          </button>
        </div>

        {/* Live Test Output */}
        {testEndpointResult && (
          <div className="mt-4 p-4 bg-[#0A192F] text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto max-h-48">
            <pre>{testEndpointResult}</pre>
          </div>
        )}
      </div>

      {/* Grid of Key Features for Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white border border-[#E8D8C5] rounded-xl p-5 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-[#FFF9F0] border border-[#E8D8C5] flex items-center justify-center text-[#FF6B35] mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#0A192F]">Bearer JWT Authentication</h3>
          <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
            Stateless JWT tokens passed via standard <code>Authorization: Bearer</code> headers. Perfect for AsyncStorage or SecureStore on Android.
          </p>
        </div>

        <div className="bg-white border border-[#E8D8C5] rounded-xl p-5 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-[#FFF9F0] border border-[#E8D8C5] flex items-center justify-center text-[#FF6B35] mb-3">
            <Code className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#0A192F]">Uniform JSON Schemas</h3>
          <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
            All endpoints emit consistent <code>{`{ success: true, result: ... }`}</code> and <code>{`{ success: false, error: ... }`}</code> structures.
          </p>
        </div>

        <div className="bg-white border border-[#E8D8C5] rounded-xl p-5 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-[#FFF9F0] border border-[#E8D8C5] flex items-center justify-center text-[#FF6B35] mb-3">
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#0A192F]">CORS &amp; Network Friendly</h3>
          <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
            Full cross-origin resource sharing headers configured for local Android emulators (`10.0.2.2:3000`) and remote cloud hosts.
          </p>
        </div>
      </div>

      {/* Code Snippets Section */}
      <div className="space-y-6">
        {/* React Native Code */}
        <div className="bg-white border border-[#E8D8C5] rounded-xl overflow-hidden shadow-xs">
          <div className="bg-[#FFFDF9] border-b border-[#E8D8C5] px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#FF6B35]" />
              <span className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">
                React Native Integration Client (Copy &amp; Paste into mobile app)
              </span>
            </div>
            <button
              onClick={() => copyCode(reactNativeSnippet, 'rn')}
              className="text-xs text-[#0A192F] hover:text-[#FF6B35] flex items-center gap-1 font-medium cursor-pointer"
            >
              {copiedIndex === 'rn' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedIndex === 'rn' ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <div className="p-4 bg-[#0A192F] text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
            <pre>{reactNativeSnippet}</pre>
          </div>
        </div>

        {/* cURL Code */}
        <div className="bg-white border border-[#E8D8C5] rounded-xl overflow-hidden shadow-xs">
          <div className="bg-[#FFFDF9] border-b border-[#E8D8C5] px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#FF6B35]" />
              <span className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">
                cURL CLI Request Example
              </span>
            </div>
            <button
              onClick={() => copyCode(curlSnippet, 'curl')}
              className="text-xs text-[#0A192F] hover:text-[#FF6B35] flex items-center gap-1 font-medium cursor-pointer"
            >
              {copiedIndex === 'curl' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedIndex === 'curl' ? 'Copied!' : 'Copy cURL'}
            </button>
          </div>
          <div className="p-4 bg-[#0A192F] text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
            <pre>{curlSnippet}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
