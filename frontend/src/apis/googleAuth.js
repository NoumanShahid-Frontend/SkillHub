export const loadGoogleAPI = () => {
  return new Promise((resolve) => {
    if (document.getElementById('google-api')) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.id = 'google-api';
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = resolve;
    document.head.appendChild(script);
  });
};

export const initGoogleAuth = (onSuccess, onError) => {
  return window.google.accounts.oauth2.initTokenClient({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    scope: 'email profile',
    redirect_uri: window.location.origin,
    callback: async (response) => {
      if (response.access_token) {
        onSuccess(response.access_token);
      } else if (response.error) {
        onError(response.error);
      }
    },
  });
};