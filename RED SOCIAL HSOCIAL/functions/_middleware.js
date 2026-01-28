export async function onRequest(context) {
  const response = await context.next();
  
  // Fix MIME types for JS modules
  if (context.request.url.includes('.js')) {
    response.headers.set('Content-Type', 'application/javascript');
  }
  
  return response;
}
