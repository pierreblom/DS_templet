#!/usr/bin/env python3
import http.server
import socketserver
import json
import time
import os
import re
from urllib.parse import urlparse, parse_qs

# Store debug logs
debug_logs = []

class DebugHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/debug':
            # Return debug logs as JSON
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(debug_logs[-50:]).encode())  # Last 50 logs
            return
        elif self.path.startswith('/log?'):
            # Log debug message
            parsed = urlparse(self.path)
            params = parse_qs(parsed.query)
            message = params.get('msg', [''])[0]
            timestamp = time.strftime('%H:%M:%S')
            log_entry = f"[{timestamp}] {message}"
            debug_logs.append(log_entry)
            print(log_entry)  # Print to terminal
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            return
        else:
            # Check if it's an HTML file and process includes
            if self.path.endswith('.html') or self.path == '/' or self.path.startswith('/home_page'):
                self.serve_html_with_includes()
            else:
                super().do_GET()
    
    def serve_html_with_includes(self):
        """Serve HTML files with support for <!--#include file="..." --> directives"""
        try:
            # Determine the actual file path
            if self.path == '/':
                file_path = 'home_page/front_page.html'
            elif self.path.startswith('/'):
                file_path = self.path[1:]
            else:
                file_path = self.path
            
            # Read the HTML file
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Process includes: <!--#include file="filename.html" -->
            def replace_include(match):
                include_file = match.group(1)
                include_path = os.path.join(os.path.dirname(file_path), include_file)
                try:
                    with open(include_path, 'r', encoding='utf-8') as inc_f:
                        return inc_f.read()
                except FileNotFoundError:
                    return f"<!-- Error: Could not find {include_file} -->"
            
            content = re.sub(r'<!--#include file="([^"]+)" -->', replace_include, content)
            
            # Send the processed content
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.send_header('Content-length', len(content.encode('utf-8')))
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))
            
        except FileNotFoundError:
            self.send_error(404, "File not found")
        except Exception as e:
            self.send_error(500, f"Server error: {str(e)}")

if __name__ == "__main__":
    PORT = 5500
    with socketserver.TCPServer(("", PORT), DebugHandler) as httpd:
        print(f"Debug server running at http://localhost:{PORT}")
        print("Debug logs will appear below:")
        print("-" * 50)
        httpd.serve_forever()