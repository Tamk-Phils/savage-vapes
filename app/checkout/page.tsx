'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Building2, 
  Wallet, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  User
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    suburb: '',
    state: 'NSW',
    postcode: '',
    orderNotes: '',
  });

  // Credit Card / Mastercard details
  const [cardData, setCardData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'payid' | 'card' | 'crypto'>('payid');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fixed flat shipping rates (Free services removed)
  const standardFee = 15;
  const expressFee = 22;
  const currentShippingFee = shippingMethod === 'express' ? expressFee : standardFee;
  const finalTotal = subtotal + currentShippingFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardData({ ...cardData, cardNumber: formatted });
    if (errorMsg) setErrorMsg('');
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setCardData({ ...cardData, expiryDate: raw });
    if (errorMsg) setErrorMsg('');
  };

  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'American Express';
    return 'Card';
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ageConfirmed) {
      setErrorMsg('You must declare that you are 18 years of age or older to purchase.');
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone || !formData.addressLine1 || !formData.suburb || !formData.postcode) {
      setErrorMsg('Please complete all required address and contact fields.');
      return;
    }

    if (paymentMethod === 'card') {
      const cleanCard = cardData.cardNumber.replace(/\s+/g, '');
      if (!cardData.cardholderName.trim()) {
        setErrorMsg('Please enter the Cardholder Name as shown on your card.');
        return;
      }
      if (cleanCard.length < 15 || cleanCard.length > 16 || !/^\d+$/.test(cleanCard)) {
        setErrorMsg('Please enter a valid 15 or 16-digit credit card number.');
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cardData.expiryDate)) {
        setErrorMsg('Please enter a valid expiration date in MM/YY format.');
        return;
      }
      if (!/^\d{3,4}$/.test(cardData.cvv.trim())) {
        setErrorMsg('Please enter a valid 3 or 4-digit CVV/CVC security code.');
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const orderPayload = {
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          suburb: formData.suburb,
          state: formData.state,
          postcode: formData.postcode,
          country: 'Australia',
        },
        items: items.map((item) => ({
          productId: String(item.product.id),
          productName: item.product.name,
          productImage: item.product.images?.[0]?.src || '',
          price: item.product.on_sale && item.product.sale_price ? item.product.sale_price : item.product.price,
          quantity: item.quantity,
          selectedFlavor: item.selectedFlavor,
        })),
        subtotal,
        shippingFee: currentShippingFee,
        total: finalTotal,
        paymentMethod,
        cardDetails: paymentMethod === 'card' ? {
          cardholderName: cardData.cardholderName.trim(),
          last4: cardData.cardNumber.replace(/\s+/g, '').slice(-4),
          brand: getCardBrand(cardData.cardNumber),
          expiry: cardData.expiryDate.trim(),
        } : undefined,
        orderNotes: formData.orderNotes,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        clearCart();
        router.push(`/order-success?id=${data.orderId}`);
      } else {
        setErrorMsg(data.error || 'Failed to place order. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error while placing order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 bg-[#f5f5f5]">
        <div className="max-w-md w-full text-center space-y-5 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#45cab4]/15 border border-[#45cab4]/30 text-[#2b9685] flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h2>
          <p className="text-sm text-gray-500">
            Please add some authentic disposable vapes or pod systems to your cart before proceeding to checkout.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-[#45cab4] hover:bg-[#37b19d] text-black font-bold uppercase text-xs tracking-wider transition-all shadow-sm"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-10 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[#2b9685] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Cart</span>
          </Link>
          <span className="text-xs text-gray-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#2b9685]" />
            256-Bit SSL Encrypted Checkout
          </span>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Fields */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Contact */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                1. Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Mitchell Smith"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:ring-1 focus:ring-[#45cab4] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Email Address * (for order tracking)
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:ring-1 focus:ring-[#45cab4] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Australian Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0400 000 000"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:ring-1 focus:ring-[#45cab4] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                2. Australian Delivery Address
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    placeholder="123 George Street"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:ring-1 focus:ring-[#45cab4] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Apartment, suite, unit (optional)
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    placeholder="Unit 4B"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:ring-1 focus:ring-[#45cab4] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Suburb / City *
                    </label>
                    <input
                      type="text"
                      required
                      name="suburb"
                      value={formData.suburb}
                      onChange={handleInputChange}
                      placeholder="Sydney"
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:ring-1 focus:ring-[#45cab4] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      State *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-[#45cab4] focus:outline-none"
                    >
                      <option value="NSW">New South Wales (NSW)</option>
                      <option value="VIC">Victoria (VIC)</option>
                      <option value="QLD">Queensland (QLD)</option>
                      <option value="WA">Western Australia (WA)</option>
                      <option value="SA">South Australia (SA)</option>
                      <option value="TAS">Tasmania (TAS)</option>
                      <option value="ACT">Australian Capital Territory (ACT)</option>
                      <option value="NT">Northern Territory (NT)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Postcode *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleInputChange}
                      placeholder="2000"
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:ring-1 focus:ring-[#45cab4] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                3. Shipping Method
              </h2>
              <div className="space-y-3">
                <label
                  onClick={() => setShippingMethod('standard')}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    shippingMethod === 'standard'
                      ? 'bg-[#45cab4]/10 border-[#45cab4] text-gray-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${shippingMethod === 'standard' ? 'border-[#2b9685]' : 'border-gray-400'}`}>
                      {shippingMethod === 'standard' && <div className="w-2 h-2 rounded-full bg-[#2b9685]" />}
                    </div>
                    <div>
                      <span className="text-sm font-bold block">Standard Discreet Shipping (AU Post)</span>
                      <span className="text-xs text-gray-500">Plain packaging, 2-5 business days</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    ${standardFee.toFixed(2)} AUD
                  </span>
                </label>

                <label
                  onClick={() => setShippingMethod('express')}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    shippingMethod === 'express'
                      ? 'bg-[#45cab4]/10 border-[#45cab4] text-gray-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${shippingMethod === 'express' ? 'border-[#2b9685]' : 'border-gray-400'}`}>
                      {shippingMethod === 'express' && <div className="w-2 h-2 rounded-full bg-[#2b9685]" />}
                    </div>
                    <div>
                      <span className="text-sm font-bold block flex items-center gap-1.5">
                        <span>Express Discreet Courier</span>
                        <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-[#45cab4] text-black rounded-full">Fast</span>
                      </span>
                      <span className="text-xs text-gray-500">Priority dispatch, 1-2 business days to metro</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    ${expressFee.toFixed(2)} AUD
                  </span>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                4. Payment Method
              </h2>
              <div className="space-y-3">
                <label
                  onClick={() => setPaymentMethod('payid')}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'payid'
                      ? 'bg-[#45cab4]/10 border-[#45cab4] text-gray-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 mt-1 rounded-full border flex items-center justify-center ${paymentMethod === 'payid' ? 'border-[#2b9685]' : 'border-gray-400'}`}>
                    {paymentMethod === 'payid' && <div className="w-2 h-2 rounded-full bg-[#2b9685]" />}
                  </div>
                  <div>
                    <span className="text-sm font-bold flex items-center gap-2 text-gray-900">
                      <Building2 className="w-4 h-4 text-[#2b9685]" />
                      PayID / Direct Australian Bank Transfer (Instant Verification)
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Safe, instant transfer with no card processing fees. Payment reference details provided on the order confirmation screen.
                    </p>
                  </div>
                </label>

                {/* Credit / Debit Card (Visa, Mastercard, Amex) */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-[#45cab4]/5 border-[#45cab4]'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <label
                    onClick={() => setPaymentMethod('card')}
                    className="flex items-start gap-3 cursor-pointer"
                  >
                    <div className={`w-4 h-4 mt-1 rounded-full border flex items-center justify-center ${paymentMethod === 'card' ? 'border-[#2b9685]' : 'border-gray-400'}`}>
                      {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-[#2b9685]" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold flex items-center gap-2 text-gray-900">
                          <CreditCard className="w-4 h-4 text-[#2b9685]" />
                          Credit / Debit Card (Visa & Mastercard)
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-blue-50 text-blue-700 border border-blue-200">
                            VISA
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-orange-50 text-orange-700 border border-orange-200">
                            MC
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Encrypted checkout processed via Australian secure merchant gateway.
                      </p>
                    </div>
                  </label>

                  {/* Interactive Card Details Form */}
                  {paymentMethod === 'card' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3.5 animate-fade-in">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          Cardholder Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={cardData.cardholderName}
                          onChange={(e) => {
                            setCardData({ ...cardData, cardholderName: e.target.value });
                            if (errorMsg) setErrorMsg('');
                          }}
                          placeholder="e.g. John Doe"
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:ring-1 focus:ring-[#45cab4] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                            Card Number *
                          </label>
                          {cardData.cardNumber && (
                            <span className="text-[11px] font-bold text-[#2b9685]">
                              {getCardBrand(cardData.cardNumber)}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          value={cardData.cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-mono placeholder-gray-400 focus:border-[#45cab4] focus:ring-1 focus:ring-[#45cab4] focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            Expiry (MM/YY) *
                          </label>
                          <input
                            type="text"
                            required
                            value={cardData.expiryDate}
                            onChange={handleExpiryChange}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-mono placeholder-gray-400 focus:border-[#45cab4] focus:ring-1 focus:ring-[#45cab4] focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-gray-400" />
                            CVV / CVC *
                          </label>
                          <input
                            type="password"
                            required
                            value={cardData.cvv}
                            onChange={(e) => {
                              const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
                              setCardData({ ...cardData, cvv: clean });
                              if (errorMsg) setErrorMsg('');
                            }}
                            placeholder="123"
                            maxLength={4}
                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-mono placeholder-gray-400 focus:border-[#45cab4] focus:ring-1 focus:ring-[#45cab4] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-500">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>256-bit encrypted SSL checkout. Card details are processed securely.</span>
                      </div>
                    </div>
                  )}
                </div>

                <label
                  onClick={() => setPaymentMethod('crypto')}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'crypto'
                      ? 'bg-[#45cab4]/10 border-[#45cab4] text-gray-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 mt-1 rounded-full border flex items-center justify-center ${paymentMethod === 'crypto' ? 'border-[#2b9685]' : 'border-gray-400'}`}>
                    {paymentMethod === 'crypto' && <div className="w-2 h-2 rounded-full bg-[#2b9685]" />}
                  </div>
                  <div>
                    <span className="text-sm font-bold flex items-center gap-2 text-gray-900">
                      <Wallet className="w-4 h-4 text-[#2b9685]" />
                      Cryptocurrency (USDT / Bitcoin)
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      100% anonymous, fast blockchain checkout with zero chargeback risks.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Mandatory Age Confirmation */}
            <div className="p-5 rounded-xl bg-teal-50/70 border border-teal-200 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-400 text-[#45cab4] focus:ring-[#45cab4] accent-[#45cab4]"
                />
                <span className="text-xs sm:text-sm text-gray-700">
                  <strong className="text-gray-900">I declare that I am 18 years of age or older</strong> and agree to the Vape Well Australia Terms of Service and Privacy Policy. I acknowledge that nicotine products are age-restricted in Australia.
                </span>
              </label>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm sticky top-28 space-y-6">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-4">
                Order Review ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-none divide-y divide-gray-100">
                {items.map((item) => {
                  const p = item.product;
                  const unitPrice = p.on_sale && p.sale_price ? p.sale_price : p.price;
                  return (
                    <div key={`${p.id}-${item.selectedFlavor || 'default'}`} className="pt-3 first:pt-0 flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-200 p-1 flex-shrink-0 flex items-center justify-center">
                        <img
                          src={p.images[0]?.src || '/placeholder-vape.jpg'}
                          alt={p.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 truncate">
                          {p.name}
                        </h4>
                        {item.selectedFlavor && (
                          <span className="text-[11px] text-gray-500 block">
                            {item.selectedFlavor}
                          </span>
                        )}
                        <span className="text-[11px] text-gray-500">
                          Qty: {item.quantity} × ${unitPrice.toFixed(2)} AUD
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-900 flex-shrink-0">
                        ${(unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Cost Totals */}
              <div className="space-y-2.5 pt-4 border-t border-gray-200 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">${subtotal.toFixed(2)} AUD</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping ({shippingMethod === 'express' ? 'Express' : 'Standard'})</span>
                  <span className="font-bold text-gray-900">
                    ${currentShippingFee.toFixed(2)} AUD
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                  <span className="text-base font-bold text-gray-900">Total Amount</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#2b9685] font-display">
                      ${finalTotal.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">AUD</span>
                  </div>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-full bg-[#45cab4] hover:bg-[#37b19d] text-black text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Processing Order...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Place Order (${finalTotal.toFixed(2)} AUD)</span>
                  </>
                )}
              </button>

              <div className="pt-2 space-y-2 text-[11px] text-gray-500">
                <p className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2b9685]" />
                  Discreet unbranded packaging via Australia Post.
                </p>
                <p>
                  Tracking information will be emailed automatically upon dispatch.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
