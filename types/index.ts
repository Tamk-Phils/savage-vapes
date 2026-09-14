export interface ProductImage {
  id: number | string;
  src: string;
  thumbnail: string;
  alt: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  link?: string;
  count?: number;
  description?: string;
}

export interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  permalink?: string;
  brand: string;
  price: number;
  regular_price: number;
  sale_price: number | null;
  on_sale: boolean;
  is_in_stock: boolean;
  categories: string[];
  category_objects?: ProductCategory[];
  short_description: string;
  description: string;
  images: ProductImage[];
  attributes?: ProductAttribute[];
  rating: number;
  review_count: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedFlavor?: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  suburb: string;
  state: string; // NSW, VIC, QLD, WA, SA, TAS, ACT, NT
  postcode: string;
  country: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: {
    productId: string;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    selectedFlavor?: string;
  }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface CustomerReview {
  id: string;
  productId?: string;
  productName?: string;
  author: string;
  rating: number;
  city: string;
  state: string;
  date: string;
  comment: string;
  verified: boolean;
}

