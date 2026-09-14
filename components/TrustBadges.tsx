import { ShieldCheck, Truck, Percent, Headset } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: Truck,
      title: 'Discreet Express Shipping',
      description: 'Same-day dispatch via Australia Post in plain packaging for your privacy.',
    },
    {
      icon: ShieldCheck,
      title: '100% Genuine & Authentic',
      description: 'All products sourced directly with scratch-off anti-counterfeit verification.',
    },
    {
      icon: Percent,
      title: 'Bulk Deals & Best Price',
      description: 'Exclusive bundle savings on 10-pack disposable cartons and accessories.',
    },
    {
      icon: Headset,
      title: 'Dedicated AU Support',
      description: 'Fast Australian-based customer service ready to assist with your order.',
    },
  ];

  return (
    <div className="w-full bg-[#0d0c1b] border-y border-[#1c1b30] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-2xl bg-[#141326]/50 border border-white/5 hover:border-brand/20 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-center flex-shrink-0 text-brand">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    {badge.title}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

