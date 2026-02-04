import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { generator } from '../services/generator';
import { inbox } from '../services/inbox';
import { license } from '../services/license';
import { FREE_LIMIT, LEMON_SQUEEZY } from '../utils/constants';
import type { Identity, Email } from '../types';

export default function App() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showLicenseInput, setShowLicenseInput] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  
  // Inbox state
  const [showInbox, setShowInbox] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    const state = await storage.getState();
    setIdentity(state.currentIdentity);
    setIsPremium(state.isPremium);
    setUsageCount(state.usageCount);
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerate = async () => {
    if (!isPremium && usageCount >= FREE_LIMIT) {
      showToast('Free limit reached! Upgrade to Premium.', 'error');
      return;
    }

    setIsLoading(true);
    setShowInbox(false);
    setEmails([]);
    setSelectedEmail(null);
    
    try {
      const newIdentity = await generator.generate(isPremium);
      await storage.setCurrentIdentity(newIdentity);
      
      if (!isPremium) {
        const newCount = await storage.incrementUsage();
        setUsageCount(newCount);
      }
      
      setIdentity(newIdentity);
      
      if (newIdentity.emailAccountToken) {
        showToast('Real temp email created!', 'success');
      } else {
        showToast('Identity generated (fake email)', 'success');
      }
    } catch {
      showToast('Generation failed', 'error');
    }
    setIsLoading(false);
  };

  const handleAutoFill = async () => {
    if (!identity) {
      showToast('Generate an identity first!', 'error');
      return;
    }
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, { action: 'AUTOFILL', identity });
      }
    } catch {
      showToast('Cannot fill on this page', 'error');
    }
  };

  const handleCheckInbox = async () => {
    if (!identity?.emailAccountToken) {
      showToast('This email cannot receive messages', 'error');
      return;
    }

    setShowInbox(true);
    setIsLoadingEmails(true);

    try {
      const messages = await inbox.getEmails(identity.emailAccountToken);
      setEmails(messages);
      
      if (messages.length === 0) {
        showToast('No emails yet. Try refreshing in a few seconds.', 'success');
      }
    } catch {
      showToast('Failed to check inbox', 'error');
    }
    
    setIsLoadingEmails(false);
  };

  const handleViewEmail = async (email: Email) => {
    if (!identity?.emailAccountToken) return;
    
    const fullEmail = await inbox.getEmail(identity.emailAccountToken, email.id);
    setSelectedEmail(fullEmail);
  };

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    showToast(`${label} copied!`, 'success');
  };

  const handleActivateLicense = async () => {
    const result = await license.activate(licenseKey);
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      setIsPremium(true);
      setShowLicenseInput(false);
      setLicenseKey('');
    }
  };

  const remaining = Math.max(0, FREE_LIMIT - usageCount);
  const hasRealEmail = !!identity?.emailAccountToken;

  // If showing inbox
  if (showInbox) {
    return (
      <div className="p-4 min-h-[520px] flex flex-col bg-[#0a0a1a]">
        {/* Inbox Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-800">
          <button 
            onClick={() => { setShowInbox(false); setSelectedEmail(null); }}
            className="text-gray-400 hover:text-white"
          >
            ← Back
          </button>
          <span className="font-semibold">📬 Inbox</span>
          <button 
            onClick={handleCheckInbox}
            className="ml-auto text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Email for context */}
        <div className="text-xs text-gray-500 mb-3 px-2">
          {identity?.email}
        </div>

        {/* Email Content */}
        {selectedEmail ? (
          <div className="flex-1 overflow-auto">
            <div className="bg-[#12122a] rounded-xl p-4 border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">From: {selectedEmail.from.address}</div>
              <div className="font-semibold mb-3">{selectedEmail.subject}</div>
              <div className="text-sm text-gray-300 whitespace-pre-wrap">
                {selectedEmail.text || selectedEmail.intro}
              </div>
              
              {/* Try to extract verification code */}
              {selectedEmail.text && inbox.extractCode(selectedEmail.text) && (
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <div className="text-xs text-emerald-400 mb-1">Verification Code Found:</div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-mono font-bold text-emerald-400">
                      {inbox.extractCode(selectedEmail.text)}
                    </span>
                    <button
                      onClick={() => handleCopy(inbox.extractCode(selectedEmail.text!)!, 'Code')}
                      className="text-sm bg-emerald-500/20 hover:bg-emerald-500/30 px-2 py-1 rounded"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedEmail(null)}
              className="mt-3 text-sm text-gray-400 hover:text-white"
            >
              ← Back to list
            </button>
          </div>
        ) : isLoadingEmails ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <span className="animate-spin mr-2">⏳</span> Checking inbox...
          </div>
        ) : emails.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <div className="text-4xl mb-3">📭</div>
            <p>No emails yet</p>
            <p className="text-xs mt-1">Emails can take a few seconds to arrive</p>
            <button
              onClick={handleCheckInbox}
              className="mt-4 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-white text-sm"
            >
              🔄 Refresh Inbox
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-auto space-y-2">
            {emails.map((email) => (
              <button
                key={email.id}
                onClick={() => handleViewEmail(email)}
                className="w-full text-left p-3 bg-[#12122a] hover:bg-[#1a1a35] rounded-xl border border-gray-800 transition"
              >
                <div className="text-xs text-gray-500 truncate">{email.from.address}</div>
                <div className="font-medium truncate">{email.subject}</div>
                <div className="text-xs text-gray-400 truncate mt-1">{email.intro}</div>
              </button>
            ))}
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg ${
            toast.type === 'success'
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}>
            {toast.msg}
          </div>
        )}
      </div>
    );
  }

  // Main view
  return (
    <div className="p-4 min-h-[520px] flex flex-col bg-[#0a0a1a]">
      {/* Header */}
      <header className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛡️</span>
          <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            PrivacyFill
          </h1>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
          isPremium 
            ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black' 
            : 'bg-gray-800 text-gray-400'
        }`}>
          {isPremium ? '👑 PRO' : 'FREE'}
        </span>
      </header>

      {/* Identity Card */}
      <div className="bg-gradient-to-br from-[#12122a] to-[#1a1a35] rounded-2xl p-4 mb-4 border border-gray-800/50">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Current Identity
          </span>
          {identity && (
            <button
              onClick={() => handleCopy(
                `Email: ${identity.email}\nName: ${identity.fullName}\nUsername: ${identity.username}\nPassword: ${identity.password}`,
                'All'
              )}
              className="text-xs text-gray-500 hover:text-white transition"
            >
              📋 Copy All
            </button>
          )}
        </div>

        {identity ? (
          <div className="space-y-2.5">
            <Field 
              label={hasRealEmail ? "Email (Real ✓)" : "Email"} 
              value={identity.email} 
              onCopy={handleCopy}
              highlight={hasRealEmail}
            />
            <Field label="Name" value={identity.fullName} onCopy={handleCopy} />
            <Field label="Username" value={identity.username} onCopy={handleCopy} />
            <Field label="Password" value={identity.password} onCopy={handleCopy} isPassword />
            {isPremium && identity.bio && (
              <Field label="Bio" value={identity.bio} onCopy={handleCopy} />
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">✨</div>
            <p className="text-sm">Click generate to create an identity</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 mb-4">
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 
                     rounded-xl font-semibold text-white shadow-lg shadow-indigo-500/20
                     disabled:opacity-60 transition-all hover:-translate-y-0.5 active:translate-y-0
                     flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <span>⚡</span>
          )}
          Generate New Identity
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleAutoFill}
            className="flex-1 py-3 bg-[#1a1a35] hover:bg-[#252545] border border-gray-700/50 
                       hover:border-indigo-500/50 rounded-xl font-medium transition-all
                       flex items-center justify-center gap-2"
          >
            <span>✨</span>
            Auto-Fill
          </button>

          <button
            onClick={handleCheckInbox}
            disabled={!hasRealEmail}
            className={`flex-1 py-3 rounded-xl font-medium transition-all
                       flex items-center justify-center gap-2
                       ${hasRealEmail 
                         ? 'bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400' 
                         : 'bg-gray-800/50 border border-gray-700/30 text-gray-600 cursor-not-allowed'
                       }`}
          >
            <span>📬</span>
            Inbox
          </button>
        </div>
      </div>

      {/* Free Tier / Premium */}
      {!isPremium ? (
        <div className="mb-4">
          {/* Usage Bar */}
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                remaining <= 2
                  ? 'bg-gradient-to-r from-red-500 to-orange-500'
                  : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
              }`}
              style={{ width: `${(usageCount / FREE_LIMIT) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center mb-4">
            {remaining > 0 ? (
              <>{remaining} of {FREE_LIMIT} free generations left</>
            ) : (
              <span className="text-amber-400 font-medium">Free limit reached!</span>
            )}
          </p>

          {/* Upgrade Card */}
          <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">👑</span>
              <span className="font-bold">Upgrade to Premium</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-1.5 mb-4">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Unlimited generations
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Real temp email with inbox
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Auto-generated bios
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Lifetime access
              </li>
            </ul>

            <div className="flex gap-2">
              <button
                onClick={() => chrome.tabs.create({ url: LEMON_SQUEEZY.CHECKOUT_URL })}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 
                           text-black font-bold rounded-xl hover:opacity-90 transition"
              >
                Get License - $9.99
              </button>
              <button
                onClick={() => setShowLicenseInput(!showLicenseInput)}
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl transition"
                title="Enter license key"
              >
                🔑
              </button>
            </div>

            {/* License Input */}
            {showLicenseInput && (
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  placeholder="PF-XXXX-XXXX-XXXX-XXXX"
                  className="w-full px-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl 
                             text-sm font-mono placeholder:text-gray-600
                             focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  onClick={handleActivateLicense}
                  disabled={!licenseKey}
                  className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 
                             rounded-xl font-semibold text-sm disabled:opacity-50 transition"
                >
                  Activate License
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <span className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-full">
            👑 Premium Active
          </span>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto pt-4 border-t border-gray-800/50 flex justify-center gap-4 text-xs text-gray-600">
        <button onClick={() => storage.clearHistory()} className="hover:text-gray-400 transition">
          Clear History
        </button>
        <span>•</span>
        <span>v1.0.0</span>
      </footer>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg ${
          toast.type === 'success'
            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/20 border border-red-500/30 text-red-400'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// Field Component
interface FieldProps {
  label: string;
  value: string;
  onCopy: (text: string, label: string) => void;
  isPassword?: boolean;
  highlight?: boolean;
}

function Field({ label, value, onCopy, isPassword, highlight }: FieldProps) {
  const [show, setShow] = useState(!isPassword);

  return (
    <div>
      <div className={`text-[10px] uppercase tracking-wider mb-1 font-medium ${
        highlight ? 'text-emerald-400' : 'text-gray-500'
      }`}>
        {label}
      </div>
      <div className={`flex items-center gap-2 bg-black/30 px-3 py-2 rounded-lg border ${
        highlight ? 'border-emerald-500/30' : 'border-gray-800/50'
      }`}>
        <span className={`flex-1 text-sm truncate ${isPassword && !show ? 'font-mono' : ''}`}>
          {isPassword && !show ? '••••••••••••' : value}
        </span>
        {isPassword && (
          <button
            onClick={() => setShow(!show)}
            className="text-gray-500 hover:text-gray-300 transition text-xs"
          >
            {show ? '🙈' : '👁️'}
          </button>
        )}
        <button
          onClick={() => onCopy(value, label)}
          className="text-gray-500 hover:text-white transition"
        >
          📋
        </button>
      </div>
    </div>
  );
}