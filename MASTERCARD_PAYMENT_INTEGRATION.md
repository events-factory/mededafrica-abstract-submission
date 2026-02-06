# Mastercard Payment Gateway Integration - Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Implementation Details](#implementation-details)
5. [Security](#security)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This is a **secure, production-ready** Mastercard payment gateway integration that uses a backend API to handle all sensitive payment operations. The frontend never directly communicates with the Mastercard gateway, ensuring PCI DSS compliance.

### Key Features
- ✅ **Backend-handled payment sessions** - All gateway credentials stay on the server
- ✅ **Embedded payment form** - Mastercard-hosted secure payment UI
- ✅ **Real-time callbacks** - Success, error, and cancel handling
- ✅ **Multi-booth support** - Handle multiple items in a single payment
- ✅ **Order ID tracking** - Backend-generated unique order identifiers

---

## Architecture

### System Flow

```
┌─────────────┐      ┌─────────────┐      ┌──────────────────┐
│   Frontend  │─────▶│   Backend   │─────▶│ Mastercard       │
│   (React)   │◀─────│   API       │◀─────│ Payment Gateway  │
└─────────────┘      └─────────────┘      └──────────────────┘
```

### Components

#### 1. Frontend Components

**PaymentModal.tsx**
- React modal component
- Loads Mastercard Checkout.js script
- Embeds payment form
- Handles callbacks (success/error/cancel)

**BookingModal.tsx**
- Main booking interface
- Payment method selection
- Triggers PaymentModal for online payments
- Submits final booking with payment details

#### 2. Backend API Endpoints

**POST /Api/Validate-Payment-Method**
- Validates booking data
- Checks if payment method requires direct payment
- Returns: `{ data: { result: 'true', direct_payment: 'true/false' } }`

**POST /Api/Initiate-Gateway-Session**
- **Backend creates payment session with Mastercard**
- **Backend generates unique order ID**
- Returns: `{ data: { result: 'SUCCESS', payment_session: 'SESSION_ID', token: 'TOKEN', orderId: 'ORDER_ID' } }`

**POST /Api/Book-Exibition-Packages**
- Final booking submission
- Includes payment tokens for verification
- Marks booth as booked

---

## Quick Start

### Prerequisites
- Node.js 14+ and npm/yarn
- Backend API with Mastercard gateway integration
- Mastercard test credentials (for development)

### Environment Setup

Create a `.env` file in your project root:

```env
# Backend API Configuration
REACT_APP_API_BASE_URL=https://your-backend-api.com/Api

# Mastercard Checkout Script (Frontend only needs this)
REACT_APP_GATEWAY_URL_JS=https://test-gateway.mastercard.com/static/checkout/checkout.min.js

# For production:
# REACT_APP_GATEWAY_URL_JS=https://ap-gateway.mastercard.com/static/checkout/checkout.min.js
```

**Note:** Gateway credentials (username/password) are **NOT** in the frontend. They're stored securely on your backend.

### Install Dependencies

```bash
npm install
# or
yarn install
```

### Run Development Server

```bash
npm start
# or
yarn start
```

---

## Implementation Details

### Step-by-Step Payment Flow

#### 1. User Initiates Payment

```typescript
// User fills booking form and selects payment method
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validate payment method
  const validation = await validatePaymentMethod(bookingData);

  if (validation.data.direct_payment === 'true') {
    // Open payment modal for online payment
    setShowPaymentModal(true);
  } else {
    // Submit directly for bank transfer
    await submitBooking(bookingData);
  }
};
```

#### 2. Initialize Payment Session (Backend)

```typescript
// Frontend calls backend to create payment session
const session = await initializePaymentSession({
  amount: 15000,
  currency: 'USD',
  product_key: 'BOOTH_001',
  quantity: '1',
  customer_email: 'john@example.com',
  customer_name: 'John Doe'
});

// Backend returns:
// {
//   session_id: 'SESSION_abc123...',
//   result_indicator: 'TOKEN_xyz789...',
//   order_id: 'ORD_1234567890'
// }
```

**Backend Implementation (Node.js/Express example):**

```javascript
app.post('/api/initiate-gateway-session', async (req, res) => {
  const { product_id, quantity } = req.body;

  try {
    // Generate unique order ID
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Call Mastercard gateway with backend credentials
    const gatewayResponse = await axios.post(
      process.env.GATEWAY_URL,
      {
        apiOperation: 'CREATE_CHECKOUT_SESSION',
        order: {
          id: orderId,
          amount: calculateAmount(product_id),
          currency: 'USD'
        },
        interaction: {
          operation: 'PURCHASE'
        }
      },
      {
        auth: {
          username: process.env.GATEWAY_USERNAME,
          password: process.env.GATEWAY_PASSWORD
        }
      }
    );

    res.json({
      data: {
        result: 'SUCCESS',
        payment_session: gatewayResponse.data.session.id,
        token: gatewayResponse.data.session.resultIndicator,
        orderId: orderId
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Session creation failed' });
  }
});
```

#### 3. Load Checkout Script

```typescript
// Dynamically load Mastercard Checkout.js
await loadCheckoutScript();

// This loads:
// <script src="https://test-gateway.mastercard.com/static/checkout/checkout.min.js"
//         data-error="errorCallback"
//         data-cancel="cancelCallback"
//         data-complete="completeCallback">
// </script>
```

#### 4. Display Embedded Payment Form

```typescript
// Configure Checkout with session ID
window.Checkout.configure({
  session: {
    id: session.session_id
  }
});

// Render payment form in specified div
window.Checkout.showEmbeddedPage('#payment-target');
```

#### 5. Handle Payment Callbacks

```typescript
// Success callback
window.completeCallback = (result: any) => {
  if (result.resultIndicator === expectedToken) {
    // Payment verified - submit booking
    await submitBooking({
      ...bookingData,
      payment_token: result.resultIndicator,
      payment_session: sessionId,
      order_id: orderId
    });
  }
};

// Error callback
window.errorCallback = (error: any) => {
  console.error('Payment failed:', error['error.explanation']);
  // Show error message to user
};

// Cancel callback
window.cancelCallback = () => {
  console.log('Payment cancelled by user');
  // Close modal, allow retry
};
```

#### 6. Submit Final Booking

```typescript
// Submit booking with payment details
const bookingData = new FormData();
bookingData.append('product_key', 'BOOTH_001');
bookingData.append('name', 'John Doe');
bookingData.append('email', 'john@example.com');
bookingData.append('payment_method', 'online_payment');
bookingData.append('payment_token', result.resultIndicator);
bookingData.append('payment_session', sessionId);
bookingData.append('order_id', orderId);

await fetch('/Api/Book-Exibition-Packages', {
  method: 'POST',
  body: bookingData
});
```

---

## Security

### ✅ Current Implementation Security

1. **Credentials Protection**
   - Gateway username/password stored only on backend
   - Never exposed in frontend code or network requests
   - Environment variables used on server

2. **Session-Based Flow**
   - Backend creates payment session
   - Frontend only receives session ID
   - Payment processing happens on Mastercard servers

3. **Token Verification**
   - Backend generates result indicator token
   - Frontend verifies token matches in callback
   - Prevents payment tampering

4. **Order ID Generation**
   - Backend generates unique order IDs
   - Prevents client-side manipulation
   - Ensures order tracking integrity

### 🔒 PCI DSS Compliance

- ✅ **No card data touches your servers** - Mastercard handles all card details
- ✅ **Secure communication** - HTTPS for all requests
- ✅ **Tokenization** - Only payment tokens stored, never card numbers
- ✅ **Session isolation** - Each payment gets unique session

---

## Testing

### Test Environment Setup

```env
REACT_APP_GATEWAY_URL_JS=https://test-gateway.mastercard.com/static/checkout/checkout.min.js
```

### Test Cards

| Card Number         | Expiry   | CVV | Expected Result |
|---------------------|----------|-----|-----------------|
| 5123 4500 0000 0008 | 05/39    | 100 | ✅ Success       |
| 5313 5810 0012 3430 | 05/39    | 100 | ✅ Success       |
| 2223 0000 4841 0010 | 05/39    | 100 | ❌ Declined      |
| 4508 7500 0000 0021 | 05/39    | 100 | ⏳ Timeout       |

### Test Scenarios

#### 1. Successful Payment Flow
```bash
1. Select booth(s)
2. Fill booking form
3. Select "Online Payment"
4. Click "Complete Booking"
5. Use test card: 5123450000000008
6. Complete payment
7. Verify booth marked as booked
```

#### 2. Payment Decline
```bash
1. Same as above
2. Use declined test card: 2223000048410010
3. Verify error message displayed
4. Verify "Try Again" button works
```

#### 3. Payment Cancellation
```bash
1. Open payment modal
2. Click "Cancel" in Mastercard form
3. Verify modal closes gracefully
4. Verify booth still available
```

#### 4. Multi-Booth Payment
```bash
1. Select multiple booths (2-3)
2. Proceed to booking
3. Select designs for each booth
4. Complete payment
5. Verify all booths marked as booked
```

### Debugging

Enable console logging:

```typescript
// In payment.ts and PaymentModal.tsx
console.log('Session initialized:', session);
console.log('Result indicator:', result.resultIndicator);
console.log('Order ID:', orderId);
```

Check Network tab in DevTools:
- `/Api/Initiate-Gateway-Session` - Should return 200 with session data
- `/Api/Book-Exibition-Packages` - Should return 200 on successful booking

---

## Production Deployment

### 1. Update Environment Variables

```env
# Production Mastercard Gateway
REACT_APP_GATEWAY_URL_JS=https://ap-gateway.mastercard.com/static/checkout/checkout.min.js

# Ensure backend uses production credentials
# GATEWAY_USERNAME=YOUR_PROD_USERNAME
# GATEWAY_PASSWORD=YOUR_PROD_PASSWORD
# GATEWAY_URL=https://ap-gateway.mastercard.com/api/nvp/version/70
```

### 2. Backend Configuration

Update your backend `.env`:

```env
GATEWAY_USERNAME=YOUR_PRODUCTION_USERNAME
GATEWAY_PASSWORD=YOUR_PRODUCTION_PASSWORD
GATEWAY_URL=https://ap-gateway.mastercard.com/api/nvp/version/70
GATEWAY_MERCHANT_ID=YOUR_MERCHANT_ID
```

### 3. Build Frontend

```bash
npm run build
# or
yarn build
```

### 4. Deploy

```bash
# Deploy to your hosting provider
# Example with Vercel:
vercel --prod

# Example with AWS S3:
aws s3 sync build/ s3://your-bucket-name
```

### 5. Production Checklist

- [ ] Test gateway credentials work
- [ ] Verify HTTPS is enabled
- [ ] Test with production test cards
- [ ] Set up payment monitoring/logging on backend
- [ ] Configure payment failure notifications
- [ ] Set up reconciliation process
- [ ] Test error scenarios in production
- [ ] Document payment process for support team

---

## Troubleshooting

### Issue: Payment Modal Doesn't Open

**Symptoms:** Click "Complete Booking" but nothing happens

**Solutions:**
1. Check browser console for errors
2. Verify `.env` file has `REACT_APP_GATEWAY_URL_JS`
3. Restart dev server after changing `.env`
4. Check payment method validation API response

```bash
# Check if validation returns direct_payment: 'true'
curl -X POST https://your-api.com/Api/Validate-Payment-Method \
  -F "payment_method=online_payment" \
  -F "..."
```

### Issue: Checkout Script Fails to Load

**Symptoms:** "Checkout script not loaded" error

**Solutions:**
1. Verify `REACT_APP_GATEWAY_URL_JS` URL is correct
2. Check network tab for failed script request
3. Verify gateway URL is accessible (not blocked by firewall)
4. Try accessing the script URL directly in browser

### Issue: Payment Session Initialization Fails

**Symptoms:** "Unable to initialize payment" error

**Solutions:**
1. Check backend logs for gateway API errors
2. Verify backend gateway credentials are correct
3. Check if test gateway is operational: https://test-gateway.mastercard.com
4. Verify request format matches gateway API docs

```javascript
// Backend - Check request format
console.log('Gateway request:', {
  orderId,
  amount,
  currency,
  operation: 'CREATE_CHECKOUT_SESSION'
});
```

### Issue: Payment Verification Fails

**Symptoms:** Payment completes but verification fails

**Solutions:**
1. Verify `resultIndicator` from callback matches expected token
2. Check console logs for token mismatch
3. Ensure order ID is passed correctly through flow

```typescript
// Add debug logging in completeCallback
window.completeCallback = (result) => {
  console.log('Expected token:', expectedToken);
  console.log('Received token:', result.resultIndicator);
  console.log('Match:', result.resultIndicator === expectedToken);
};
```

### Issue: Multiple Callbacks Firing

**Symptoms:** Payment success triggered multiple times

**Solutions:**
1. Check if payment modal is being mounted multiple times
2. Ensure callbacks are cleaned up on unmount
3. Add callback guard:

```typescript
let callbackFired = false;

window.completeCallback = (result) => {
  if (callbackFired) return;
  callbackFired = true;
  // ... handle payment
};
```

---

## API Reference

### Frontend Service Methods

#### `initializePaymentSession(data: PaymentInitData): Promise<PaymentSessionResponse>`

Initializes a payment session via backend API.

**Parameters:**
```typescript
{
  amount: number;
  currency: string;
  order_id: string;        // Not used - backend generates
  customer_email: string;
  customer_name: string;
  product_key: string;
  quantity: string;
}
```

**Returns:**
```typescript
{
  session_id: string;       // Use to configure Checkout
  result_indicator: string; // Use to verify payment
  order_id: string;         // Backend-generated order ID
}
```

#### `loadCheckoutScript(): Promise<void>`

Loads Mastercard Checkout.js script dynamically.

#### `showEmbeddedCheckout(sessionId: string, targetElement: string): void`

Displays the payment form in specified element.

**Parameters:**
- `sessionId`: Session ID from `initializePaymentSession`
- `targetElement`: CSS selector (e.g., '#payment-target')

---

## Support Resources

### Documentation
- [Mastercard Gateway API Docs](https://test-gateway.mastercard.com/api/documentation)
- [Checkout Integration Guide](https://test-gateway.mastercard.com/api/documentation/integrationGuidelines/hostedCheckout/integrationModelHostedCheckout.html)

### Common Links
- Test Gateway: https://test-gateway.mastercard.com
- Production Gateway: https://ap-gateway.mastercard.com
- Merchant Portal: https://secure.ap.tnspayments.com

### Getting Help
1. Check this documentation first
2. Review browser console logs
3. Check backend API logs
4. Review network requests in DevTools
5. Contact Mastercard gateway support with:
   - Merchant ID
   - Order ID
   - Error message
   - Timestamp of issue

---

## Example: Complete Integration

Here's a minimal working example showing how all pieces fit together:

```typescript
// 1. BookingModal.tsx - Main form
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validate payment method
  const validation = await validatePaymentMethod({
    product_key: booth.productCode,
    name: customerName,
    email: email,
    payment_method: paymentMethod,
    // ... other fields
  });

  if (validation.data.direct_payment === 'true') {
    setShowPaymentModal(true); // Open payment modal
  } else {
    await submitBookingData(); // Bank transfer - submit directly
  }
};

// 2. PaymentModal.tsx - Payment handling
const initializePayment = async () => {
  // Load script
  await loadCheckoutScript();

  // Get session from backend
  const session = await initializePaymentSession({
    amount: totalAmount,
    currency: 'USD',
    product_key: booth.productCode,
    quantity: '1',
    customer_email: email,
    customer_name: customerName,
  });

  // Setup callbacks
  window.completeCallback = (result) => {
    if (result.resultIndicator === session.result_indicator) {
      onSuccess(session.order_id, result.resultIndicator, session.session_id);
    }
  };

  // Show payment form
  showEmbeddedCheckout(session.session_id, '#payment-target');
};

// 3. Handle success
const handlePaymentSuccess = (orderId, token, sessionId) => {
  // Submit booking with payment details
  await submitBooking({
    ...bookingData,
    payment_token: token,
    payment_session: sessionId,
    order_id: orderId,
  });

  // Close modal, mark booth as booked
  onClose();
};
```

---

## License & Credits

This integration guide is provided as-is for implementing Mastercard payment gateway in React applications.

**Technologies Used:**
- React 18+
- TypeScript
- Mastercard Gateway API v70
- Mastercard Checkout.js

**Author:** Exhibition Management System Team
**Last Updated:** 2026-02-06
**Version:** 2.0 (Backend-based secure implementation)
