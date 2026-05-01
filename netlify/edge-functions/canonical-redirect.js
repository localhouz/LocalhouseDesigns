export default async (request) => {
  const url = new URL(request.url);
  if (url.hostname === 'localhousedesigns.netlify.app') {
    url.hostname = 'localhousedesigns.com';
    return Response.redirect(url.toString(), 301);
  }
};

export const config = { path: '/*' };
