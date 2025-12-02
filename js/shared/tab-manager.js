// Tab Manager - Handles switching between different tracker tabs

class TabManager {
  constructor() {
    this.activeTab = 'installments';
    this.tabs = new Map();
    this.initialized = false;
  }

  /**
   * Register a tab with its initialization and cleanup functions
   * @param {string} id - Tab identifier (e.g., 'installments', 'medicine')
   * @param {Function} initFunction - Function to call when tab becomes active
   * @param {Function} cleanupFunction - Function to call when tab becomes inactive
   */
  registerTab(id, initFunction = null, cleanupFunction = null) {
    this.tabs.set(id, {
      init: initFunction,
      cleanup: cleanupFunction,
      element: document.getElementById(`${id}Tab`),
      button: document.querySelector(`[data-tab="${id}"]`)
    });
    console.log(`📑 Tab registered: ${id}`);
  }

  /**
   * Switch to a specific tab
   * @param {string} tabId - ID of the tab to switch to
   */
  switchTab(tabId) {
    if (!this.tabs.has(tabId)) {
      console.error(`❌ Tab not found: ${tabId}`);
      return;
    }

    console.log(`🔄 Switching to tab: ${tabId}`);

    // Run cleanup for current active tab
    const currentTab = this.tabs.get(this.activeTab);
    if (currentTab && currentTab.cleanup) {
      currentTab.cleanup();
    }

    // Hide all tab contents and deactivate all buttons
    this.tabs.forEach((tab, id) => {
      if (tab.element) {
        tab.element.classList.remove('active');
      }
      if (tab.button) {
        tab.button.classList.remove('active');
      }
    });

    // Show selected tab content and activate button
    const selectedTab = this.tabs.get(tabId);
    if (selectedTab.element) {
      selectedTab.element.classList.add('active');
    }
    if (selectedTab.button) {
      selectedTab.button.classList.add('active');
    }

    // Update active tab
    this.activeTab = tabId;

    // Update URL hash
    window.location.hash = tabId;

    // Run initialization for new tab
    if (selectedTab.init) {
      selectedTab.init();
    }

    console.log(`✅ Switched to tab: ${tabId}`);
  }

  /**
   * Initialize tab manager and set up event listeners
   */
  init() {
    if (this.initialized) {
      console.warn('⚠️ Tab manager already initialized');
      return;
    }

    console.log('🚀 Initializing tab manager...');

    // Set up click listeners for all tab buttons
    this.tabs.forEach((tab, id) => {
      if (tab.button) {
        tab.button.addEventListener('click', () => {
          this.switchTab(id);
        });
      }
    });

    // Handle browser back/forward buttons
    window.addEventListener('hashchange', () => {
      this.initFromURL();
    });

    // Initialize from URL or default to first tab
    this.initFromURL();

    this.initialized = true;
    console.log('✅ Tab manager initialized');
  }

  /**
   * Initialize tab from URL hash
   */
  initFromURL() {
    const hash = window.location.hash.substring(1); // Remove '#'
    
    if (hash && this.tabs.has(hash)) {
      this.switchTab(hash);
    } else {
      // Default to first registered tab or 'installments'
      const defaultTab = this.tabs.has('installments') ? 'installments' : this.tabs.keys().next().value;
      this.switchTab(defaultTab);
    }
  }

  /**
   * Get the currently active tab ID
   * @returns {string} Active tab ID
   */
  getActiveTab() {
    return this.activeTab;
  }

  /**
   * Check if a tab is registered
   * @param {string} tabId - Tab ID to check
   * @returns {boolean} True if tab is registered
   */
  hasTab(tabId) {
    return this.tabs.has(tabId);
  }
}

// Create global instance
const tabManager = new TabManager();

