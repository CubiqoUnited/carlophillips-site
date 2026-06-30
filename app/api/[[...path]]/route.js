import { NextResponse } from 'next/server';

/**
 * CARLOPHILLIPS API Routes
 * 
 * This is a minimal API layer for the headless storefront.
 * All commerce data (products, cart, checkout) is handled by Shopify.
 * 
 * Future: Add Supabase for custom features (wishlists, reviews, etc.)
 */

// Helper for CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

// Main request handler
export async function GET(request, { params }) {
  const path = params?.path || [];
  const pathString = path.join('/');
  
  try {
    // Health check endpoint
    if (pathString === '' || pathString === 'health') {
      const hasShopifyDomain = Boolean(process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN);
      const hasShopifyToken = Boolean(process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN);
      const shopifyConnected = hasShopifyDomain && hasShopifyToken;

      return NextResponse.json(
        { 
          status: shopifyConnected ? 'ok' : 'degraded',
          service: 'CARLOPHILLIPS Headless API',
          message: shopifyConnected ? 'All systems operational' : 'Shopify Storefront API environment is incomplete',
          shopify: shopifyConnected ? 'Connected' : 'Not configured',
          shopifyEnvironment: {
            hasDomain: hasShopifyDomain,
            hasToken: hasShopifyToken,
          },
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        },
        { headers: corsHeaders() }
      );
    }

    // All product/cart data comes from Shopify
    // Future custom endpoints can be added here (e.g., wishlists, reviews)
    
    // 404 for unknown routes
    return NextResponse.json(
      { 
        error: 'Not found',
        message: 'All commerce data is managed by Shopify Storefront API'
      },
      { status: 404, headers: corsHeaders() }
    );

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(request, { params }) {
  const path = params?.path || [];
  const pathString = path.join('/');
  
  try {
    // All cart operations are handled by Shopify Storefront API
    // Future custom endpoints (wishlists, reviews, etc.) can be added here
    
    return NextResponse.json(
      { 
        error: 'Not found',
        message: 'Cart operations are handled by Shopify Storefront API'
      },
      { status: 404, headers: corsHeaders() }
    );

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function DELETE(request, { params }) {
  const path = params?.path || [];
  const pathString = path.join('/');
  
  try {
    // All cart operations are handled by Shopify Storefront API
    
    return NextResponse.json(
      { 
        error: 'Not found',
        message: 'Cart operations are handled by Shopify Storefront API'
      },
      { status: 404, headers: corsHeaders() }
    );

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
