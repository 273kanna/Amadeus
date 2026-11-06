# AMADEUS — Digital Solutions Studio

AMADEUS is a bespoke digital solutions studio specializing in high-performance web engineering, intelligent workflow automations, and custom AI agents. 

This repository contains the complete frontend website and native conversational AI integration powered by an **n8n Cloud AI Agent (Gemini Flash-Lite + Simple Memory)**. When visitors chat with the concierge, qualified lead data is automatically recorded in **Google Sheets** and dispatched via **Gmail HTML notifications**.

---

## 1. Technical Constraints & Architecture

- **Pure Web Standards:** Plain HTML5, CSS3, and vanilla JavaScript.
- **Zero Build Tools:** No Node.js, no npm, no Docker, and no frameworks required.
- **Typography:** Google Fonts — [DM Sans](https://fonts.google.com/specimen/DM+Sans) (UI, body, metadata) & [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) (editorial headlines & display numerals).
- **Design Aesthetic:** Light warm ivory canvas (`#f8f6f0`), deep charcoal typography (`#181715`), and a sophisticated **Kurisu Makise deep chestnut crimson / maroon accent** (`#8b2635`) inspired by *Steins;Gate*.
- **Motion:** Purposeful, dependency-free CSS keyframes and a lightweight `IntersectionObserver` scroll-reveal system that respects `prefers-reduced-motion`.

---

## 2. File Structure

```
├── index.html        # Semantic page markup, sections, and floating chat panel
├── styles.css        # Design tokens, typography scale, responsive layout, and widget overrides
├── script.js         # Nav collapse, scroll reveals, panel toggle, and @n8n/chat widget loader
├── config.js         # Single configuration file containing the production CHAT_URL
├── PLAN.md           # Source of truth project plan and status checklist
└── README.md         # Architecture, deployment, and testing documentation
```

---

## 3. Chatbot Integration Architecture

The website integrates the official **`@n8n/chat`** widget natively inside the AMADEUS floating panel container (`#n8nChatContainer`):

1. **Why `@n8n/chat` over standard `<iframe>`:**  
   n8n Cloud hosted chat endpoints return `X-Frame-Options: SAMEORIGIN`, which modern browsers block when embedded directly via third-party `<iframe>` tags. The official `@n8n/chat` client communicates directly with the n8n Chat Trigger over CORS, allowing visitors to chat seamlessly right on the website without being redirected.
2. **Robust Zero-Build Embedding:**  
   [`index.html`](file:///f:/Amadeus/index.html) loads the official `@n8n/chat` UMD script and stylesheet from CDN. On load, [`script.js`](file:///f:/Amadeus/script.js) executes `window.n8nChat.createChat(...)` with `target: '#n8nChatContainer'` and `mode: 'fullscreen'`. This guarantees that the chat UI mounts 100% inside the floating panel under all environments (including local `file:///` viewing, static dev servers, and live production deployments). No standalone chat redirects or fallback popups are used.
3. **Design Consistency:**  
   The chat widget inherits the website's CSS variables (`--chat--color-primary: #8b2635`). The widget's redundant internal header is suppressed, letting the bespoke AMADEUS panel header (with studio avatar, green online status dot, and close button) serve as the unified frame.
4. **Where to Edit Configuration:**  
   The webhook URL is configured solely in [`config.js`](file:///f:/Amadeus/config.js):
   ```javascript
   const CHAT_URL = "https://amadeus.app.n8n.cloud/webhook/7e5f0619-387b-442e-ae9f-7fccab94372c/chat";
   ```
   No API keys, credentials, or backend secrets are ever placed in frontend code.

---

## 4. How to Run Locally (No Installation Needed)

### Option 1: Direct in Browser (Simplest)
1. Double-click [`index.html`](file:///f:/Amadeus/index.html) in your Windows File Explorer (or right-click → *Open With* → Chrome / Edge / Firefox).
2. The site opens immediately using standard browser capabilities.

### Option 2: Live Server Extension
1. Open the folder in VS Code or Antigravity IDE.
2. Right-click [`index.html`](file:///f:/Amadeus/index.html) and select **Open with Live Server** (or click "Go Live" in the status bar).
3. The site opens at `http://127.0.0.1:5500`.

### Option 3: Python Built-in Static Server
If Python is installed on your machine, open PowerShell in the project directory and run:
```powershell
python -m http.server 3000
```
Then navigate to `http://localhost:3000`.

---

## 5. End-to-End Testing Guide

1. Open [`index.html`](file:///f:/Amadeus/index.html).
2. Click the floating chat button in the bottom right corner (or click any **Let's Talk** / **Start a conversation** button across the page).
3. The floating panel smoothly opens, displaying the **AMADEUS Concierge** with initial greeting messages.
4. Send a test message and complete the qualification questions with the Gemini AI agent:
   - **Name:** e.g. *Elena Vance*
   - **Email / Phone:** e.g. *elena@example.com*
   - **Service Interested In:** e.g. *Website Development* or *Workflow Automation*
   - **Budget / Scope:** e.g. *$5,000 / Q2 launch*
5. Verify the backend automation:
   - **Google Sheets (`Customer_Leads`):** Confirm a new row appears with name, contact, selected service, budget, and automatic UTC timestamp.
   - **Gmail Notification:** Confirm an HTML notification email with formatted lead details arrives in the business owner's inbox.

---

## 6. How to Deploy (No Build Step)

### Option 1: Netlify Drop (Instant Drag-and-Drop)
1. Navigate to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the `Amadeus` folder directly into the browser upload box.
3. Netlify will instantly provide a live, SSL-secured public URL (e.g. `https://amadeus-studio.netlify.app`).

### Option 2: GitHub Pages
1. Initialize git and commit:
   ```bash
   git add .
   git commit -m "Deploy AMADEUS studio website with embedded n8n chat widget"
   git push origin main
   ```
2. On GitHub, go to your repository **Settings** → **Pages**.
3. Under **Branch**, select `main` and root `/`, then click **Save**.
4. Your site will be live at `https://<username>.github.io/<repo-name>/`.

### Option 3: Cloudflare Pages
1. Log into your Cloudflare dashboard and go to **Workers & Pages** → **Create application** → **Pages**.
2. Connect your GitHub repository or use direct folder upload.
3. Leave build command empty and set the output directory to `/`.

---

## 7. License & Credits

- Crafted for **AMADEUS Studio**.
- Fictional showcase project built for interview demonstration.
- Plain HTML5, CSS3 & vanilla JS.

