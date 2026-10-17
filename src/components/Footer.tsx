import React from 'react';
import { Sparkles, Shield, Heart, Terminal, Smartphone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E8D8C5] mt-16 py-12 text-[#64748B]">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF6B35] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-[#0A192F]">AuraHumanize</span>
          </div>
          <p className="text-xs leading-relaxed">
            Enterprise-grade AI humanizer, academic rewriting, and deep similarity verification SaaS.
          </p>
          <div className="text-[11px] text-[#475569]">
            Theme: Warm Creamy &bull; Vibrant Orange &bull; Navy Typography
          </div>
        </div>

        {/* Multi-Platform Architecture */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">Multi-Platform Ready</h4>
          <ul className="text-xs space-y-1.5">
            <li className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-[#FF6B35]" /> React Native (Android / iOS)
            </li>
            <li className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#FF6B35]" /> Express REST API (/api/v1/...)
            </li>
            <li className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#FF6B35]" /> MongoDB BSON Schema Ready
            </li>
          </ul>
        </div>

        {/* Academic Integrity */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">Academic Integrity</h4>
          <p className="text-xs leading-relaxed">
            Our algorithms preserve author citations, bracketed references, and mathematical formulas. Similarity metrics do not constitute academic misconduct verdicts.
          </p>
        </div>

        {/* Support & Quick Links */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">Product &amp; APIs</h4>
          <ul className="text-xs space-y-1.5">
            <li>
              <span className="hover:text-[#FF6B35] cursor-pointer">Humanizer Documentation</span>
            </li>
            <li>
              <span className="hover:text-[#FF6B35] cursor-pointer">Plagiarism Reference Database</span>
            </li>
            <li>
              <span className="hover:text-[#FF6B35] cursor-pointer">Voucher Program (STUDENT50)</span>
            </li>
            <li>
              <span className="hover:text-[#FF6B35] cursor-pointer">Privacy &amp; Data Security</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-[#F1E4D4] flex flex-wrap items-center justify-between text-xs text-[#94A3B8]">
        <div>&copy; {new Date().getFullYear()} AuraHumanize SaaS. All rights reserved.</div>
        <div className="flex items-center gap-1">
          Designed with creamy &amp; orange aesthetic for web and mobile.
        </div>
      </div>
    </footer>
  );
};
