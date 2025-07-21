// This file is used for Edge runtime (middleware)
// Edge runtime doesn't support firebase-admin directly, so we use a REST API approach

type DecodedToken = {
  uid: string;
  email?: string;
  token?: {
    admin?: boolean;
  };
};

// Function to verify a session cookie via our API endpoint
export async function verifySessionCookieEdge(sessionCookie: string): Promise<DecodedToken | null> {
  if (!sessionCookie) return null;
  
  try {
    // Use our own API endpoint that runs in Node.js environment
    const response = await fetch(
      `/api/verify-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionCookie })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to verify session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying session in Edge runtime:', error);
    return null;
  }
}

// Placeholder for getAdminAuth to maintain API compatibility
export function getAdminAuth() {
  throw new Error('getAdminAuth is not supported in Edge runtime. Use verifySessionCookieEdge instead.');
}