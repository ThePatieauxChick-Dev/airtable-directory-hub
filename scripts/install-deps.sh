#!/usr/bin/env bash
set -euo pipefail

# Some sandbox/proxy environments inject proxy vars that cause npm registry 403s.
# This script performs a clean install with those vars unset.
env \
  -u HTTP_PROXY \
  -u HTTPS_PROXY \
  -u http_proxy \
  -u https_proxy \
  -u npm_config_http_proxy \
  -u npm_config_https_proxy \
  npm install --no-audit --no-fund
