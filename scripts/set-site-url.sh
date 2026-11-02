#!/bin/sh
# Usage: sh scripts/set-site-url.sh https://your-domain.com
# Sets the public address used by the canonical link, Open Graph tags, JSON-LD,
# sitemap.xml and robots.txt. Safe to run again: it replaces the previous address.
set -e
[ -n "$1" ] || { echo "Usage: sh scripts/set-site-url.sh https://your-domain.com" >&2; exit 1; }
NEW="${1%/}"
case "$NEW" in https://*) ;; *) echo "URL must start with https://" >&2; exit 1;; esac
cd "$(dirname "$0")/.."
OLD="__SITE_URL__"
[ -f .site-url ] && OLD="$(cat .site-url)"
for f in index.html robots.txt sitemap.xml; do
  sed "s#$OLD#$NEW#g" "$f" > "$f.tmp" && mv "$f.tmp" "$f"
done
printf '%s' "$NEW" > .site-url
echo "Site address is now $NEW"
