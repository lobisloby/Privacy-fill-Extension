// ============================================
// CONTENT SCRIPT - FORM DETECTION & AUTO-FILL
// ============================================

import type { Identity, Message, MessageResponse } from '@/types';

// ============================================
// TYPES
// ============================================

type InputElement = HTMLInputElement | HTMLTextAreaElement;

interface FormFields {
  email: HTMLInputElement[];
  name: HTMLInputElement[];
  firstName: HTMLInputElement[];
  lastName: HTMLInputElement[];
  username: HTMLInputElement[];
  bio: HTMLTextAreaElement[];
  password: HTMLInputElement[];
}

// Type guard to check if payload is Identity
function isIdentity(payload: unknown): payload is Identity {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'id' in payload &&
    'email' in payload &&
    'fullName' in payload &&
    'username' in payload
  );
}

// ============================================
// FORM DETECTOR CLASS
// ============================================

class FormDetector {
  constructor() {
    this.init();
  }

  private init(): void {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener(
      (
        request: Message<unknown>,
        _sender: chrome.runtime.MessageSender,
        sendResponse: (response: MessageResponse) => void
      ) => {
        if (request.action === 'AUTOFILL') {
          // Type guard to validate payload
          if (isIdentity(request.payload)) {
            const count = this.autoFillForms(request.payload);
            sendResponse({ success: true, data: { filledCount: count } });
          } else {
            sendResponse({ success: false, error: 'Invalid identity payload' });
          }
        }
        return true;
      }
    );

    // Observe for dynamically added popups
    this.observeForPopups();
  }

  // ============================================
  // FORM FIELD DETECTION
  // ============================================

  private findFormFields(): FormFields {
    const fields: FormFields = {
      email: [],
      name: [],
      firstName: [],
      lastName: [],
      username: [],
      bio: [],
      password: []
    };

    const selectors = {
      email: [
        'input[type="email"]',
        'input[name*="email" i]',
        'input[id*="email" i]',
        'input[placeholder*="email" i]',
        'input[autocomplete="email"]'
      ],
      name: [
        'input[name="name"]',
        'input[name="fullname" i]',
        'input[name="full_name" i]',
        'input[id*="fullname" i]',
        'input[placeholder*="full name" i]',
        'input[placeholder*="your name" i]',
        'input[autocomplete="name"]'
      ],
      firstName: [
        'input[name*="first" i]',
        'input[id*="first" i]',
        'input[placeholder*="first name" i]',
        'input[autocomplete="given-name"]'
      ],
      lastName: [
        'input[name*="last" i]',
        'input[id*="last" i]',
        'input[placeholder*="last name" i]',
        'input[autocomplete="family-name"]'
      ],
      username: [
        'input[name*="username" i]',
        'input[id*="username" i]',
        'input[placeholder*="username" i]',
        'input[autocomplete="username"]'
      ],
      bio: [
        'textarea[name*="bio" i]',
        'textarea[id*="bio" i]',
        'textarea[placeholder*="bio" i]',
        'textarea[placeholder*="about" i]',
        'textarea[name*="description" i]'
      ],
      password: [
        'input[type="password"]',
        'input[name*="password" i]',
        'input[id*="password" i]'
      ]
    };

    // Process input fields
    const inputFieldTypes: Array<keyof Omit<FormFields, 'bio'>> = [
      'email', 'name', 'firstName', 'lastName', 'username', 'password'
    ];

    for (const fieldType of inputFieldTypes) {
      for (const selector of selectors[fieldType]) {
        const elements = document.querySelectorAll<HTMLInputElement>(selector);
        elements.forEach(el => {
          if (this.isVisible(el) && !fields[fieldType].includes(el)) {
            fields[fieldType].push(el);
          }
        });
      }
    }

    // Process textarea fields (bio)
    for (const selector of selectors.bio) {
      const elements = document.querySelectorAll<HTMLTextAreaElement>(selector);
      elements.forEach(el => {
        if (this.isVisible(el) && !fields.bio.includes(el)) {
          fields.bio.push(el);
        }
      });
    }

    return fields;
  }

  // ============================================
  // VISIBILITY CHECK
  // ============================================

