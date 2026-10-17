import React, { useState } from 'react';
import { X, Check, Zap, Sparkles, CreditCard, Gift, AlertCircle } from 'lucide-react';
import type { User } from '../types/index.ts';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onCreditsUpdated: (newCredits: number) => void;
}

export const BillingModal: React.FC<BillingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCreditsUpdated,
}) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    setIsRedeeming(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/v1/billing/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to redeem voucher code.');
      }

      setStatusMsg({ type: 'success', text: data.message });
      onCreditsUpdated(data.currentCredits);
      setVoucherCode('');
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A192F]/60 flex items-center justify-center p-4">
      <div className="bg-white border border-[#E8D8C5] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#F1E4D4]">
          <div>
            <h3 className="text-lg font-bold text-[#0A192F] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF6B35]" />
              Credit Balance &amp; Subscription Plans
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Available Credits: <strong className="text-[#FF6B35]">{currentUser?.credits ?? 25}</strong> words equivalent
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-[#64748B] hover:text-[#0A192F] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Free Tier */}
          <div className="border border-[#E8D8C5] rounded-xl p-4 bg-[#FFFDF9] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Starter</span>
              <div className="text-2xl font-black text-[#0A192F] mt-1">$0</div>
              <p className="text-xs text-[#64748B] mt-1">25 Free Credits</p>
              <ul className="mt-4 space-y-2 text-xs text-[#0A192F]">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> ~6,000 words rewrite
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Academic &amp; Simple styles
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Citation preservation
                </li>
              </ul>
            </div>
            <button
              disabled
              className="mt-5 w-full py-2 bg-[#FFF9F0] border border-[#E8D8C5] text-[#0A192F] rounded-lg text-xs font-semibold"
            >
              Current Plan
            </button>
          </div>

          {/* Pro Tier (Popular) */}
          <div className="border-2 border-[#FF6B35] rounded-xl p-4 bg-[#FFF9F0] relative flex flex-col justify-between shadow-xs">
            <div className="absolute -top-2.5 right-4 bg-[#FF6B35] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
              Popular
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B35]">Researcher Pro</span>
              <div className="text-2xl font-black text-[#0A192F] mt-1">
                $19<span className="text-xs font-normal text-[#64748B]">/mo</span>
              </div>
              <p className="text-xs text-[#64748B] mt-1">100 Monthly Credits</p>
              <ul className="mt-4 space-y-2 text-xs text-[#0A192F]">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> ~25,000 words rewrite
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Full Plagiarism scans
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> High-speed Gemini pipeline
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Android / Mobile API access
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                onCreditsUpdated((currentUser?.credits || 0) + 100);
                setStatusMsg({ type: 'success', text: 'Researcher Pro sandbox activated (+100 credits)!' });
              }}
              className="mt-5 w-full py-2 bg-[#FF6B35] hover:bg-[#E8551E] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Upgrade to Pro
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="border border-[#E8D8C5] rounded-xl p-4 bg-[#FFFDF9] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Enterprise</span>
              <div className="text-2xl font-black text-[#0A192F] mt-1">
                $49<span className="text-xs font-normal text-[#64748B]">/mo</span>
              </div>
              <p className="text-xs text-[#64748B] mt-1">500 Monthly Credits</p>
              <ul className="mt-4 space-y-2 text-xs text-[#0A192F]">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Unlimited team seats
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Direct MongoDB database sync
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Dedicated API rate limit
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                onCreditsUpdated((currentUser?.credits || 0) + 500);
                setStatusMsg({ type: 'success', text: 'Enterprise sandbox activated (+500 credits)!' });
              }}
              className="mt-5 w-full py-2 bg-[#0A192F] hover:bg-[#1E293B] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Select Enterprise
            </button>
          </div>
        </div>

        {/* Voucher Redemption Form */}
        <div className="mt-6 pt-5 border-t border-[#F1E4D4]">
          <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-[#FF6B35]" /> Redeem Promo Voucher / Voucher Code
          </h4>
          <form onSubmit={handleRedeem} className="flex items-center gap-2">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              placeholder="e.g. STUDENT50 or WELCOME25"
              className="flex-1 px-3 py-2 bg-[#FFFDF9] border border-[#E8D8C5] rounded-lg text-xs text-[#0A192F] uppercase focus:outline-none focus:border-[#FF6B35]"
            />
            <button
              type="submit"
              disabled={isRedeeming}
              className="px-4 py-2 bg-[#FF6B35] hover:bg-[#E8551E] disabled:bg-[#FFA580] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              {isRedeeming ? 'Validating...' : 'Apply Voucher'}
            </button>
          </form>

          {statusMsg && (
            <div
              className={`mt-3 p-3 rounded-md text-xs flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {statusMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              <span>{statusMsg.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
