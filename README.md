# ⚡ NovaStore — Aura Feature Flag Client Test Application

NovaStore is a modern developer hardware storefront application built to showcase real-time remote configuration and feature flagging using the **Aura Distributed Feature Flag Platform**.

---

## 🚀 Live Feature Flags Demonstrated

| Feature Flag Key | Type | Description | Effect on NovaStore |
| :--- | :--- | :--- | :--- |
| `dark-mode` | Boolean | UI Theme Control | Dynamically switches theme between Light Mode and Dark Mode in real-time. |
| `ai-copilot-beta` | Boolean | Interactive AI Shopping Assistant | Toggles the floating AI Copilot widget and intelligent recommendation dialog. |
| `fast-checkout-v2` | Boolean | Accelerated 1-Click Checkout | Enables 1-Click Apple Pay / Google Pay simulated instant checkout button. |
| `announcement-banner` | Boolean | Global Marketing Announcement | Controls top flash sale promo bar. |

---

## 🔌 Aura SDK Integration

NovaStore uses `aura-sdk.js` to evaluate flags from the Aura Platform:

```javascript
import { AuraClient } from './aura-sdk.js';

const aura = new AuraClient({
  endpoint: 'http://localhost:8080/api/v1/evaluate',
  apiKey: 'aura_pk_live_84543af8d688414f9be90d2581d3ecab',
  environment: 'development',
  pollIntervalMs: 2500
});

// React to live changes
aura.onUpdate(({ flags, changedFlags, environment }) => {
  document.body.classList.toggle('dark', aura.isEnabled('dark-mode'));
  // Update other dynamic components...
});
```

---

## 🏃‍♂️ How to Run Locally

### Option 1: Using npm (Port 3000)
```bash
npm start
# or
npm run dev
```

### Option 2: Direct Browser Opening
Simply double-click or open `index.html` in Google Chrome or any modern browser!

---

## 🌿 Git Branches & Feature Links

This repository is connected to Aura's GitHub integration module:
- `main`: Stable production storefront baseline.
- `feature/fast-checkout-v2`: Accelerated checkout feature branch linked in Aura.
- `feature/ai-copilot-beta`: AI Shopping Copilot assistant feature branch.
