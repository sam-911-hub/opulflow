import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAdminDb } from '@/lib/firebaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('session')

    if (!session?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify admin user
    const adminAuth = await import('@/lib/firebaseAdmin')
    const decodedToken = await adminAuth.getFirebaseAdminAuth().verifyIdToken(session.value)

    // Check if user is admin (opulflow.inc@gmail.com)
    if (decodedToken.email !== 'opulflow.inc@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    // Update order status to verified
    const db = getFirebaseAdminDb()
    const orderRef = db.collection('orders').doc(orderId)

    const orderDoc = await orderRef.get()
    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    await orderRef.update({
      status: 'verified',
      verifiedAt: new Date(),
      verifiedBy: decodedToken.email
    })

    // TODO: Send confirmation email to customer about verification
    // This could be added later if needed

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully'
    })

  } catch (error) {
    console.error('Admin verify payment error:', error)
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
  }
}