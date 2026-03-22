import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'carlophillips';

let client = null;
let db = null;

async function connectToDatabase() {
  if (db) return db;
  
  try {
    client = new MongoClient(MONGO_URL);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

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
    // Health check
    if (pathString === '' || pathString === 'health') {
      return NextResponse.json(
        { 
          status: 'ok', 
          message: 'Carlophillips API is running',
          timestamp: new Date().toISOString()
        },
        { headers: corsHeaders() }
      );
    }

    // Get all products
    if (pathString === 'products') {
      const db = await connectToDatabase();
      const products = await db.collection('products').find({}).toArray();
      return NextResponse.json({ products }, { headers: corsHeaders() });
    }

    // Get single product
    if (pathString.startsWith('products/')) {
      const productId = path[1];
      const db = await connectToDatabase();
      const product = await db.collection('products').findOne({ id: productId });
      
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404, headers: corsHeaders() }
        );
      }
      
      return NextResponse.json({ product }, { headers: corsHeaders() });
    }

    // Get all collections
    if (pathString === 'collections') {
      const db = await connectToDatabase();
      const collections = await db.collection('collections').find({}).toArray();
      return NextResponse.json({ collections }, { headers: corsHeaders() });
    }

    // Get single collection with products
    if (pathString.startsWith('collections/')) {
      const collectionId = path[1];
      const db = await connectToDatabase();
      const collection = await db.collection('collections').findOne({ id: collectionId });
      
      if (!collection) {
        return NextResponse.json(
          { error: 'Collection not found' },
          { status: 404, headers: corsHeaders() }
        );
      }
      
      const products = await db.collection('products').find({ collection: collectionId }).toArray();
      
      return NextResponse.json({ collection, products }, { headers: corsHeaders() });
    }

    // Get cart by session ID
    if (pathString.startsWith('cart/')) {
      const sessionId = path[1];
      const db = await connectToDatabase();
      const cart = await db.collection('carts').findOne({ sessionId });
      
      return NextResponse.json(
        { cart: cart || { sessionId, items: [], total: 0 } },
        { headers: corsHeaders() }
      );
    }

    // 404 for unknown routes
    return NextResponse.json(
      { error: 'Not found' },
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
    const body = await request.json();

    // Add item to cart
    if (pathString === 'cart/add') {
      const { sessionId, item } = body;
      
      if (!sessionId || !item) {
        return NextResponse.json(
          { error: 'Missing sessionId or item' },
          { status: 400, headers: corsHeaders() }
        );
      }
      
      const db = await connectToDatabase();
      const itemKey = `${item.productId}-${item.color}-${item.size}`;
      
      let cart = await db.collection('carts').findOne({ sessionId });
      
      if (!cart) {
        cart = { sessionId, items: [], total: 0 };
      }
      
      const existingIndex = cart.items.findIndex(i => i.key === itemKey);
      
      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += item.quantity || 1;
      } else {
        cart.items.push({
          key: itemKey,
          ...item,
          quantity: item.quantity || 1,
        });
      }
      
      cart.total = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      cart.updatedAt = new Date().toISOString();
      
      await db.collection('carts').updateOne(
        { sessionId },
        { $set: cart },
        { upsert: true }
      );
      
      return NextResponse.json({ cart }, { headers: corsHeaders() });
    }

    // Update cart item quantity
    if (pathString === 'cart/update') {
      const { sessionId, itemKey, quantity } = body;
      
      if (!sessionId || !itemKey) {
        return NextResponse.json(
          { error: 'Missing sessionId or itemKey' },
          { status: 400, headers: corsHeaders() }
        );
      }
      
      const db = await connectToDatabase();
      let cart = await db.collection('carts').findOne({ sessionId });
      
      if (!cart) {
        return NextResponse.json(
          { error: 'Cart not found' },
          { status: 404, headers: corsHeaders() }
        );
      }
      
      if (quantity <= 0) {
        cart.items = cart.items.filter(i => i.key !== itemKey);
      } else {
        const item = cart.items.find(i => i.key === itemKey);
        if (item) {
          item.quantity = quantity;
        }
      }
      
      cart.total = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      cart.updatedAt = new Date().toISOString();
      
      await db.collection('carts').updateOne(
        { sessionId },
        { $set: cart }
      );
      
      return NextResponse.json({ cart }, { headers: corsHeaders() });
    }

    // Remove item from cart
    if (pathString === 'cart/remove') {
      const { sessionId, itemKey } = body;
      
      if (!sessionId || !itemKey) {
        return NextResponse.json(
          { error: 'Missing sessionId or itemKey' },
          { status: 400, headers: corsHeaders() }
        );
      }
      
      const db = await connectToDatabase();
      let cart = await db.collection('carts').findOne({ sessionId });
      
      if (!cart) {
        return NextResponse.json(
          { error: 'Cart not found' },
          { status: 404, headers: corsHeaders() }
        );
      }
      
      cart.items = cart.items.filter(i => i.key !== itemKey);
      cart.total = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      cart.updatedAt = new Date().toISOString();
      
      await db.collection('carts').updateOne(
        { sessionId },
        { $set: cart }
      );
      
      return NextResponse.json({ cart }, { headers: corsHeaders() });
    }

    // Subscribe to newsletter
    if (pathString === 'newsletter') {
      const { email } = body;
      
      if (!email) {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400, headers: corsHeaders() }
        );
      }
      
      const db = await connectToDatabase();
      
      await db.collection('newsletter').updateOne(
        { email },
        { 
          $set: { 
            email, 
            subscribedAt: new Date().toISOString() 
          } 
        },
        { upsert: true }
      );
      
      return NextResponse.json(
        { success: true, message: 'Successfully subscribed' },
        { headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { error: 'Not found' },
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
    // Clear cart
    if (pathString.startsWith('cart/')) {
      const sessionId = path[1];
      const db = await connectToDatabase();
      
      await db.collection('carts').deleteOne({ sessionId });
      
      return NextResponse.json(
        { success: true, message: 'Cart cleared' },
        { headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { error: 'Not found' },
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
