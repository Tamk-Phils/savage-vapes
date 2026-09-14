'use client';

import { useState } from 'react';
import { Star, MessageSquarePlus, CheckCircle2, X, PackageCheck } from 'lucide-react';

const initialReviews = [
  {
    id: 1,
    author: 'Jack W.',
    city: 'Brisbane',
    state: 'QLD',
    rating: 5,
    date: '2 days ago',
    comment: 'Super fast dispatch! Ordered IGET Bars on Tuesday, arrived in plain discreet satchel by Thursday morning in Brisbane. Authenticity QR code verified genuine.',
    product: 'IGET Bar 3500 Puffs',
    verified: true,
  },
  {
    id: 2,
    author: 'Chloe D.',
    city: 'Melbourne',
    state: 'VIC',
    rating: 5,
    date: '4 days ago',
    comment: 'The VEIPUS OPAL pods taste so clean. Really appreciate the discreet delivery packaging—no mention of vapes on the parcel at all. Will definitely be a repeat customer.',
    product: 'VEIPUS OPAL Pods',
    verified: true,
  },
  {
    id: 3,
    author: 'Sam T.',
    city: 'Sydney',
    state: 'NSW',
    rating: 5,
    date: '1 week ago',
    comment: 'Ordered a 10-pack bundle of HQD. Saved around $60 compared to local tobacconists. Genuine scratch-off code checks out on HQD official site.',
    product: 'HQD Cuvie Slick 6000',
    verified: true,
  },
  {
    id: 4,
    author: 'Marcus L.',
    city: 'Perth',
    state: 'WA',
    rating: 5,
    date: '1 week ago',
    comment: 'Express delivery to WA took only 2 business days. The Alibarbar 9000 puff flavour profile is unmatched. Excellent service and support from Vape Well.',
    product: 'ALIBARBAR INGOT 9000',
    verified: true,
  },
  {
    id: 5,
    author: 'Hannah M.',
    city: 'Adelaide',
    state: 'SA',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Customer service helped me choose the right beginner pod system. PayID payment was instant and received shipping tracking within 3 hours. 10/10!',
    product: 'RELX Infinity Pod Kit',
    verified: true,
  },
  {
    id: 6,
    author: 'David K.',
    city: 'Gold Coast',
    state: 'QLD',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Best online vape store in Australia hands down. Huge selection of flavours, competitive prices, and fast dispatch.',
    product: 'Geek Bar Pulse 15000',
    verified: true,
  },
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(initialReviews);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form states
  const [author, setAuthor] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('NSW');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) return;

    const newRev = {
      id: Date.now(),
      author: author.trim(),
      city: city.trim() || 'Sydney',
      state,
      rating,
      date: 'Just now',
      comment: comment.trim(),
      product: 'Verified Purchase',
      verified: true,
    };

    setReviews([newRev, ...reviews]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setModalOpen(false);
      setAuthor('');
      setCity('');
      setComment('');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-12 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header & Overall Score */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2b9685] block">
            Customer Feedback
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 font-display">
            What Our Customers Say
          </h1>
          <p className="text-base text-gray-600">
            Read authentic reviews from verified adult vapers across Australia who trust Vape Well for their daily hardware and flavour needs.
          </p>

          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm inline-flex flex-col sm:flex-row items-center gap-6 mt-4">
            <div className="text-center sm:text-left">
              <span className="text-4xl sm:text-5xl font-black text-gray-900 font-display">
                4.9<span className="text-xl text-gray-400">/5</span>
              </span>
              <div className="flex text-amber-400 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <span className="text-xs text-gray-500 mt-1 block">
                Based on 3,420+ verified deliveries
              </span>
            </div>

            <div className="h-px sm:h-12 w-full sm:w-px bg-gray-200" />

            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-3.5 rounded-full bg-[#45cab4] hover:bg-[#37b19d] text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 sm:p-7 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#45cab4]/50 transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{rev.date}</span>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>

                {rev.product && (
                  <span className="text-xs font-semibold text-[#2b9685] block">
                    Product: {rev.product}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs">
                <div>
                  <span className="font-bold text-gray-900 block">{rev.author}</span>
                  <span className="text-gray-500">{rev.city}, {rev.state}</span>
                </div>
                {rev.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2b9685]">
                    <PackageCheck className="w-3.5 h-3.5" />
                    Verified Order
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal for adding review */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-2xl">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Write a Customer Review
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                Share your experience with our vapes, flavours, and delivery times.
              </p>

              {submitted ? (
                <div className="py-10 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-[#2b9685] mx-auto" />
                  <p className="text-base font-bold text-gray-900">Thank you for your review!</p>
                  <p className="text-xs text-gray-500">Your feedback has been published.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="e.g. Jack W."
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700">City / Suburb</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Brisbane"
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700">State</label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#45cab4] focus:outline-none"
                      >
                        <option value="NSW">NSW</option>
                        <option value="VIC">VIC</option>
                        <option value="QLD">QLD</option>
                        <option value="WA">WA</option>
                        <option value="SA">SA</option>
                        <option value="TAS">TAS</option>
                        <option value="ACT">ACT</option>
                        <option value="NT">NT</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700">Rating</label>
                      <div className="flex items-center gap-1 pt-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-5 h-5 ${star <= rating ? 'fill-current' : 'text-gray-300'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Your Feedback *</label>
                    <textarea
                      required
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="How was the flavour, device performance, and delivery speed?"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-full bg-[#45cab4] hover:bg-[#37b19d] text-black text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                  >
                    Submit Review
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
