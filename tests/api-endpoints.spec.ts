import { test, expect } from "@playwright/test";

/**
 * BAGHDAD SHOP — Comprehensive Backend API Endpoint Suite
 * Tests all 8 controller modules on http://localhost:5001
 */

const API_BASE = "http://localhost:5001/api";

let authToken = "";
let adminToken = "";
let createdOrderId = "";

test.describe.serial("📡 Backend API Endpoint Suite", () => {

  // 1. Health Ping
  test("GET /api/ping — Health check", async ({ request }) => {
    const res = await request.get(`${API_BASE}/ping`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status.toLowerCase()).toBe("ok");
    expect(body.message.toLowerCase()).toContain("awake");
  });

  // 2. Auth: Login Customer & Admin
  test("POST /api/auth/login — Customer Login", async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: "customer@mail.com",
        password: "Baghdad@2026",
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toBeTruthy();
    authToken = body.token;
  });

  test("POST /api/auth/login — Admin Login", async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: "admin@mail.com",
        password: "Baghdad@2026",
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toBeTruthy();
    adminToken = body.token;
  });

  test("GET /api/users/profile — Current User Profile", async ({ request }) => {
    const res = await request.get(`${API_BASE}/users/profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.email).toBe("customer@mail.com");
  });

  // 3. Products Endpoints
  test("GET /api/products — Fetch All Products", async ({ request }) => {
    const res = await request.get(`${API_BASE}/products`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    const products = body.products || body;
    expect(Array.isArray(products)).toBeTruthy();
    expect(products.length).toBeGreaterThan(0);
  });

  test("GET /api/products?category=appliances — Fetch Category Products", async ({ request }) => {
    const res = await request.get(`${API_BASE}/products?category=appliances`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    const products = body.products || body;
    expect(Array.isArray(products)).toBeTruthy();
  });

  test("POST /api/chat/ask — AI Chatbot Response", async ({ request }) => {
    const res = await request.post(`${API_BASE}/chat/ask`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        message: "What products do you have?",
        history: []
      }
    });
    expect(res.status()).toBeLessThan(500);
    const body = await res.json();
    expect(body.response || body.message || body.reply || body.error).toBeDefined();
  });

  // 5. Orders Endpoints
  test("POST /api/orders/payment-order — Create Razorpay Payment Order", async ({ request }) => {
    const pRes = await request.get(`${API_BASE}/products`);
    const pBody = await pRes.json();
    const product = (pBody.products || pBody)[0];

    const res = await request.post(`${API_BASE}/orders/payment-order`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        customerName: "Test Customer",
        email: "customer@mail.com",
        paymentMethod: "card",
        shippingAddress: {
          street: "123 Test St",
          area: "Central",
          city: "Baghdad",
          phone: "9876543210"
        },
        orderItems: [
          {
            productId: product._id || product.id,
            title: product.title,
            price: product.priceAfterDiscount || product.price,
            count: 1,
            category: product.category || "appliances"
          }
        ]
      }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBeTruthy();
    expect(body.amount).toBeGreaterThan(0);
  });

  test("POST /api/orders — Create COD Order", async ({ request }) => {
    const pRes = await request.get(`${API_BASE}/products`);
    const pBody = await pRes.json();
    const product = (pBody.products || pBody)[0];

    const res = await request.post(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        customerName: "Test Customer",
        email: "customer@mail.com",
        paymentMethod: "cash",
        shippingAddress: {
          street: "123 Test St",
          area: "Central",
          city: "Baghdad",
          phone: "9876543210"
        },
        orderItems: [
          {
            productId: product._id || product.id,
            title: product.title,
            price: product.priceAfterDiscount || product.price,
            count: 1,
            category: product.category || "appliances"
          }
        ]
      }
    });
    expect([200, 201]).toContain(res.status());
    const order = await res.json();
    expect(order._id).toBeTruthy();
    createdOrderId = order._id;
  });

  test("GET /api/orders/user — Get Customer Orders", async ({ request }) => {
    const res = await request.get(`${API_BASE}/orders/user`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(200);
    const orders = await res.json();
    expect(Array.isArray(orders)).toBeTruthy();
    expect(orders.length).toBeGreaterThan(0);
  });

  test("GET /api/orders (Admin) — Fetch All Orders", async ({ request }) => {
    const res = await request.get(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
    const orders = await res.json();
    expect(Array.isArray(orders)).toBeTruthy();
  });

  test("PUT /api/orders/{id} — Update Order Status & Shipping Info", async ({ request }) => {
    expect(createdOrderId).toBeTruthy();
    const res = await request.put(`${API_BASE}/orders/${createdOrderId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        status: "shipped",
        trackingNumber: "TRK-PLAYWRIGHT-999",
        courierPartner: "DHL Express"
      }
    });
    expect(res.status()).toBe(200);
    const updated = await res.json();
    expect(updated.status).toBe("shipped");
    expect(updated.trackingNumber).toBe("TRK-PLAYWRIGHT-999");
    expect(updated.courierPartner).toBe("DHL Express");
  });

  // 6. Users Endpoints (Admin)
  test("GET /api/users (Admin) — Fetch All Users", async ({ request }) => {
    const res = await request.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
    const users = await res.json();
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThan(0);
  });

  // 7. Statistics Endpoint (Admin)
  test("GET /api/statistics (Admin) — Dashboard Metrics", async ({ request }) => {
    const res = await request.get(`${API_BASE}/statistics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
    const stats = await res.json();
    expect(stats.totalRevenue).toBeDefined();
    expect(stats.ordersCount).toBeDefined();
    expect(stats.usersCount).toBeDefined();
    expect(stats.productsCount).toBeDefined();
  });

});
