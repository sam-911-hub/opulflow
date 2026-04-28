import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAdminDb, getFirebaseAdminAuth } from '@/lib/firebaseAdmin'

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')

    if (!session?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    try {
      // Verify admin user
      const decodedToken = await getFirebaseAdminAuth().verifyIdToken(session.value)

      // Check if user is admin (opulflow.inc@gmail.com)
      if (decodedToken.email !== 'opulflow.inc@gmail.com') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    } catch (authError) {
      console.error('Auth verification failed:', authError)
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Fetch pending verification orders
    try {
      const db = getFirebaseAdminDb()
      // Query without orderBy first to avoid index requirement
      const ordersSnapshot = await db.collection('orders')
        .where('status', '==', 'pending_verification')
        .get()

      const orders = ordersSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        // Sort in memory
        .sort((a: any, b: any) => {
          const aDate = a.createdAt?.toDate?.() || new Date(0)
          const bDate = b.createdAt?.toDate?.() || new Date(0)
          return bDate.getTime() - aDate.getTime()
        })

      return NextResponse.json({ orders })
    } catch (dbError) {
      console.error('Database query failed:', dbError)
      // Fallback: return empty array if query fails
      return NextResponse.json({ orders: [] })
    }

  } catch (error) {
    console.error('Admin pending orders error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}