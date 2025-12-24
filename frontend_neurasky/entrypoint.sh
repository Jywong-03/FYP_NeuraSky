#!/bin/sh
set -e

echo "Starting Next.js entrypoint script..."

if [ -z "$NEXT_PUBLIC_API_URL" ]; then
  echo "Warning: NEXT_PUBLIC_API_URL is not set."
else
  echo "Replacing 'APP_NEXT_PUBLIC_API_URL' with '$NEXT_PUBLIC_API_URL' in .next directory..."
  # Use find and sed to replace the placeholder
  # We use | as delimiter for sed to avoid issues with slashes in URLs
  find .next -type f -name "*.js" -exec sed -i "s|APP_NEXT_PUBLIC_API_URL|$NEXT_PUBLIC_API_URL|g" {} +
fi

echo "Starting application..."
exec "$@"
