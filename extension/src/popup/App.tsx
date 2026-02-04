import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { generator } from '../services/generator';
import { inbox } from '../services/inbox';
import { license, LicenseInfo } from '../services/license';
import { FREE_LIMIT, LEMON_SQUEEZY } from '../utils/constants';
import type { Identity, Email } from '../types';

// Import Lucide Icons
import {
  Shield,
  Zap,
  Sparkles,
  Mail,
  Inbox,
  User,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Crown,
  Key,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MailOpen,
  FileText,
  Trash2,
  X,
  Calendar,
} from 'lucide-react';

export default function App() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showLicenseInput, setShowLicenseInput] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
    setTimeout(() => setToast(null), 4000);
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
        showToast('Identity generated!', 'success');
      }
    } catch (err) {
      console.error('Generation error:', err);
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
        showToast('Form filled successfully!', 'success');
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
        showToast('No emails yet. Try refreshing.', 'success');
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

  const handleCopy = async (text: string, fieldName: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyAll = () => {
    if (!identity) return;
    const text = `Email: ${identity.email}\nName: ${identity.fullName}\nUsername: ${identity.username}\nPassword: ${identity.password}`;
    handleCopy(text, 'all');
    showToast('All info copied!', 'success');
  };

  const handleActivateLicense = async () => {
    if (!licenseKey.trim()) {
      showToast('Please enter a license key', 'error');
      return;
    }

    setIsActivating(true);

    try {
      const result = await license.activate(licenseKey);
      
      if (result.success) {
        showToast(result.message, 'success');
        setIsPremium(true);
        setShowLicenseInput(false);
        setLicenseKey('');
      } else {
        showToast(result.message, 'error');
      }
    } catch (err) {
      console.error('Activation error:', err);
      showToast('Activation failed. Please try again.', 'error');
    }

    setIsActivating(false);
  };

  const handleBuyLicense = () => {
    chrome.tabs.create({ url: LEMON_SQUEEZY.CHECKOUT_URL });
  };

  const remaining = Math.max(0, FREE_LIMIT - usageCount);
  const hasRealEmail = !!identity?.emailAccountToken;

  // ============================================
  // INBOX VIEW
  // ============================================
  if (showInbox) {
    return (
      <div className="p-4 min-h-[520px] flex flex-col bg-[#0a0a1a]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-800">
          <button
            onClick={() => {
              setShowInbox(false);
              setSelectedEmail(null);
            }}
            className="p-1.5 hover:bg-gray-800 rounded-lg transition"
          >
            <ArrowLeft size={18} className="text-gray-400" />
          </button>
          <div className="flex items-center gap-2">
            <Inbox size={18} className="text-indigo-400" />
            <span className="font-semibold">Inbox</span>
          </div>
          <button
            onClick={handleCheckInbox}
            disabled={isLoadingEmails}
            className="ml-auto flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw size={12} className={isLoadingEmails ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Email Address */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 px-1">
          <Mail size={12} />
          <span className="truncate">{identity?.email}</span>
        </div>

        {/* Email Content */}
        {selectedEmail ? (
          <div className="flex-1 overflow-auto">
            <div className="bg-gradient-to-br from-[#12122a] to-[#1a1a35] rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <User size={12} />
                <span className="truncate">{selectedEmail.from.address}</span>
              </div>
              <div className="font-semibold mb-3 flex items-start gap-2">
                <FileText size={16} className="text-gray-400 mt-0.5 shrink-0" />
                {selectedEmail.subject}
              </div>
              <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                {selectedEmail.text || selectedEmail.intro}
              </div>

              {/* Verification Code Detection */}
              {selectedEmail.text && inbox.extractCode(selectedEmail.text) && (
                <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 mb-2">
                    <CheckCircle2 size={14} />
                    Verification Code Found
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-mono font-bold text-emerald-400 tracking-wider">
                      {inbox.extractCode(selectedEmail.text)}
                    </span>
                    <button
                      onClick={() => handleCopy(inbox.extractCode(selectedEmail.text!)!, 'code')}
                      className="flex items-center gap-1.5 text-sm bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1.5 rounded-lg transition"
                    >
                      {copiedField === 'code' ? <Check size={14} /> : <Copy size={14} />}
                      {copiedField === 'code' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedEmail(null)}
              className="mt-3 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
            >
              <ArrowLeft size={14} />
              Back to list
            </button>
          </div>
        ) : isLoadingEmails ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Loader2 size={24} className="animate-spin mb-3" />
            <p>Checking inbox...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <MailOpen size={48} className="mb-3 opacity-50" />
            <p className="font-medium">No emails yet</p>
            <p className="text-xs mt-1 text-gray-600">Emails can take 10-30 seconds to arrive</p>
            <button
              onClick={handleCheckInbox}
              className="mt-4 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-white text-sm transition"
            >
              <RefreshCw size={14} />
              Refresh Inbox
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-auto space-y-2">
            {emails.map((email) => (
              <button
                key={email.id}
                onClick={() => handleViewEmail(email)}
                className="w-full text-left p-3 bg-gradient-to-br from-[#12122a] to-[#1a1a35] hover:from-[#1a1a35] hover:to-[#252545] rounded-xl border border-gray-800/50 transition group"
              >
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <User size={10} />
                  <span className="truncate">{email.from.address}</span>
                </div>
                <div className="font-medium truncate group-hover:text-indigo-300 transition">
                  {email.subject}
                </div>
                <div className="text-xs text-gray-500 truncate mt-1">{email.intro}</div>
              </button>
            ))}
          </div>
        )}

        <Toast toast={toast} />
      </div>
    );
  }

  // ============================================
  // MAIN VIEW
  // ============================================
  return (
    <div className="p-4 min-h-[520px] flex flex-col bg-[#0a0a1a]">
      {/* Header */}
      <header className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <Shield size={20} className="text-white" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            PrivacyFill
          </h1>
        </div>
        <div
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-semibold ${
            isPremium
              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          {isPremium && <Crown size={12} />}
          {isPremium ? 'PRO' : 'FREE'}
        </div>
      </header>

      {/* Identity Card */}
      <div className="bg-gradient-to-br from-[#12122a] to-[#1a1a35] rounded-2xl p-4 mb-4 border border-gray-800/50">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Current Identity
          </span>
          {identity && (
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition"
            >
              {copiedField === 'all' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copiedField === 'all' ? 'Copied!' : 'Copy All'}
            </button>
          )}
        </div>

        {identity ? (
          <div className="space-y-2.5">
            <Field
              icon={<Mail size={14} />}
              label={hasRealEmail ? 'Email (Live)' : 'Email'}
              value={identity.email}
              fieldKey="email"
              onCopy={handleCopy}
              copied={copiedField === 'email'}
              highlight={hasRealEmail}
            />
            <Field
              icon={<User size={14} />}
              label="Full Name"
              value={identity.fullName}
              fieldKey="fullname"
              onCopy={handleCopy}
              copied={copiedField === 'fullname'}
            />
            <Field
              icon={<AtSign size={14} />}
              label="Username"
              value={identity.username}
              fieldKey="username"
              onCopy={handleCopy}
              copied={copiedField === 'username'}
            />
            <PasswordField
              value={identity.password}
              onCopy={handleCopy}
              copied={copiedField === 'password'}
            />
            {isPremium && identity.bio && (
              <Field
                icon={<FileText size={14} />}
                label="Bio"
                value={identity.bio}
                fieldKey="bio"
                onCopy={handleCopy}
                copied={copiedField === 'bio'}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Sparkles size={40} className="mx-auto mb-3 opacity-50" />
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
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Zap size={18} />
          )}
          Generate New Identity
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleAutoFill}
            disabled={!identity}
            className="flex-1 py-3 bg-[#1a1a35] hover:bg-[#252545] border border-gray-700/50 
                       hover:border-indigo-500/50 rounded-xl font-medium transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            Auto-Fill
          </button>

          <button
            onClick={handleCheckInbox}
            disabled={!hasRealEmail}
            className={`flex-1 py-3 rounded-xl font-medium transition-all
                       flex items-center justify-center gap-2
                       ${
                         hasRealEmail
                           ? 'bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400'
                           : 'bg-gray-800/50 border border-gray-700/30 text-gray-600 cursor-not-allowed'
                       }`}
          >
            <Inbox size={16} />
            Inbox
          </button>
        </div>
      </div>

      {/* Free Tier / Premium Section */}
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
              <span className="text-amber-400 font-medium flex items-center justify-center gap-1">
                <AlertCircle size={12} />
                Free limit reached!
              </span>
            )}
          </p>

          {/* Upgrade Card */}
          <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Crown size={20} className="text-amber-400" />
              <span className="font-bold">Upgrade to Premium</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 mb-4">
              <FeatureItem text="Unlimited generations" />
              <FeatureItem text="Real temp email with inbox" />
              <FeatureItem text="Auto-generated bios" />
              <FeatureItem text="Lifetime access" />
            </ul>

            <div className="flex gap-2">
              <button
                onClick={handleBuyLicense}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 
                           text-black font-bold rounded-xl hover:opacity-90 transition
                           flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} />
                Get License - $4.99
              </button>
              <button
                onClick={() => setShowLicenseInput(!showLicenseInput)}
                className={`p-2.5 rounded-xl transition ${
                  showLicenseInput 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
                title="Enter license key"
              >
                <Key size={18} />
              </button>
            </div>

            {/* License Input */}
            {showLicenseInput && (
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <p className="text-xs text-gray-400 mb-2">
                  Enter your license key from the purchase email:
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
                    className="w-full px-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl 
                               text-sm font-mono placeholder:text-gray-600 pr-8
                               focus:outline-none focus:border-indigo-500 transition"
                    disabled={isActivating}
                  />
                  {licenseKey && !isActivating && (
                    <button
                      onClick={() => setLicenseKey('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleActivateLicense}
                  disabled={!licenseKey.trim() || isActivating}
                  className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 
                             rounded-xl font-semibold text-sm disabled:opacity-50 transition
                             flex items-center justify-center gap-2"
                >
                  {isActivating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Activating...
                    </>
                  ) : (
                    <>
                      <Key size={14} />
                      Activate License
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <PremiumStatus onDeactivate={() => {
          setIsPremium(false);
          showToast('License deactivated', 'success');
        }} />
      )}

      {/* Footer */}
      <footer className="mt-auto pt-4 border-t border-gray-800/50 flex justify-center items-center gap-4 text-xs text-gray-600">
        <button
          onClick={async () => {
            await storage.clearHistory();
            showToast('History cleared', 'success');
          }}
          className="flex items-center gap-1 hover:text-gray-400 transition"
        >
          <Trash2 size={12} />
          Clear History
        </button>
        <span>•</span>
        <span>v1.0.0</span>
      </footer>

      <Toast toast={toast} />
    </div>
  );
}

// ============================================
// COMPONENTS
// ============================================

function Toast({ toast }: { toast: { msg: string; type: 'success' | 'error' } | null }) {
  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl text-sm font-medium 
                  shadow-lg flex items-center gap-2 z-50 animate-[slideUp_0.3s_ease] ${
                    toast.type === 'success'
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/20 border border-red-500/30 text-red-400'
                  }`}
    >
      {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {toast.msg}
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2">
      <CheckCircle2 size={14} className="text-emerald-400" />
      {text}
    </li>
  );
}

interface FieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  fieldKey: string;
  onCopy: (text: string, field: string) => void;
  copied: boolean;
  highlight?: boolean;
}

function Field({ icon, label, value, fieldKey, onCopy, copied, highlight }: FieldProps) {
  return (
    <div>
      <div
        className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider mb-1 font-medium ${
          highlight ? 'text-emerald-400' : 'text-gray-500'
        }`}
      >
        {icon}
        {label}
        {highlight && <CheckCircle2 size={10} />}
      </div>
      <div
        className={`flex items-center gap-2 bg-black/30 px-3 py-2.5 rounded-lg border transition ${
          highlight ? 'border-emerald-500/30' : 'border-gray-800/50'
        }`}
      >
        <span className="flex-1 text-sm truncate">{value}</span>
        <button
          onClick={() => onCopy(value, fieldKey)}
          className="text-gray-500 hover:text-white transition p-1"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

interface PasswordFieldProps {
  value: string;
  onCopy: (text: string, field: string) => void;
  copied: boolean;
}

function PasswordField({ value, onCopy, copied }: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-medium">
        <Lock size={14} />
        Password
      </div>
      <div className="flex items-center gap-2 bg-black/30 px-3 py-2.5 rounded-lg border border-gray-800/50">
        <span className={`flex-1 text-sm truncate ${!show ? 'font-mono tracking-wider' : ''}`}>
          {show ? value : '••••••••••••••••'}
        </span>
        <button
          onClick={() => setShow(!show)}
          className="text-gray-500 hover:text-white transition p-1"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <button
          onClick={() => onCopy(value, 'password')}
          className="text-gray-500 hover:text-white transition p-1"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

interface PremiumStatusProps {
  onDeactivate: () => void;
}

function PremiumStatus({ onDeactivate }: PremiumStatusProps) {
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    loadLicenseInfo();
  }, []);

  const loadLicenseInfo = async () => {
    const info = await license.getInfo();
    setLicenseInfo(info);
  };

  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to deactivate your license?')) return;

    setIsDeactivating(true);
    await license.deactivate();
    setIsDeactivating(false);
    onDeactivate();
  };

  return (
    <div className="text-center py-4">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-full hover:opacity-90 transition"
      >
        <Crown size={16} />
        Premium Active
      </button>

      {showDetails && licenseInfo && (
        <div className="mt-4 p-4 bg-gray-800/50 rounded-xl text-left text-sm border border-gray-700/50">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Key size={14} />
            <span className="font-mono text-xs">
              {licenseInfo.key.length > 16 
                ? `${licenseInfo.key.substring(0, 8)}...${licenseInfo.key.slice(-8)}`
                : licenseInfo.key
              }
            </span>
          </div>
          {licenseInfo.email && (
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Mail size={14} />
              <span className="truncate">{licenseInfo.email}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
            <Calendar size={12} />
            Activated: {new Date(licenseInfo.activatedAt).toLocaleDateString()}
          </div>
          <button
            onClick={handleDeactivate}
            disabled={isDeactivating}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition disabled:opacity-50"
          >
            {isDeactivating ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <X size={12} />
            )}
            {isDeactivating ? 'Deactivating...' : 'Deactivate License'}
          </button>
        </div>
      )}
    </div>
  );
}