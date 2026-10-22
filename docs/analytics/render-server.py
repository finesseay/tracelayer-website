"""Local screenshot fixture: preserve the download landing page instead of navigating."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse
from pathlib import Path
import subprocess,re
class Handler(SimpleHTTPRequestHandler):
 def do_GET(self):
  path=urlparse(self.path).path
  if path.startswith('/__before/') or path.startswith('/__after/'):
   before=path.startswith('/__before/')
   file=path.split('/',2)[2]
   if file.endswith('.html'):
    text=subprocess.check_output(['git','show','454af6d95af141c7721bb6b943bcbc183a68ad04:'+file]).decode() if before else Path(file).read_text()
    if file=='download/android/index.html':
     text=re.sub(r'<meta http-equiv="refresh"[^>]+>','',text)
     text=re.sub(r'<script>location.replace\(.*?</script>','',text)
     text=re.sub(r' data-download-url="[^"]*"','',text)
    self.send_response(200);self.send_header('Content-Type','text/html');self.end_headers();self.wfile.write(text.encode());return
  super().do_GET()
ThreadingHTTPServer(('127.0.0.1',8001),Handler).serve_forever()
