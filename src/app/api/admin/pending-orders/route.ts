import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAdminDb } from '@/lib/firebaseAdmin'

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')

    if (!session?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify admin user
    const adminAuth = await import('@/lib/firebaseAdmin')
    const decodedToken = await adminAuth.getFirebaseAdminAuth().verifyIdToken(session.value)

    // Check if user is admin (samuelomondi288@gmail.com)
    if (decodedToken.email !== 'samuelomondi288@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Fetch pending verification orders
    const db = getFirebaseAdminDb()
    const ordersSnapshot = await db.collection('orders')
      .where('status', '==', 'pending_verification')
      .orderBy('createdAt', 'desc')
      .get()

    const orders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({ orders })

  } catch (error) {
    console.error('Admin pending orders error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}