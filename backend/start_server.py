#!/usr/bin/env python3

import subprocess
import sys

print("Starting VPG backend server...")
print("Note: The server will work without Gemini API key but with basic responses")
print("To enable Gemini-powered responses, set GEMINI_API_KEY environment variable.")

subprocess.run([sys.executable, "main.py"])