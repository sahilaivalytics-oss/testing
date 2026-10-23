import { AuraClient } from './aura-sdk.js';

// Sample Product Catalog
const PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Aura Developer Mechanical Keyboard',
    category: 'Peripherals',
    price: 189.00,
    rating: 4.9,
    description: 'Hot-swappable tactile switches with customizable RGB and aluminum casing.',
    badge: 'Popular',
    image: '⌨️'
  },
  {
    id: 'prod-2',
    name: 'UltraWide 38" Curved IPS Monitor',
    category: 'Displays',
    price: 849.00,
    rating: 4.8,
    description: '144Hz high refresh rate, 99% DCI-P3 color calibration for engineers.',
    badge: 'Pro Tier',
    image: '🖥️'
  },
  {
    id: 'prod-3',
    name: 'Noise-Canceling Studio Headphones',
    category: 'Audio',
    price: 299.00,
    rating: 4.9,
    description: 'Active noise cancellation with 40-hour battery life and deep acoustics.',
    badge: 'Best Seller',
    image: '🎧'
  },
  {
    id: 'prod-4',
    name: 'Ergonomic Mesh Task Chair',
    category: 'Furniture',
    price: 499.00,
    rating: 4.7,
    description: 'Dynamic lumbar support and 4D adjustable armrests for long coding sessions.',
    badge: 'Ergo',
    image: '🪑'
  }
];

// Initialize Cart State
let cart = [
  { ...PRODUCTS[0], quantity: 1 }
];

// Initialize Aura Client SDK
const aura = new AuraClient({
  endpoint: 'http://localhost:8080/api/v1/evaluate',
  apiKey: 'aura_pk_live_84543af8d688414f9be90d2581d3ecab',
  environment: 'development',
  pollIntervalMs: 2500
});

// Logs array for Inspector
const inspectorLogs = [];

function addInspectorLog(msg) {
  const time = new Date().toLocaleTimeString();
  inspectorLogs.unshift(`[${time}] ${msg}`);
  if (inspectorLogs.length > 20) inspectorLogs.pop();
  renderInspectorLogs();
}

function renderInspectorLogs() {
  const logEl = document.getElementById('inspector-logs');
  if (logEl) {
    logEl.innerHTML = inspectorLogs.map(l => `<div>${l}</div>`).join('');
  }
}

// Render Products Grid
function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const isFastCheckoutEnabled = aura.isEnabled('fast-checkout-v2');

  grid.innerHTML = PRODUCTS.map(prod => `
    <div class="product-card" data-id="${prod.id}">
      <div class="product-image-wrap">
        <span style="font-size: 4rem;">${prod.image}</span>
        <span class="product-card-badge">${prod.badge}</span>
      </div>
      <div class="product-info">
        <span class="product-category">${prod.category}</span>
        <h3 class="product-title">${prod.name}</h3>
        <p class="product-desc">${prod.description}</p>
        <div class="product-footer">
          <div class="product-price">$${prod.price.toFixed(2)}</div>
          <button class="btn-add-cart" onclick="window.addToCart('${prod.id}')">
            + Add to Cart
          </button>
        </div>
        ${isFastCheckoutEnabled ? `
          <button class="btn-fast-checkout" onclick="window.triggerFastCheckout('${prod.id}')">
            ⚡ 1-Click Fast Checkout
          </button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// Render Cart Drawer
function renderCart() {
  const countEl = document.getElementById('cart-count');
  const itemsContainer = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total-amount');

  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (countEl) countEl.innerText = totalCount;
  if (totalEl) totalEl.innerText = `$${totalPrice.toFixed(2)}`;

  if (itemsContainer) {
    if (cart.length === 0) {
      itemsContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">Your cart is empty.</div>`;
    } else {
      itemsContainer.innerHTML = cart.map(item => `
        <div style="display: flex; gap: 1rem; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem;">
          <div style="font-size: 2rem;">${item.image}</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 0.9rem;">${item.name}</div>
            <div style="color: var(--text-muted); font-size: 0.8rem;">$${item.price.toFixed(2)} × ${item.quantity}</div>
          </div>
          <div style="display: flex; gap: 0.4rem; align-items: center;">
            <button onclick="window.updateQuantity('${item.id}', -1)" style="border: 1px solid var(--border); background: var(--bg-card); padding: 0.2rem 0.5rem; border-radius: 4px; cursor: pointer;">-</button>
            <span style="font-size: 0.85rem; font-weight: 600;">${item.quantity}</span>
            <button onclick="window.updateQuantity('${item.id}', 1)" style="border: 1px solid var(--border); background: var(--bg-card); padding: 0.2rem 0.5rem; border-radius: 4px; cursor: pointer;">+</button>
          </div>
        </div>
      `).join('');
    }
  }

  // Update Cart Fast Checkout Button based on feature flag
  const cartFastBtn = document.getElementById('cart-fast-checkout-btn');
  if (cartFastBtn) {
    const isFast = aura.isEnabled('fast-checkout-v2');
    cartFastBtn.classList.toggle('hidden', !isFast);
  }
}

// Global Cart Actions
window.addToCart = (productId) => {
  const prod = PRODUCTS.find(p => p.id === productId);
  if (!prod) return;
  const existing = cart.find(p => p.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...prod, quantity: 1 });
  }
  renderCart();
  window.openCart();
};

window.updateQuantity = (productId, delta) => {
  const item = cart.find(p => p.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(p => p.id !== productId);
  }
  renderCart();
};

window.openCart = () => {
  document.getElementById('cart-overlay')?.classList.add('open');
  document.getElementById('cart-drawer')?.classList.add('open');
};

