> This document defines the working schedule and remaining development tasks for the Smart Restaurant project.

## Working Time Schedule

| Member    | Time Slot  |
|-----------|------------|
| Dai Hiep  | 06:00 – 12:00 |
| Huu Dan   | 12:00 – 18:00 |
| Hoang Vu  | 18:00 – 24:00 |

The working order rotates daily following this sequence:
1 → 2 → 3 → 1

# Project Remaining Tasks

**Notes:**
- Check the boxes when a task is completed.
- Add new tasks if additional requirements are identified.
- Each task should include: a clear goal, task name, subtasks with checkboxes, and a commit message.

---

## Module 1: Authentication & Authorization
**Goal:** Secure internal pages (Kitchen, Waiter, Admin).

- [ ] **Task 1.1: Authentication Logic & API**
  - [ ] Install `jsonwebtoken`, `cookies-next`.
  - [ ] Create `lib/auth.ts` (JWT sign & verify utilities).
  - [ ] Implement API `POST /api/auth/login`.
  - *Commit:* `feat: implement jwt authentication logic and login API`

- [ ] **Task 1.2: Login UI**
  - [ ] Create `app/login/page.tsx`.
  - [ ] Build login form (Email / Password).
  - [ ] Handle redirect after successful login.
  - *Commit:* `feat: implement login page UI and authentication flow`

- [ ] **Task 1.3: Route Protection Middleware**
  - [ ] Create `middleware.ts`.
  - [ ] Restrict access to `/admin`, `/kitchen`, `/waiter` when no valid token is found.
  - *Commit:* `feat: add middleware to protect private routes`

---

## Module 2: Admin Dashboard
**Goal:** Manage products and tables without modifying code or database directly.

- [ ] **Task 2.1: Admin Layout & Product Listing**
  - [ ] Create `app/admin/layout.tsx` (Sidebar navigation).
  - [ ] Create `app/admin/products/page.tsx` (Product table view).
  - *Commit:* `feat: setup admin layout and product list view`

- [ ] **Task 2.2: Product CRUD (Create / Update)**
  - [ ] Implement API `POST /api/products` and `PUT /api/products`.
  - [ ] Create modal/form to add or edit products (Name, Price, Image, Category).
  - *Commit:* `feat: enable admin product creation and editing`

---

## Module 3: Table & QR Code Management
**Goal:** Generate QR codes for each table.

- [ ] **Task 3.1: Table Management**
  - [ ] Create `app/admin/tables/page.tsx`.
  - [ ] Display table list fetched from the database.
  - [ ] Implement functionality to add new tables.
  - *Commit:* `feat: implement table management interface`

- [ ] **Task 3.2: QR Code Generation**
  - [ ] Install `qrcode.react`.
  - [ ] Create modal to display QR code for each table.
  - [ ] QR URL format:  
        `http://{LAN_IP}:3000/guest/menu?tableId={id}`
  - *Commit:* `feat: generate QR codes for restaurant tables`

---

## Module 4: Payment & Checkout
**Goal:** Complete the order lifecycle.

- [ ] **Task 4.1: Bill & Payment UI**
  - [ ] Create a "Temporary Bill" modal on the Waiter screen.
  - [ ] Display a static payment QR code (demo purpose).
  - *Commit:* `feat: display order bill summary modal`

- [ ] **Task 4.2: Checkout Logic**
  - [ ] Implement API to update order status to `COMPLETED`.
  - [ ] Emit socket event when an order is completed.
  - *Commit:* `feat: implement checkout logic and order completion flow`

---

## Module 5: Deployment
**Goal:** Package and run the system across different environments.

- [ ] **Task 5.1: Dockerfile**
  - [ ] Create a production-ready `Dockerfile` for the Next.js application.
  - *Commit:* `ops: add Dockerfile for production build`

- [ ] **Task 5.2: Full Stack Docker Compose**
  - [ ] Update `docker-compose.yml` to include App, Database, and Socket services.
  - *Commit:* `ops: finalize docker-compose setup for full-stack deployment`