  private isVisible(element: Element): boolean {
    const el = element as HTMLElement;
    const style = window.getComputedStyle(el);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      el.offsetParent !== null
    );
  }

  // ============================================
  // AUTO-FILL FORMS
  // ============================================

  private autoFillForms(identity: Identity): number {
    const fields = this.findFormFields();
    let filledCount = 0;

    // Email
    fields.email.forEach(field => {
      this.fillInputField(field, identity.email);
      filledCount++;
    });

    // Full name
    fields.name.forEach(field => {
      this.fillInputField(field, identity.fullName);
      filledCount++;
    });

    // First name
    fields.firstName.forEach(field => {
      this.fillInputField(field, identity.firstName);
      filledCount++;
    });

    // Last name
    fields.lastName.forEach(field => {
      this.fillInputField(field, identity.lastName);
      filledCount++;
    });

    // Username
    fields.username.forEach(field => {
      this.fillInputField(field, identity.username);
      filledCount++;
    });

    // Bio (textarea)
    if (identity.bio) {
      fields.bio.forEach(field => {
        this.fillTextareaField(field, identity.bio!);
        filledCount++;
      });
    }

    // Password
    fields.password.forEach(field => {
      this.fillInputField(field, this.generatePassword());
      filledCount++;
    });

    // Show notification
    this.showNotification(
      filledCount > 0
        ? `✅ Filled ${filledCount} field${filledCount > 1 ? 's' : ''}`
        : '❌ No fillable fields found'
    );

    return filledCount;
  }

  // ============================================
  // FIELD FILL METHODS
  // ============================================

  private fillInputField(field: HTMLInputElement, value: string): void {
    this.fillField(field, value);
  }

  private fillTextareaField(field: HTMLTextAreaElement, value: string): void {
    this.fillField(field, value);
  }

  private fillField(field: InputElement, value: string): void {
    // Set the value
    field.value = value;

    // Trigger events for React/Vue/Angular forms
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    field.dispatchEvent(new Event('blur', { bubbles: true }));
    
    // Focus and blur to trigger validation
    field.focus();
    field.blur();

    // Visual feedback
    const originalBg = field.style.backgroundColor;
    field.style.transition = 'background-color 0.3s ease';
    field.style.backgroundColor = 'rgba(99, 102, 241, 0.2)';
    
    setTimeout(() => {
      field.style.backgroundColor = originalBg;
    }, 1000);
  }

  // ============================================
  // PASSWORD GENERATION
  // ============================================

  private generatePassword(length = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    const allChars = lowercase + uppercase + numbers + symbols;

    // Ensure at least one of each type
    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }

  // ============================================
  // POPUP OBSERVATION
  // ============================================

  private observeForPopups(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            if (this.isPopup(element)) {
              this.addQuickFillButton(element);
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  private isPopup(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    const isFixed = style.position === 'fixed';
    const isAbsolute = style.position === 'absolute';
    const hasHighZIndex = parseInt(style.zIndex) > 1000;
    const hasForm = !!element.querySelector('form, input[type="email"], input[type="text"]');

    return (isFixed || (isAbsolute && hasHighZIndex)) && hasForm;
  }

  // ============================================
  // QUICK FILL BUTTON
  // ============================================

  private addQuickFillButton(popup: HTMLElement): void {
    // Check if button already exists
    if (popup.querySelector('.privacyfill-btn')) return;

    const button = document.createElement('button');
    button.className = 'privacyfill-btn';
    button.innerHTML = '🛡️ Quick Fill';

    // Apply styles
    Object.assign(button.style, {
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '600',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      cursor: 'pointer',
      zIndex: '999999',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    });

    // Hover effects
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.05)';
      button.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.5)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
    });

    // Click handler
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        const data = await chrome.storage.local.get(['currentIdentity']);
        
        if (data.currentIdentity && isIdentity(data.currentIdentity)) {
          this.autoFillForms(data.currentIdentity);
        } else {
          this.showNotification('⚠️ Generate an identity first!');
        }
      } catch (error) {
        console.error('Error getting identity:', error);
        this.showNotification('❌ Error loading identity');
      }
    });

    // Make popup position relative if needed
    const popupStyle = window.getComputedStyle(popup);
    if (popupStyle.position === 'static') {
      popup.style.position = 'relative';
    }

    popup.appendChild(button);
  }

  // ============================================
  // NOTIFICATIONS
  // ============================================

  private showNotification(message: string): void {
    // Remove existing notification
    const existing = document.querySelector('.privacyfill-notification');
    if (existing) existing.remove();

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'privacyfill-notification';
    notification.textContent = message;

    // Apply styles
    Object.assign(notification.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, #1a1a2e, #16162a)',
      color: 'white',
      padding: '14px 24px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      zIndex: '9999999',
      borderLeft: '4px solid #6366f1',
      opacity: '0',
      transform: 'translateX(20px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease'
    });

    document.body.appendChild(notification);

    // Trigger animation
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    });

    // Remove after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(20px)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// ============================================
// INITIALIZE
// ============================================

new FormDetector();

export {};