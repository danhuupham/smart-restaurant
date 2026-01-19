# 📝 Commit Messages Template - 30 Commits

## Commit Messages Mẫu

### 1. Loyalty Points System

**Commit 1:**
```
feat(loyalty): add database schema for loyalty points system

- Add LoyaltyPoints model (userId, points, tier, totalEarned, totalRedeemed)
- Add Voucher model (code, discountType, discountValue, minOrder, expiryDate)
- Add PointsTransaction model for tracking points history
- Add VoucherRedemption model for voucher usage tracking
- Create migration for loyalty system tables

Related: #loyalty-system
```

**Commit 2:**
```
feat(loyalty): add DTOs and entities for loyalty module

- Create CreatePointsTransactionDto
- Create RedeemVoucherDto
- Create UpdateTierDto
- Create GetPointsHistoryDto
- Add loyalty entities and interfaces

Related: #loyalty-system
```

**Commit 3:**
```
feat(loyalty): implement loyalty service and controller

- Add LoyaltyService with points calculation logic
- Add voucher redemption functionality
- Add points history tracking
- Add tier upgrade/downgrade logic
- Integrate with OrdersService for auto-points
- Add REST API endpoints for loyalty operations

Related: #loyalty-system
```

**Commit 4:**
```
feat(loyalty): add frontend API client and types

- Create loyalty API client
- Add TypeScript types for points, vouchers, tiers
- Add API methods for points operations
- Add error handling for loyalty endpoints

Related: #loyalty-system
```

**Commit 5:**
```
feat(loyalty): add loyalty UI components and pages

- Add PointsDisplay component
- Add VoucherList component
- Add PointsHistory component
- Create customer loyalty page (/guest/loyalty)
- Create admin loyalty management page (/admin/loyalty)
- Add points badges and tier indicators

Related: #loyalty-system
```

---

### 2. Inventory Management

**Commit 6:**
```
feat(inventory): add inventory database schema

- Add Inventory model (productId, quantity, minStock, maxStock, unit)
- Add InventoryTransaction model for tracking stock changes
- Create migration for inventory tables
- Add indexes for performance

Related: #inventory-management
```

**Commit 7:**
```
feat(inventory): implement inventory service and controller

- Add InventoryService with stock management
- Add low stock alert system
- Auto-update inventory on order creation/completion
- Add REST API endpoints for inventory operations
- Add inventory transaction logging

Related: #inventory-management
```

**Commit 8:**
```
feat(inventory): add frontend API client and types

- Create inventory API client
- Add TypeScript types for inventory
- Add API methods for inventory operations

Related: #inventory-management
```

**Commit 9:**
```
feat(inventory): add inventory management UI

- Create admin inventory dashboard (/admin/inventory)
- Add InventoryCard component
- Add LowStockAlert component
- Add stock update forms
- Add inventory statistics display

Related: #inventory-management
```

---

### 3. Peak Hours Analysis

**Commit 10:**
```
feat(analytics): add peak hours analysis service

- Add AnalyticsService with peak hours calculation
- Add hourly statistics aggregation
- Add daily heatmap data generation
- Add time-based order analysis

Related: #peak-hours-analysis
```

**Commit 11:**
```
feat(analytics): add peak hours API endpoints

- Add GET /analytics/peak-hours endpoint
- Add GET /analytics/hourly-stats endpoint
- Add GET /analytics/heatmap endpoint
- Add query parameters for date range filtering

Related: #peak-hours-analysis
```

**Commit 12:**
```
feat(analytics): add frontend API client and types

- Create analytics API client
- Add TypeScript types for analytics data
- Add API methods for peak hours queries

Related: #peak-hours-analysis
```

**Commit 13:**
```
feat(analytics): add peak hours dashboard with charts

- Create analytics dashboard page (/admin/analytics)
- Add PeakHoursChart component with Recharts
- Add HeatmapCalendar component
- Add HourlyStatsChart component
- Add date range picker

Related: #peak-hours-analysis
```

---

### 4. Export Reports

**Commit 14:**
```
feat(export): add PDF export functionality

- Add PDF generation service using PDFKit
- Add revenue report PDF template
- Add invoice PDF template
- Add PDF download endpoint

Related: #export-reports
```

**Commit 15:**
```
feat(export): add Excel export functionality

- Add Excel generation service using xlsx
- Add revenue report Excel export
- Add order list Excel export
- Add Excel download endpoint

Related: #export-reports
```

