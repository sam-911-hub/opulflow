import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAdminAuth } from '@/lib/firebaseAdmin'
import { getFirebaseAdminDb } from '@/lib/firebaseAdmin'

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')
    
    if (!session?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(session.value)
    const userId = decodedToken.uid

    const db = getFirebaseAdminDb()
    const userDoc = await db.collection('users').doc(userId).get()

    if (!userDoc.exists) {
      return NextResponse.json({ user: { uid: userId, email: decodedToken.email, credits: 10, accountType: 'free' } })
    }

    const userData = userDoc.data()
    
    return NextResponse.json({
      user: {
        uid: userId,
        email: decodedToken.email,
        credits: userData?.credits || 0,
        accountType: userData?.accountType || 'free'
      }
    })
  } catch (error) {
    console.error('User fetch error', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}