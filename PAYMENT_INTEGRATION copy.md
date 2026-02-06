# Payment Gateway Integration Guide

## Overview

The exhibition booking system now includes integrated Mastercard payment gateway support for online payments. Users can choose between two payment methods:

1. **Bank Transfer** - Traditional payment method
2. **Online Payment** - Instant payment via Mastercard gateway

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```env
# Payment Gateway Configuration
REACT_APP_GATEWAY_USERNAME=TESTBOK000012
REACT_APP_GATEWAY_PASSWORD=a1f97670c3eb016a11c39de541f8065e
REACT_APP_GATEWAY_URL=https://test-gateway.mastercard.com/api/nvp/version/70
REACT_APP_GATEWAY_URL_JS=https://test-gateway.mastercard.com/static/checkout/checkout.min.js
```

**Important:** These are test credentials. Replace with production credentials before going live.

## Architecture

### Components

#### 1. **PaymentModal** (`src/components/PaymentModal.tsx`)

- Handles the payment UI and flow
- Loads Mastercard Checkout script dynamically
- Manages payment session initialization
- Handles payment callbacks (success, error, cancel)

#### 2. **BookingModal** (`src/components/BookingModal.tsx`)

- Updated to integrate PaymentModal
- Handles payment method selection
- Triggers PaymentModal for online payments
- Submits booking with payment details

### Services

#### 1. **Payment Service** (`src/services/payment.ts`)

- `initializePaymentSession()` - Creates payment session with gateway
- `loadCheckoutScript()` - Dynamically loads Mastercard Checkout
- `showEmbeddedCheckout()` - Displays embedded payment form
- `generateOrderId()` - Generates unique order IDs

#### 2. **API Service** (`src/services/api.ts`)

- `submitBooking()` - Submits booking with payment details
- Includes payment_token, payment_session, and order_id fields

## Payment Flow

### 1. User Selects Online Payment

```
User fills form → Selects "Online Payment" → Clicks "Complete Booking"
```

### 2. Payment Modal Opens

```
PaymentModal opens → Initializes payment session → Loads Mastercard Checkout
```

### 3. User Completes Payment

```
User enters card details → Submits payment → Gateway processes
```

### 4. Payment Callbacks

**Success:**

```
completeCallback → Verify resultIndicator → Update payment fields → Submit booking
```

**Error:**

```
errorCallback → Display error message → Allow retry
```

**Cancel:**

```
cancelCallback → Display cancellation message → Close modal
```

### 5. Booking Submission

```
Payment details saved → API submission → Booth marked as booked
```

## Form Fields

### Payment-Related Fields

| Field             | Type   | Description                         |
| ----------------- | ------ | ----------------------------------- |
| `payment_method`  | select | "bank_transfer" or "online_payment" |
| `payment_token`   | hidden | Result indicator from gateway       |
| `payment_session` | hidden | Session ID from gateway             |
| `order_id`        | hidden | Unique order identifier             |
| `acknowledgment`  | hidden | Payment acknowledgment token        |

### Customer Fields

| Field      | Type     | Required | Description            |
| ---------- | -------- | -------- | ---------------------- |
| `name`     | text     | Yes      | Customer full name     |
| `email`    | email    | Yes      | Customer email         |
| `phone`    | tel      | Yes      | Phone number           |
| `company`  | text     | No       | Company name           |
| `country`  | text     | No       | Country                |
| `quantity` | number   | Yes      | Number of booths       |
| `message`  | textarea | No       | Additional information |

## Security Considerations

### Current Implementation (Test Mode)

⚠️ **WARNING:** The current implementation communicates directly with the payment gateway from the frontend. This is acceptable for testing but **NOT recommended for production**.

### Recommended Production Setup

1. **Backend Payment API**

   ```
   Frontend → Backend API → Payment Gateway
   ```

2. **Secure Credential Storage**

   - Store gateway credentials on backend only
   - Never expose credentials in frontend code
   - Use environment variables on server

3. **Payment Flow**
   ```
   1. Frontend requests payment session from backend
   2. Backend creates session with gateway
   3. Backend returns session ID to frontend
   4. Frontend displays payment form
   5. User completes payment
   6. Frontend sends result to backend
   7. Backend verifies payment with gateway
   8. Backend confirms booking
   ```

### Implementation Example

**Backend Endpoint (Node.js/Express):**

