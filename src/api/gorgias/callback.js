// pages/api/gorgias/callback.js
// OAuth callback handler for Gorgias

export default async function handler(req, res) {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    // Exchange the authorization code for access token
    // This would be implemented when you have your Gorgias app credentials
    
    // For now, just redirect to success page
    res.redirect('/gorgias-sidebar?auth=success');
  } catch (error) {
    console.error('Gorgias OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}
