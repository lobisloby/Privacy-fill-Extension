// ============================================
// CONTENT SCRIPT - AUTO-FILL
// ============================================

import type { Identity } from '../types';

// Listen for autofill messages
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'AUTOFILL' && request.identity) {
    const count = autoFill(request.identity);
    sendResponse({ success: true, count });
  }
  return true;
});

function autoFill(identity: Identity): number {
  let filled = 0;

  // Field selectors
  const emailSelectors = 'input[type="email"], input[name*="email" i], input[placeholder*="email" i]';
  const nameSelectors = 'input[name="name"], input[name*="fullname" i], input[placeholder*="name" i]:not([placeholder*="user" i])';
  const firstNameSelectors = 'input[name*="first" i], input[placeholder*="first" i]';
  const lastNameSelectors = 'input[name*="last" i], input[placeholder*="last" i]';
  const usernameSelectors = 'input[name*="username" i], input[placeholder*="username" i]';
  const passwordSelectors = 'input[type="password"]';

  // Fill helper
  const fill = (selectors: string, value: string) => {
    document.querySelectorAll<HTMLInputElement>(selectors).forEach((el) => {
      if (isVisible(el) && !el.value) {
        el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        highlight(el);
        filled++;
      }
    });
  };

  fill(emailSelectors, identity.email);
  fill(nameSelectors, identity.fullName);
  fill(firstNameSelectors, identity.firstName);
  fill(lastNameSelectors, identity.lastName);
  fill(usernameSelectors, identity.username);
  fill(passwordSelectors, identity.password);

  showNotification(filled > 0 ? `✅ Filled ${filled} field${filled > 1 ? 's' : ''}` : '❌ No fields found');

  return filled;
}

function isVisible(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
}

function highlight(el: HTMLElement): void {
  const orig = el.style.backgroundColor;
  el.style.transition = 'background-color 0.3s';
  el.style.backgroundColor = 'rgba(99, 102, 241, 0.2)';
  setTimeout(() => (el.style.backgroundColor = orig), 1000);
}

function showNotification(msg: string): void {
  const existing = document.querySelector('.pf-toast');
  existing?.remove();

  const toast = document.createElement('div');
  toast.className = 'pf-toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #1e1e2e, #2d2d44);
    color: white;
    padding: 12px 20px;
    border-radius: 10px;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 999999;
    border-left: 4px solid #6366f1;
  `;

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export {};