```javascript
app.post('/api/payment/initialize', async (req, res) => {
  try {
    const { amount, currency, order_id, customer } = req.body;

    // Call Mastercard gateway securely
    const session = await createPaymentSession({
      amount,
      currency,
      order_id,
      customer,
      username: process.env.GATEWAY_USERNAME,
      password: process.env.GATEWAY_PASSWORD,
    });

    // Return only session ID to frontend
    res.json({
      session_id: session.id,
      result_indicator: session.resultIndicator,
    });
  } catch (error) {
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});
```

## Testing

### Test Cards (Mastercard Gateway)

| Card Number      | Expiry | CVV | Expected Result |
| ---------------- | ------ | --- | --------------- |
| 5123450000000008 | 12/25  | 100 | Success         |
| 5313581000123430 | 12/25  | 100 | Success         |
| 2223000048410010 | 12/25  | 100 | Declined        |

### Test Scenarios

1. **Successful Payment**

   - Select online payment
   - Use test card 5123450000000008
   - Complete payment
   - Verify booking submission

2. **Declined Payment**

   - Select online payment
   - Use declined test card
   - Verify error handling
   - Verify retry functionality

3. **Cancelled Payment**

   - Select online payment
   - Click cancel in payment form
   - Verify cancellation handling

4. **Network Error**
   - Disable network after opening payment modal
   - Verify error message display
   - Verify retry functionality

## API Integration

The system uses the SmartEvent API backend for all booking and payment operations.

### Key Endpoints

1. **Validate Payment Method:** `POST /Api/Validate-Payment-Method`

   - Validates form data and checks payment method availability
   - Returns whether direct payment (online) is required

2. **Initialize Gateway Session:** `POST /Api/Initiate-Gateway-Session`

   - Creates a payment session with Mastercard gateway
   - Returns session ID, token, and order ID

3. **Submit Booking:** `POST /Api/Get-Exibition-Packages-Full/Details/`
   - Final booking submission with all details
   - Includes payment information for online payments

### Request Format (Submit Booking)

```javascript
POST /Api/Get-Exibition-Packages-Full/Details/

Headers:
- Authorization: EVENT_CODE

FormData:
- product_key: "BOOTH_001"
- name: "John Doe"
- email: "john@example.com"
- phone: "+1234567890"
- company: "Acme Corp"
- country: "USA"
- message: "Special requirements"
- quantity: "1"
- payment_method: "online_payment"
- payment_token: "abc123..." (for online payment)
- payment_session: "SESSION_123" (for online payment)
- order_id: "BOOTH-1234567890-5678" (for online payment)
- event_code: "EVENT_CODE_HERE"
- field_name: "exhibition_email_english"
- application: "exhibition"
```

### Response Format

```json
{
  "success": true,
  "message": "Booking confirmed",
  "booking_id": "BOOK_12345"
}
```

For complete API documentation, see [API_ENDPOINTS.md](./API_ENDPOINTS.md).

## Troubleshooting

### Payment Modal Doesn't Open

- Check browser console for errors
- Verify `.env` variables are set
- Ensure `REACT_APP_` prefix is used
- Restart development server after changing `.env`

### Checkout Script Fails to Load

- Check `REACT_APP_GATEWAY_URL_JS` is correct
- Verify network connectivity
- Check browser console for CORS errors
- Ensure test gateway is accessible

### Payment Session Initialization Fails

- Verify gateway credentials
- Check network requests in browser DevTools
- Review gateway API documentation
- Check if test gateway is operational

### Payment Verification Fails

- Ensure `resultIndicator` matches
- Check callback implementation
- Verify payment token is passed correctly
- Review gateway response in console

## Migration to Production

### Checklist

- [ ] Implement backend payment API
- [ ] Move gateway credentials to backend
- [ ] Update frontend to use backend API
- [ ] Replace test credentials with production credentials
- [ ] Update gateway URLs to production endpoints
- [ ] Implement payment verification on backend
- [ ] Add payment logging and monitoring
- [ ] Test with production test cards
- [ ] Implement PCI DSS compliance measures
- [ ] Add payment reconciliation process
- [ ] Set up payment failure notifications
- [ ] Configure webhook endpoints for gateway callbacks

## Support

For gateway-specific issues, consult:

- [Mastercard Gateway Documentation](https://test-gateway.mastercard.com/api/documentation)
- Gateway support portal
- Technical account manager

For implementation questions:

- Review code comments in `payment.ts`
- Check browser console for debug logs
- Review network requests in DevTools
