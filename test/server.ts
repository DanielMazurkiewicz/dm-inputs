console.log("Starting test server...");

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const filePath = url.pathname === '/' ? '/index.html' : url.pathname;
    
    // Try to serve from 'test' directory first
    const testFile = Bun.file(`test${filePath}`);
    if (await testFile.exists()) {
      return new Response(testFile);
    }

    // Allow serving from 'src' for module resolution in the browser during dev
    const srcFile = Bun.file(`src${filePath.replace('/@fs/src', '/src').replace('/src', '')}`);
    if (await srcFile.exists()) {
        return new Response(srcFile);
    }
    
    return new Response("Not Found", { status: 404 });
  },
  error() {
      return new Response("Not Found", { status: 404 });
  }
});

console.log(`Test server running at http://localhost:${server.port}`);