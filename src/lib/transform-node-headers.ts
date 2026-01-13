export function fromNodeHeaders(nodeHeaders: any): Headers {
  const headers = new Headers();

  if (!nodeHeaders) return headers;

  // Xử lý cho Express/Fastify headers
  if (typeof nodeHeaders === 'object') {
    Object.entries(nodeHeaders).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, String(v)));
      } else if (value !== undefined) {
        headers.set(key, String(value as string));
      }
    });
  }

  return headers;
}
