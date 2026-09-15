import { ShieldCheck, Truck, Percent, Headset } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: Truck,
      title: 'Discreet Express Shipping',
      description: 'Same-day dispatch via Australia Post in plain satchel packaging for complete privacy.',
    },
    {
      icon: ShieldCheck,
      title: '100% Genuine & Authentic',
      description: 'All hardware and pods sourced directly with scratch-off anti-counterfeit verification codes.',
    },
    {
      icon: Percent,
      title: 'Bulk Cartons & Best Price',
      description: 'Exclusive bundle savings on 10-pack disposable cartons and replacement pods.',
    },
    {
      icon: Headset,
      title: 'Dedicated AU Support',
      description: 'Responsive Australian team ready to assist with order verification and delivery tracking.',
    },
  ];

  return (
    <div className="w-full bg-slate-50 border-y border-slate-200/90 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-300 transition-all shadow-2xs hover:shadow-xs"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center flex-shrink-0 text-[#0d9488]">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    {badge.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
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