window.closeCart = () => {
  document.getElementById('cart-overlay')?.classList.remove('open');
  document.getElementById('cart-drawer')?.classList.remove('open');
};

window.triggerFastCheckout = (productId) => {
  const prod = PRODUCTS.find(p => p.id === productId) || cart[0];
  alert(`⚡ AURA FAST CHECKOUT ACTIVATED!\n\nFeature Flag 'fast-checkout-v2' is ENABLED for ${aura.environment}.\n\nSimulated Instant 1-Click Purchase:\nItem: ${prod?.name || 'Cart Order'}\nTotal: $${prod?.price || 189}\nPayment Method: Apple Pay (Instant Auth)`);
};

// Apply Aura Flags to UI
function applyFeatureFlags({ flags, changedFlags, environment, isInitial }) {
  // 1. Dark Mode Theme Flag
  const isDark = aura.isEnabled('dark-mode');
  document.body.classList.toggle('dark', isDark);

  // 2. Announcement Banner Flag
  const isBanner = aura.isEnabled('announcement-banner', true);
  const bannerEl = document.getElementById('announcement-banner');
  if (bannerEl) bannerEl.classList.toggle('hidden', !isBanner);

  // 3. AI Copilot Beta Widget Flag
  const isCopilot = aura.isEnabled('ai-copilot-beta');
  const copilotEl = document.getElementById('copilot-widget-container');
  if (copilotEl) copilotEl.classList.toggle('hidden', !isCopilot);

  // 4. Products Fast Checkout Buttons
  renderProducts();
  renderCart();

  // 5. Update Status Tickers
  updateTickers();

  // 6. Update Inspector Payload
  const rawPayloadEl = document.getElementById('inspector-payload');
  if (rawPayloadEl) {
    rawPayloadEl.innerText = JSON.stringify(flags, null, 2);
  }

  // 7. Log updates
  if (changedFlags && Object.keys(changedFlags).length > 0) {
    for (const [key, change] of Object.entries(changedFlags)) {
      addInspectorLog(`🚨 Flag change detected: '${key}' changed from ${change.from} -> ${change.to}`);
    }
  } else if (isInitial) {
    addInspectorLog(`🟢 Connected to Aura Platform (${environment}): ${Object.keys(flags).length} flags evaluated.`);
  } else {
    // heartbeat
  }
}

function updateTickers() {
  const flags = aura.flags;
  const container = document.getElementById('ticker-flags-container');
  if (!container) return;

  container.innerHTML = Object.entries(flags).map(([key, val]) => `
    <span class="ticker-flag ${val ? 'on' : 'off'}">
      ${val ? '●' : '○'} ${key}: <strong>${val ? 'ON' : 'OFF'}</strong>
    </span>
  `).join('');
}

// AI Copilot Chat Interaction
window.toggleCopilotModal = () => {
  const modal = document.getElementById('copilot-modal');
  if (modal) {
    modal.style.display = modal.style.display === 'none' || !modal.style.display ? 'flex' : 'none';
  }
};

window.sendCopilotQuery = (queryText) => {
  const chatBody = document.getElementById('copilot-chat-body');
  const input = document.getElementById('copilot-input-field');
  const query = queryText || input?.value?.trim();
  if (!query) return;

  // Add User bubble
  const userDiv = document.createElement('div');
  userDiv.className = 'chat-bubble user';
  userDiv.innerText = query;
  chatBody.appendChild(userDiv);

  if (input) input.value = '';

  // Simulate AI Response
  setTimeout(() => {
    let response = "I'm your Aura-powered AI assistant! Let me help you find the best developer setup today.";
    if (query.toLowerCase().includes('keyboard')) {
      response = "Our Aura Mechanical Keyboard features hot-swappable tactile switches and is our #1 rated item!";
    } else if (query.toLowerCase().includes('fast') || query.toLowerCase().includes('checkout')) {
      response = `Fast Checkout v2 is currently ${aura.isEnabled('fast-checkout-v2') ? 'ENABLED' : 'DISABLED'} in ${aura.environment}. You can test 1-click purchases now!`;
    } else if (query.toLowerCase().includes('monitor') || query.toLowerCase().includes('display')) {
      response = "The UltraWide 38\" IPS display gives you dual-screen productivity in a single bezel-less panel.";
    }

    const botDiv = document.createElement('div');
    botDiv.className = 'chat-bubble bot';
    botDiv.innerText = response;
    chatBody.appendChild(botDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 400);
};

// Window load setup
window.addEventListener('DOMContentLoaded', () => {
  // Subscribe to Aura updates
  aura.onUpdate((state) => {
    applyFeatureFlags(state);
  });

  // Start real-time polling every 2.5s
  aura.startPolling(2500);

  // Environment Selector Change
  const envSelect = document.getElementById('aura-env-select');
  if (envSelect) {
    envSelect.value = aura.environment;
    envSelect.addEventListener('change', async (e) => {
      const newEnv = e.target.value;
      addInspectorLog(`🔄 Switching Aura environment to: '${newEnv}'...`);
      await aura.setEnvironment(newEnv);
    });
  }

  // Manual Refresh Button
  document.getElementById('btn-manual-sync')?.addEventListener('click', async () => {
    addInspectorLog('⚡ Manual evaluation requested...');
    await aura.evaluate();
  });

  // Toggle Inspector Drawer
  document.getElementById('inspector-toggle-btn')?.addEventListener('click', () => {
    document.getElementById('aura-inspector-dock')?.classList.toggle('open');
  });

  // Initial render
  renderProducts();
  renderCart();
  addInspectorLog('🚀 NovaStore initialized with Aura Feature Flag SDK.');
});
