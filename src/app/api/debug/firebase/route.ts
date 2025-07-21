import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

    if (!privateKey || !projectId || !clientEmail) {
      return NextResponse.json({
        error: 'Missing environment variables',
        missing: {
          privateKey: !privateKey,
          projectId: !projectId,
          clientEmail: !clientEmail
        }
      }, { status: 400 });
    }

    // Analyze the private key format
    const analysis = {
      originalLength: privateKey.length,
      hasBackslashN: privateKey.includes('\\n'),
      hasActualNewlines: privateKey.includes('\n'),
      startsWithBegin: privateKey.startsWith('-----BEGIN'),
      endsWithEnd: privateKey.endsWith('-----END PRIVATE KEY-----'),
      containsBeginHeader: privateKey.includes('-----BEGIN PRIVATE KEY-----'),
      containsEndFooter: privateKey.includes('-----END PRIVATE KEY-----'),
      firstLine: privateKey.split(/[\n\\n]/)[0],
      lineCount: privateKey.split('\n').length,
      lineCountBackslash: privateKey.split('\\n').length,
      first50Chars: privateKey.substring(0, 50),
      last50Chars: privateKey.substring(privateKey.length - 50)
    };

    // Test private key conversion
    let cleanPrivateKey = privateKey;
    if (privateKey.includes('\\n')) {
      cleanPrivateKey = privateKey.replace(/\\n/g, '\n');
    }

    const cleanedAnalysis = {
      cleanedLength: cleanPrivateKey.length,
      cleanedLineCount: cleanPrivateKey.split('\n').length,
      cleanedStartsCorrectly: cleanPrivateKey.trim().startsWith('-----BEGIN PRIVATE KEY-----'),
      cleanedEndsCorrectly: cleanPrivateKey.trim().endsWith('-----END PRIVATE KEY-----'),
      cleanedFirst50: cleanPrivateKey.substring(0, 50),
      cleanedLast50: cleanPrivateKey.substring(cleanPrivateKey.length - 50)
    };

    return NextResponse.json({
      status: 'debug',
      timestamp: new Date().toISOString(),
      environment: {
        projectId,
        clientEmail,
        hasPrivateKey: !!privateKey
      },
      privateKeyAnalysis: analysis,
      cleanedKeyAnalysis: cleanedAnalysis
    });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug failed',
      message: error.message,
      stack: error.stack?.substring(0, 500)
    }, { status: 500 });
  }
}