**Commit 16:**
```
feat(export): add export UI components

- Add ExportButton component
- Add export options in reports page
- Add download handlers for PDF/Excel
- Add export progress indicators

Related: #export-reports
```

---

### 5. Advanced Search

**Commit 17:**
```
feat(search): add advanced search backend

- Extend ProductsService with advanced query builder
- Add multi-filter support (price, allergens, dietary, rating)
- Add AdvancedSearchDto with validation
- Optimize search queries with indexes

Related: #advanced-search
```

**Commit 18:**
```
feat(search): add advanced filter UI components

- Add AdvancedFilters component
- Add FilterSidebar component
- Add PriceRangeSlider component
- Add multi-select filter controls

Related: #advanced-search
```

**Commit 19:**
```
feat(search): integrate advanced filters in menu page

- Add filter sidebar to menu page
- Add URL params for filter state
- Add filter state management
- Add clear filters functionality

Related: #advanced-search
```

---

### 6. Real-time Notifications

**Commit 20:**
```
feat(notifications): add notification service backend

- Add NotificationsService
- Add email notification support
- Add notification queue system
- Add notification preferences

Related: #notifications
```

**Commit 21:**
```
feat(notifications): add web push backend support

- Add PushService for Web Push API
- Add NotificationsGateway for Socket.IO
- Add push subscription management
- Add notification delivery tracking

Related: #notifications
```

**Commit 22:**
```
feat(notifications): add frontend notification service

- Add browser notification API integration
- Add push subscription management
- Add notification permission handling
- Add notification storage

Related: #notifications
```

**Commit 23:**
```
feat(notifications): add notification UI components

- Add NotificationCenter component
- Add NotificationBell component
- Add notification list and badges
- Create notifications page (/admin/notifications)

Related: #notifications
```

---

### 7. Customer Segmentation

**Commit 24:**
```
feat(analytics): add customer segmentation service

- Add SegmentationService with CLV calculation
- Add customer tier classification (VIP, Regular, New)
- Add segmentation rules engine
- Add customer analytics endpoints

Related: #customer-segmentation
```

**Commit 25:**
```
feat(analytics): add customer segmentation database fields

- Add segment field to User model
- Add clv (Customer Lifetime Value) field to User model
- Create migration for new fields
- Add indexes for segmentation queries

Related: #customer-segmentation
```

**Commit 26:**
```
feat(analytics): add customer segmentation UI

- Create customers page (/admin/customers)
- Add CustomerSegmentCard component
- Add CLVChart component
- Add segment badges and filters

Related: #customer-segmentation
```

---

### 8. Dynamic Pricing

**Commit 27:**
```
feat(pricing): add dynamic pricing service

- Add PricingService with time-based rules
- Add happy hour pricing logic
- Add pricing rule management
- Add REST API endpoints for pricing

Related: #dynamic-pricing
```

**Commit 28:**
```
feat(pricing): add dynamic pricing UI

- Create pricing management page (/admin/pricing)
- Add PricingRuleForm component
- Extend PriceDisplay to show dynamic prices
- Add happy hour badges

Related: #dynamic-pricing
```

---

### 9. Order Queue Priority

**Commit 29:**
```
feat(orders): add priority scoring system

- Add priority calculation algorithm
- Add VIP customer priority boost
- Add large order priority boost
- Add wait time priority boost
- Extend OrdersService with priority logic

Related: #order-priority
```

**Commit 30:**
```
feat(orders): add priority display in kitchen

- Add PriorityBadge component
- Extend kitchen page with priority indicators
- Add priority-based sorting
- Add visual priority cues

Related: #order-priority
```

---

## 📋 Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Scopes:**
- `loyalty`, `inventory`, `analytics`, `export`, `search`, `notifications`, `pricing`, `orders`

**Subject:**
- Use imperative mood: "add" not "added" or "adds"
- First letter lowercase
- No period at the end
- Max 50 characters

**Body:**
- Explain what and why, not how
- Wrap at 72 characters
- Use bullet points for multiple changes

**Footer:**
- Reference issues: `Related: #issue-number`
- Breaking changes: `BREAKING CHANGE: description`

---

## 🎯 Best Practices

1. **One feature per commit** - Don't mix multiple features
2. **Atomic commits** - Each commit should be complete and working
3. **Clear messages** - Explain what and why
4. **Related issues** - Link to feature tracking
5. **Test before commit** - Ensure code works before committing
