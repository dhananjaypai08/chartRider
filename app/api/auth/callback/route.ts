    import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth error
  if (error) {
    return new NextResponse(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'oauth-error', 
              error: '${error}' 
            }, window.location.origin);
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Validate code exists
  if (!code || !state) {
    return new NextResponse(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'oauth-error', 
              error: 'Missing code or state' 
            }, window.location.origin);
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  try {
    // Exchange code for access token
    const clientId = process.env.NEXT_PUBLIC_X_CLIENT_ID;
    const clientSecret = process.env.X_CLIENT_SECRET;
    const redirectUri = `${request.nextUrl.origin}/api/auth/callback`;

    if (!clientId || !clientSecret) {
      throw new Error('Missing X API credentials');
    }

    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: 'challenge',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch user data
    const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await userResponse.json();
    const username = userData.data.username;
    const profilePicUrl = userData.data.profile_image_url?.replace('_normal', '_400x400') || 
                          `https://api.dicebear.com/7.x/personas/svg?seed=${username}`;

    // Send success message to parent window
    return new NextResponse(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'oauth-success', 
              username: '${username}',
              profilePicUrl: '${profilePicUrl}'
            }, window.location.origin);
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return new NextResponse(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'oauth-error', 
              error: 'Authentication failed' 
            }, window.location.origin);
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}