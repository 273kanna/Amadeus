/**
 * =============================================================================
 * AMADEUS — Digital Solutions Studio
 * Client-side script: Navigation, Motion, & @n8n/chat Widget Integration
 * =============================================================================
 */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------------
   * DOM Elements Cache
   * --------------------------------------------------------------------------- */
  const chatPanel = document.getElementById('chatPanel');
  const n8nChatContainer = document.getElementById('n8nChatContainer');
  const chatLoadingState = document.getElementById('chatLoadingState');
  const chatConfigNotice = document.getElementById('chatConfigNotice');
  const chatLauncherBtn = document.getElementById('chatLauncherBtn');
  const closeChatBtn = document.getElementById('closeChatBtn');
  const chatBackdrop = document.getElementById('chatBackdrop');

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  /* ---------------------------------------------------------------------------
   * Light / Dark Theme
   * Saves the visitor's choice locally and keeps the toggle accessible.
   * --------------------------------------------------------------------------- */
  const themeStorageKey = 'amadeus-theme';

  function applyTheme(theme, persist = false) {
    const activeTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', activeTheme);

    if (themeToggleBtn) {
      const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
      const label = `Switch to ${nextTheme} mode`;
      themeToggleBtn.setAttribute('aria-label', label);
      themeToggleBtn.setAttribute('title', label);
      themeToggleBtn.setAttribute('aria-pressed', String(activeTheme === 'dark'));
    }

    if (persist) {
      try {
        window.localStorage.setItem(themeStorageKey, activeTheme);
      } catch (error) {
        console.warn('[AMADEUS Theme] Could not save theme preference:', error);
      }
    }
  }

  let savedTheme = 'light';
  try {
    savedTheme = window.localStorage.getItem(themeStorageKey) === 'dark' ? 'dark' : 'light';
  } catch (error) {
    // Continue with the light theme if browser storage is unavailable.
  }
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      applyTheme(currentTheme === 'dark' ? 'light' : 'dark', true);
    });
  }

  let isChatInitialized = false;
  let lastActiveElement = null;

  /* ---------------------------------------------------------------------------
   * Official @n8n/chat Widget Initialization
   * Mounts directly inside #n8nChatContainer within the floating panel.
   * --------------------------------------------------------------------------- */

  let chatInitAttempts = 0;

  function initN8nChat() {
    if (isChatInitialized) return;

    // Check if CHAT_URL is defined and not a placeholder
    const url = typeof CHAT_URL !== 'undefined' ? CHAT_URL.trim() : '';
    const isPlaceholder = !url || url.includes('<PASTE CHAT URL HERE>') || url.includes('PASTE') || url.length < 10;

    console.log('[AMADEUS Chat] initN8nChat called. CHAT_URL =', url, '| isPlaceholder =', isPlaceholder);

    if (isPlaceholder) {
      if (chatLoadingState) chatLoadingState.style.display = 'none';
      if (chatConfigNotice) chatConfigNotice.hidden = false;
      console.warn('[AMADEUS Chat] CHAT_URL is placeholder or missing. Showing config notice.');
      return;
    }

    if (chatConfigNotice) chatConfigNotice.hidden = true;

    // Look for createChat — set by the ES module in index.html, or from UMD globals
    const createChatFn =
      window._n8nCreateChat ||
      (window.n8nChat && window.n8nChat.createChat) ||
      window.createChat ||
      (window.n8nChat && window.n8nChat.default && window.n8nChat.default.createChat);

    if (typeof createChatFn === 'function') {
      mountChat(createChatFn, url);
    } else {
      chatInitAttempts++;
      console.log('[AMADEUS Chat] createChat not available yet. Attempt', chatInitAttempts);
      if (chatInitAttempts < 40) {
        setTimeout(initN8nChat, 200);
      } else {
        console.error('[AMADEUS Chat] Gave up waiting for @n8n/chat. Make sure you are serving the page via HTTP (not file://).');
        if (chatLoadingState) chatLoadingState.style.display = 'none';
      }
    }
  }

  function mountChat(createChatFn, url) {
    isChatInitialized = true;
    console.log('[AMADEUS Chat] Mounting widget into #n8nChatContainer with URL:', url);

    try {
      createChatFn({
        webhookUrl: url,
        target: '#n8nChatContainer',
        mode: 'fullscreen',
        showWelcomeScreen: false,
        loadPreviousSession: true,
        allowFileUploads: false,
        i18n: {
          en: {
            title: 'AMADEUS',
            subtitle: 'Online • Instant answers',
            inputPlaceholder: "Tell us what you're looking to build...",
          },
        },
        initialMessages: [
          "Hi there! 👋",
          "Welcome to AMADEUS.",
          "We're a digital solutions studio helping businesses turn ideas into meaningful digital experiences.",
          "How can I help you today?"
        ],
      });

      // Hide loading spinner once the widget has mounted
      setTimeout(() => {
        if (chatLoadingState) {
          chatLoadingState.style.opacity = '0';
          setTimeout(() => {
            chatLoadingState.style.display = 'none';
          }, 300);
        }
        console.log('[AMADEUS Chat] Widget mounted successfully.');
      }, 500);
    } catch (err) {
      console.error('[AMADEUS Chat] Error mounting widget:', err);
    }
  }

  // Pre-initialize widget when DOM is ready so the conversation is instantly ready on open
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initN8nChat);
  } else {
    initN8nChat();
  }

  /* ---------------------------------------------------------------------------
   * Chatbot Panel Open / Close Controls
   * All website CTAs and the launcher trigger openChat().
   * --------------------------------------------------------------------------- */

  /**
   * Opens the floating chat panel.
   */
  window.openChat = function () {
    lastActiveElement = document.activeElement;

    if (chatPanel) {
      chatPanel.hidden = false;
      void chatPanel.offsetWidth;
      chatPanel.classList.add('is-open');
    }

    if (chatLauncherBtn) {
      chatLauncherBtn.setAttribute('aria-expanded', 'true');
    }

    if (chatBackdrop) {
      chatBackdrop.classList.add('is-open');
    }

    if (window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    }

    // Ensure widget is mounted
    initN8nChat();

    // Trigger resize event so widget recalibrates dimensions now that panel is visible
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      const chatInput = document.querySelector('#n8nChatContainer input, #n8nChatContainer textarea');
      if (chatInput) {
        chatInput.focus();
      } else if (closeChatBtn) {
        closeChatBtn.focus();
      }
    }, 250);
  };

  /**
   * Closes the floating chat panel and restores focus.
   */
  window.closeChat = function () {
    if (chatPanel) {
      chatPanel.classList.remove('is-open');
      setTimeout(() => {
        if (!chatPanel.classList.contains('is-open')) {
          chatPanel.hidden = true;
        }
      }, 300);
    }

    if (chatLauncherBtn) {
      chatLauncherBtn.setAttribute('aria-expanded', 'false');
    }

    if (chatBackdrop) {
      chatBackdrop.classList.remove('is-open');
    }

    document.body.style.overflow = '';

    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    } else if (chatLauncherBtn) {
      chatLauncherBtn.focus();
    }
  };

  /**
   * Toggles the chat panel open/closed state.
   */
  window.toggleChat = function () {
    if (chatPanel && chatPanel.classList.contains('is-open')) {
      window.closeChat();
    } else {
      window.openChat();
    }
  };

  /* ---------------------------------------------------------------------------
   * Keyboard & Click-Away Accessibility
   * --------------------------------------------------------------------------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (chatPanel && chatPanel.classList.contains('is-open')) {
        window.closeChat();
      }
      if (mobileNav && mobileNav.classList.contains('is-open')) {
        window.toggleMobileMenu(false);
      }
    }
  });

  /* ---------------------------------------------------------------------------
   * Mobile Navigation Handling
   * --------------------------------------------------------------------------- */
  window.toggleMobileMenu = function (forcedState) {
    if (!mobileNav || !mobileMenuBtn) return;

    const isOpen = typeof forcedState === 'boolean' 
      ? forcedState 
      : !mobileNav.classList.contains('is-open');

    if (isOpen) {
      mobileNav.classList.add('is-open');
      mobileNav.setAttribute('aria-hidden', 'false');
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
    } else {
      mobileNav.classList.remove('is-open');
      mobileNav.setAttribute('aria-hidden', 'true');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
  };

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function () {
      window.toggleMobileMenu();
    });
  }

  if (mobileNavLinks) {
    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', function () {
        window.toggleMobileMenu(false);
      });
    });
  }

  /* ---------------------------------------------------------------------------
   * Core Motion & Scroll Reveals (Plain CSS + IntersectionObserver)
   * --------------------------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-revealed'));
  }

})();
