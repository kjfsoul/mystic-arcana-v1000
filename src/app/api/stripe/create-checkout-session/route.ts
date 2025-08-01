import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia', // Latest stable API version
});

export async function POST(request: NextRequest) {
  try {
    const { product_data, unit_amount, currency, quantity = 1 } = await request.json();

    // Validate required fields
    if (!product_data || !unit_amount || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields: product_data, unit_amount, currency' },
        { status: 400 }
      );
    }

    // Get the origin for success/cancel URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'FR', 'DE', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK', 'FI']
      },
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: product_data.name,
              description: product_data.description,
              images: product_data.images || [],
              metadata: product_data.metadata || {},
            },
            unit_amount: unit_amount,
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/marketplace/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/marketplace?canceled=true`,
      metadata: {
        ...product_data.metadata,
        order_type: 'mystic_marketplace'
      },
      // Add customer email collection
      customer_creation: 'always',
      // Add automatic tax calculation (optional)
      automatic_tax: {
        enabled: false, // Set to true if you have tax calculation enabled in Stripe
      },
      // Add shipping options for physical products
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 599, // $5.99 shipping
              currency: currency,
            },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 10,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1499, // $14.99 expedited shipping
              currency: currency,
            },
            display_name: 'Express Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 2,
              },
              maximum: {
                unit: 'business_day',
                value: 3,
              },
            },
          },
        },
      ],
    });

    return NextResponse.json({ sessionId: session.id });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stripe Checkout Session API',
    methods: ['POST'],
    required_fields: ['product_data', 'unit_amount', 'currency'],
    optional_fields: ['quantity']
  });
}