import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAdminAuth } from '@/lib/firebaseAdmin'
import { getFirebaseAdminDb } from '@/lib/firebaseAdmin'

export async function GET(request: NextRequest) {
  try {
    var session = request.cookies.get('session')
    
    if (!session?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    var decodedToken = await getFirebaseAdminAuth().verifyIdToken(session.value)
    var userId = decodedToken.uid

    var db = getFirebaseAdminDb()
    var userDoc = await db.collection('users').doc(userId).get()

    if (!userDoc.exists) {
      return NextResponse.json({ user: { uid: userId, email: decodedToken.email, credits: 10, accountType: 'free' } })
    }

    var userData = userDoc.data()
    
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