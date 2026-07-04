import { Sparkles, Zap, Star, Heart, Rocket } from 'lucide-react';

// Dopamine/Maximalism hero shown atop the Marketplace when the Maximalism theme
// is active. Mirrors the Newsprint MarketplaceMasthead precedent: presentational
// only — no state, no side effects. All decoration is aria-hidden and its motion
// respects prefers-reduced-motion (handled by the .max-* classes in index.css).

// Scattered floating shapes — intentionally inconsistent sizes/positions/colors.
const SHAPES = [
  { Icon: Star,    cls: 'max-float',         style: { top: '12%', left: '6%',  color: '#FFE600' }, size: 34 },
  { Icon: Sparkles,cls: 'max-float-reverse', style: { top: '18%', right: '9%', color: '#00F5D4' }, size: 46 },
  { Icon: Zap,     cls: 'max-wiggle',        style: { bottom: '16%', left: '11%', color: '#FF6B35' }, size: 30 },
  { Icon: Heart,   cls: 'max-bounce',        style: { top: '52%', right: '5%', color: '#FF3AF2' }, size: 28 },
  { Icon: Rocket,  cls: 'max-float',         style: { bottom: '12%', right: '16%', color: '#7B2FFF' }, size: 38 },
];

const EMOJI = [
  { char: '🚀', cls: 'max-float',         style: { top: '8%',  right: '30%' } },
  { char: '✨', cls: 'max-wiggle',        style: { bottom: '10%', left: '32%' } },
  { char: '💫', cls: 'max-float-reverse', style: { top: '46%', left: '4%' } },
];

export default function MarketplaceMaxHero() {
  return (
    <header className="mp-max-hero" aria-label="Campus Market">
      {/* Massive bleeding background word */}
      <span className="mp-max-bgword" aria-hidden="true">TRADE</span>

      {/* Floating decorative shapes + emoji */}
      <div className="mp-max-decor" aria-hidden="true">
        {SHAPES.map(({ Icon, cls, style, size }, i) => (
          <span key={`s-${i}`} className={`mp-max-shape ${cls}`} style={style}>
            <Icon size={size} strokeWidth={2.5} />
          </span>
        ))}
        {EMOJI.map(({ char, cls, style }, i) => (
          <span key={`e-${i}`} className={`mp-max-emoji ${cls}`} style={style}>{char}</span>
        ))}
      </div>

      <div className="mp-max-hero-inner">
        <span className="mp-max-kicker">
          <Sparkles size={16} strokeWidth={3} /> Zero commission · Fellow students
        </span>
        <h1 className="mp-max-title max-gradient-text">Campus Market</h1>
        <p className="mp-max-sub">
          Trade kits &amp; books, find bachelor sharing hosts, recover lost stuff, and
          link up with study buddies — <strong>all in one loud, joyful place.</strong>
        </p>
      </div>
    </header>
  );
}
