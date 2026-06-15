# Static site served by nginx — deterministic build for Coolify
FROM nginx:alpine

# Custom server config (gzip, caching, clean URLs)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Site files
COPY . /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
