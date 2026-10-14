# 🛍️ Baghdad Shop - Frontend Client

High-performance, modern React 19 Single Page Application (SPA) built with Vite, TypeScript, Tailwind CSS 4.0, and Redux Toolkit.

---

## 🚀 Features

- **Storefront & Catalog:** Responsive categories, product sliders, filtering, discount calculation, and search.
- **Cart & Checkout:** Real-time cart state, discount validation, Razorpay payment gateway integration.
- **Authentication:** JWT-based login, register, password reset, and email verification workflows.
- **Admin Command Center:** Complete dashboard with product orchestration, user management, order processing, shipping labels, and invoices.
- **Customer Hub:** User profile, order history, address book, saved items, and live AI assistant chat bubble.
- **Vercel Ready:** Preconfigured with `vercel.json` rewrite rules for client-side SPA routing.

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: v20 or higher
- **npm**: v10 or higher

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Set the backend API URL and Razorpay Key:
```env
VITE_API_URL=http://localhost:5001/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
The application will start at `http://localhost:3050`.

### 5. Production Build
```bash
npm run build
```
Build output is saved to the `dist/` directory.

---

## 🌐 Deployment (Vercel)
This repository is configured for immediate zero-config deployment to Vercel:
1. Framework Preset: **Vite**
2. Root Directory: `./` (or repository root)
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables:
   - `VITE_API_URL`: Your deployed backend API URL (e.g. `https://api.yourdomain.com/api`)
   - `VITE_RAZORPAY_KEY_ID`: Your Razorpay Key ID
