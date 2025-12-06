# Stripe Checkout Integration for LearnLynk CRM

## Overview
This document outlines the implementation strategy for integrating Stripe Checkout to handle application fees in the LearnLynk admissions CRM.

## Architecture

### 1. Creating a Checkout Session
When a user initiates payment for an application fee:

```typescript
// Example: Edge Function for creating checkout session
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (applicationId, amount, userId) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Application Fee - LearnLynk University',
          description: 'Non-refundable application processing fee',
        },
        unit_amount: amount * 100, // Convert to cents
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/dashboard/applications/{CHECKOUT_SESSION_ID}/success`,
    cancel_url: `${process.env.FRONTEND_URL}/dashboard/applications/{CHECKOUT_SESSION_ID}/cancel`,
    client_reference_id: applicationId,
    customer_email: userEmail, // Optional: pre-fill email
    metadata: {
      application_id: applicationId,
      user_id: userId,
      tenant_id: tenantId,
    },
  });

  return session;
};