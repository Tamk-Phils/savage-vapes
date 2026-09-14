#!/usr/bin/env python3
import json
import os
import sys
import time
import urllib.request
import urllib.error

BASE_URL = "https://primevapesaustralia.com/wp-json/wc/store/v1"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

def fetch_json(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            headers = dict(resp.headers)
            data = json.loads(resp.read().decode("utf-8"))
            return data, headers
    except urllib.error.HTTPError as e:
        print(f"HTTP error fetching {url}: {e.code} {e.reason}", file=sys.stderr)
        return None, {}
    except Exception as e:
        print(f"Error fetching {url}: {e}", file=sys.stderr)
        return None, {}

def extract_brand(name, categories):
    known_brands = [
        "IGET", "HQD", "ALIBARBAR", "RELX", "VEIPUS", "WAKA", "BIMO", "KUZ",
        "SEREIN", "FOGER", "VAPEHUB", "SMOK", "UWELL", "VAPORESSO", "VOOPOO",
        "ZOOVOO", "LOST MARY", "X-QLUSIVE", "YOONE", "GEEK BAR", "ELF BAR",
        "OXVA", "CALIBURN", "INNOKIN"
    ]
    name_upper = name.upper()
    for brand in known_brands:
        if brand in name_upper:
            return brand
    for cat in categories:
        cat_name = cat.get("name", "").upper()
        for brand in known_brands:
            if brand in cat_name:
                return brand
    if categories:
        return categories[0].get("name", "Savage")
    return "Savage"

def normalize_price(price_raw, minor_unit=2):
    try:
        val = float(price_raw)
        if minor_unit > 0:
            return round(val / (10 ** minor_unit), 2)
        return round(val, 2)
    except:
        return 0.0

def main():
    os.makedirs("data", exist_ok=True)
    print("Fetching product categories...")
    categories_data, _ = fetch_json(f"{BASE_URL}/products/categories?per_page=100")
    if categories_data:
        print(f"Retrieved {len(categories_data)} categories.")
        with open("data/categories.json", "w", encoding="utf-8") as f:
            json.dump(categories_data, f, indent=2, ensure_ascii=False)
    else:
        categories_data = []

    print("Fetching all products...")
    all_products = []
    page = 1
    per_page = 100

    while True:
        url = f"{BASE_URL}/products?per_page={per_page}&page={page}"
        print(f"Fetching page {page}...", end=" ", flush=True)
        products_page, headers = fetch_json(url)

        if not products_page or len(products_page) == 0:
            print("Done or no data.")
            break

        print(f"Found {len(products_page)} products.")
        for p in products_page:
            prices = p.get("prices", {})
            minor_unit = prices.get("currency_minor_unit", 2)
            price = normalize_price(prices.get("price", 0), minor_unit)
            regular_price = normalize_price(prices.get("regular_price", 0), minor_unit)
            sale_price = normalize_price(prices.get("sale_price", 0), minor_unit)

            cats = p.get("categories", [])
            brand = extract_brand(p.get("name", ""), cats)

            images = []
            for img in p.get("images", []):
                images.append({
                    "id": img.get("id"),
                    "src": img.get("src"),
                    "thumbnail": img.get("thumbnail") or img.get("src"),
                    "alt": img.get("alt") or p.get("name", "")
                })

            normalized_product = {
                "id": str(p.get("id")),
                "name": p.get("name"),
                "slug": p.get("slug"),
                "sku": p.get("sku") or "",
                "permalink": p.get("permalink") or "",
                "brand": brand,
                "price": price,
                "regular_price": regular_price if regular_price > 0 else price,
                "sale_price": sale_price if (p.get("on_sale") and sale_price > 0) else None,
                "on_sale": p.get("on_sale", False),
                "is_in_stock": p.get("is_in_stock", True),
                "categories": [c.get("name") for c in cats],
                "category_objects": cats,
                "short_description": p.get("short_description", ""),
                "description": p.get("description", ""),
                "images": images,
                "attributes": p.get("attributes", []),
                "rating": float(p.get("average_rating") or 5.0 if float(p.get("average_rating") or 0) == 0 else p.get("average_rating")),
                "review_count": int(p.get("review_count") or 0)
            }
            all_products.append(normalized_product)

        total_pages = int(headers.get("x-wp-totalpages", 0) or headers.get("X-WP-TotalPages", 0) or 21)
        if page >= total_pages:
            print(f"Reached last page ({total_pages}).")
            break

        page += 1
        time.sleep(0.2) # Friendly delay

    print(f"\nExtraction complete! Total products extracted: {len(all_products)}")
    with open("data/products.json", "w", encoding="utf-8") as f:
        json.dump(all_products, f, indent=2, ensure_ascii=False)
    print("Saved products to data/products.json and categories to data/categories.json")

if __name__ == "__main__":
    main()

