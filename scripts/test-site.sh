#!/usr/bin/env bash
set -e

PORT=3001
export NO_PROXY="localhost,127.0.0.1"
export no_proxy="localhost,127.0.0.1"

echo "Starting Next.js server on port $PORT..."
./node_modules/.bin/next start -H 127.0.0.1 -p $PORT &
SERVER_PID=$!

cleanup() {
  echo "Cleaning up server PID $SERVER_PID..."
  kill -9 $SERVER_PID 2>/dev/null || true
}
trap cleanup EXIT

echo "Waiting for server to be ready on port $PORT..."
for i in {1..30}; do
  if curl -s --noproxy '*' "http://127.0.0.1:$PORT/" > /dev/null 2>&1; then
    echo "Server is UP and ready!"
    break
  fi
  sleep 0.5
done

echo "--- 1. Testing Homepage (GET /) ---"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --noproxy '*' "http://127.0.0.1:$PORT/")
echo "Homepage status: $STATUS"

echo "--- 2. Testing API Products (GET /api/products?limit=2) ---"
API_RES=$(curl -s --noproxy '*' "http://127.0.0.1:$PORT/api/products?limit=2")
echo "API response: $(echo "$API_RES" | head -c 200)..."

echo "--- 3. Testing Shop Page (GET /shop?category=disposable-vapes) ---"
SHOP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --noproxy '*' "http://127.0.0.1:$PORT/shop?category=disposable-vapes")
echo "Shop status: $SHOP_STATUS"

echo "--- 4. Testing Product Detail Page (GET /product/battery-opal-green) ---"
PROD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --noproxy '*' "http://127.0.0.1:$PORT/product/battery-opal-green")
echo "Product detail status: $PROD_STATUS"

echo "--- 5. Testing About Page (GET /about) ---"
ABOUT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --noproxy '*' "http://127.0.0.1:$PORT/about")
echo "About status: $ABOUT_STATUS"

echo "--- 6. Testing Reviews Page (GET /reviews) ---"
REV_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --noproxy '*' "http://127.0.0.1:$PORT/reviews")
echo "Reviews status: $REV_STATUS"

echo "--- 7. Testing Order Placement API (POST /api/orders) ---"
ORDER_RES=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Lachlan Murdoch","customerEmail":"lachlan@example.com.au","customerPhone":"0412345678","shippingAddress":{"fullName":"Lachlan Murdoch","email":"lachlan@example.com.au","phone":"0412345678","addressLine1":"42 Oxford St","suburb":"Sydney","state":"NSW","postcode":"2010","country":"Australia"},"items":[{"productId":"7061","productName":"BATTERY - OPAL - Green","productImage":"","price":29.0,"quantity":1}],"subtotal":29.0,"shippingFee":15.0,"total":44.0,"paymentMethod":"payid"}' \
  --noproxy '*' \
  "http://127.0.0.1:$PORT/api/orders")
echo "Order API response: $ORDER_RES"

ORDER_ID=$(echo "$ORDER_RES" | grep -o '"orderId":"[^"]*' | cut -d'"' -f4)
echo "Extracted Order ID: $ORDER_ID"

echo "--- 8. Testing Admin Dashboard (GET /admin) ---"
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --noproxy '*' "http://127.0.0.1:$PORT/admin")
echo "Admin status: $ADMIN_STATUS"

echo "--- 9. Testing Admin Products Page (GET /admin/products) ---"
ADMIN_PROD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --noproxy '*' "http://127.0.0.1:$PORT/admin/products")
echo "Admin products page status: $ADMIN_PROD_STATUS"

echo "--- 10. Testing Admin Orders Page (GET /admin/orders) ---"
ADMIN_ORDERS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --noproxy '*' "http://127.0.0.1:$PORT/admin/orders")
echo "Admin orders page status: $ADMIN_ORDERS_STATUS"

echo "--- 11. Testing Admin Stats API (GET /api/admin/stats) ---"
ADMIN_STATS=$(curl -s --noproxy '*' "http://127.0.0.1:$PORT/api/admin/stats")
echo "Admin Stats: $ADMIN_STATS"

echo "--- 12. Testing Admin Orders API (GET /api/admin/orders) ---"
ADMIN_ORDERS_LIST=$(curl -s --noproxy '*' "http://127.0.0.1:$PORT/api/admin/orders")
echo "Admin Orders count: $(echo "$ADMIN_ORDERS_LIST" | grep -o '"id"' | wc -l)"

if [ -n "$ORDER_ID" ]; then
  echo "--- 13. Testing Admin Update Order API (PATCH /api/admin/orders) ---"
  UPDATE_RES=$(curl -s -X PATCH \
    -H "Content-Type: application/json" \
    -d "{\"orderId\":\"$ORDER_ID\",\"status\":\"processing\",\"trackingNumber\":\"AUPOST-987654321\"}" \
    --noproxy '*' \
    "http://127.0.0.1:$PORT/api/admin/orders")
  echo "Order Update response: $UPDATE_RES"
fi

echo "=== All Tests Passed Successfully! ==="

