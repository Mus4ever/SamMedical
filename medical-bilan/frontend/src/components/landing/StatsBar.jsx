import { useTranslation } from 'react-i18next';
import { Users, FileText, Heart, Clock } from 'lucide-react';
import { useGsapReveal, useCountUp } from '../../hooks/useGsap';

const Counter = ({ end, suffix = '' }) => {
  const ref = useCountUp(end, suffix);
  return <span ref={ref} className="display text-4xl lg:text-5xl text-ink mono">0{suffix}</span>;
};

const StatsBar = () => {
  const { t } = useTranslation();
  const ref = useGsapReveal({ stagger: 0.1 });

  const items = [
    { icon: Users,    label: t('landing.stats.patientsLabel'),     value: t('landing.stats.patientsValue'),     suffix: '+',  color: 'mint' },
    { icon: FileText, label: t('landing.stats.bilansLabel'),       value: t('landing.stats.bilansValue'),       suffix: '+',  color: 'sky' },
    { icon: Heart,    label: t('landing.stats.satisfactionLabel'), value: 99,                                   suffix: '%',  color: 'peach' },
    { icon: Clock,    label: t('landing.stats.delayLabel'),        value: 5,                                    suffix: 'min', color: 'amber' },
  ];

  const colorMap = {
    mint:  'bg-mint-100 text-mint-700',
    sky:   'bg-sky-100 text-sky-600',
    peach: 'bg-peach-100 text-peach-400',
    amber: 'bg-amber-100 text-amber-500',
  };

  return (
    <section className="py-16 px-6 lg:px-8 bg-paper">
      <div className="max-w-7xl mx-auto">
        <div ref={ref} className="glass rounded-3xl p-8 lg:p-12 shadow-soft grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map(({ icon: Icon, label, value, suffix, color }, i) => (
            <div key={i} className="text-center md:text-left lift">
              <div className={`w-12 h-12 rounded-2xl ${colorMap[color]} flex items-center justify-center mx-auto md:mx-0 mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              {typeof value === 'number' ? (
                <Counter end={value} suffix={suffix} />
              ) : (
                <p className="display text-4xl lg:text-5xl text-ink mono">{value}</p>
              )}
              <p className="eyebrow text-muted mt-2">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
