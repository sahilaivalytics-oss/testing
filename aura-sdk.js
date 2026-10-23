/**
 * Aura Feature Flag Lightweight Client SDK
 * Connects directly to the Aura Platform Evaluation API
 */

export class AuraClient {
  constructor(options = {}) {
    this.endpoint = options.endpoint || 'http://localhost:8080/api/v1/evaluate';
    this.apiKey = options.apiKey || 'aura_pk_live_84543af8d688414f9be90d2581d3ecab';
    this.environment = options.environment || 'development';
    this.pollIntervalMs = options.pollIntervalMs || 2500;
    this.flags = options.defaultFlags || {
      'dark-mode': true,
      'ai-copilot-beta': true,
      'fast-checkout-v2': false,
      'announcement-banner': true
    };
    this.listeners = new Set();
    this.timer = null;
    this.isPolling = false;
    this.lastEvaluatedAt = null;
    this.lastError = null;
  }

  /**
   * Set active environment (development, staging, production)
   */
  setEnvironment(envSlug) {
    if (this.environment !== envSlug) {
      this.environment = envSlug;
      return this.evaluate();
    }
    return Promise.resolve(this.flags);
  }

  /**
   * Subscribe to flag updates
   */
  onUpdate(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all registered listeners
   */
  notify(changedFlags, isInitial = false) {
    this.listeners.forEach((fn) => {
      try {
        fn({
          flags: { ...this.flags },
          changedFlags,
          environment: this.environment,
          evaluatedAt: this.lastEvaluatedAt,
          isInitial
        });
      } catch (err) {
        console.error('[AuraSDK] Error in listener callback:', err);
      }
    });
  }

  /**
   * Check whether a specific feature flag is enabled
   */
  isEnabled(key, defaultValue = false) {
    return this.flags[key] !== undefined ? Boolean(this.flags[key]) : defaultValue;
  }

  /**
   * Evaluate flags from Aura API
   */
  async evaluate() {
    const url = `${this.endpoint}?apiKey=${encodeURIComponent(this.apiKey)}&env=${encodeURIComponent(this.environment)}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Aura API returned status ${response.status}`);
      }

      const data = await response.json();
      const newFlags = data.flags || {};
      this.lastEvaluatedAt = data.evaluatedAt || new Date().toISOString();
      this.lastError = null;

      // Detect differences
      const changed = {};
      let hasChanges = false;
      for (const [key, val] of Object.entries(newFlags)) {
        if (this.flags[key] !== val) {
          changed[key] = { from: this.flags[key], to: val };
          hasChanges = true;
        }
      }

      this.flags = { ...this.flags, ...newFlags };

      this.notify(changed, !this.lastEvaluatedAt);
      return this.flags;
    } catch (err) {
      this.lastError = err;
      console.warn('[AuraSDK] Evaluation fallback active:', err.message);
      // Still notify so UI knows fallback flags are active
      return this.flags;
    }
  }

  /**
   * Start polling for live remote changes
   */
  startPolling(intervalMs) {
    if (intervalMs) this.pollIntervalMs = intervalMs;
    this.stopPolling();
    this.isPolling = true;
    this.evaluate();
    this.timer = setInterval(() => {
      this.evaluate();
    }, this.pollIntervalMs);
  }

  /**
   * Stop polling
   */
  stopPolling() {
    this.isPolling = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
