import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Quote, Sparkles } from 'lucide-react';

const QUOTES = [
  { text: 'There is always one more bug to fix.', author: 'Lubarsky\'s Law' },
  { text: 'I met my younger self today for Coffee today. I lit a cigarette, he left the table.', author: 'Anonymous' },
  { text: 'I did warn you not to trust me.', author: 'Littlefinger' },
  { text: 'Having it all leaves you with nothing.', author: 'Anonymous' },
  { text: 'Everything is aesthetic until you have to pay the bills for it.', author: 'Anonymous' },
  { text: 'Once I killed a plant by watering it too much.', author: 'Anonymous' },
  { text: 'Everything is valueless until you lose it.', author: 'Anonymous' },
  { text: 'I wish death was the end.', author: 'Surah Al-Haqqah (69:27)' },
  { text: 'I am not even useful to myself.', author: 'Anonymous' },
  { text: 'We fight so hard to catch the train, only to sit by the window and wish we were back home.', author: 'Anonymous' },
  { text: 'Hard work beats talent. But when talent starts working hard, they become unbeatable.', author: 'Anonymous' },
  { text: 'We are all lonely under the right circumstances.', author: 'Anonymous' },
  { text: 'We build walls to see who cares enough to break them down.', author: 'Roy T. Bennett' },
  { text: 'The silent dog bites first.', author: 'German Proverb' },
  { text: 'You never hear the bullet that takes you out.', author: 'Military Proverb' },
  { text: 'A dying fire leaves no smoke.', author: 'Proverb' },
  { text: 'You don\'t notice the air until you start to suffocate.', author: 'Anonymous' },
  { text: 'Experience is the name everyone gives to their mistakes.', author: 'Oscar Wilde' },
  { text: 'We are all drowning, just at different depths.', author: 'Anonymous' },
  { text: 'We chase the butterfly, but the garden is what actually matters.', author: 'Anonymous' },
  { text: 'You can\'t wake up someone who is pretending to be asleep.', author: 'Navajo Proverb' },
  { text: 'A gold coin in a garbage can is still gold, but it still smells like trash.', author: 'Anonymous' },
  { text: 'The tree remembers what the axe forgets.', author: 'African Proverb' },
  { text: 'A bird born in a cage thinks flying is an illness.', author: 'Alejandro Jodorowsky' },
  { text: 'The heaviest burden is the potential you never realized.', author: 'Anonymous' },
  { text: 'The warning label is always written in the smallest font.', author: 'Anonymous' },
  { text: 'Get busy living, or get busy dying.', author: 'Stephen King' },
  { text: 'What we know is a drop. What we don\'t know is an ocean.', author: 'Sir Isaac Newton' },
  { text: 'You can have all the potential in the world, but the world only pays for results.', author: 'Anonymous' },
  { text: 'If it costs you your peace of mind, it\'s too expensive.', author: 'Paulo Coelho' },
  { text: 'We build the engine, tighten the screws, and then wonder why it runs over us.', author: 'Anonymous' },
  { text: 'You can\'t cure the hunger by staring at the menu.', author: 'Anonymous' },
  { text: 'You never realize how heavy the armor is until you finally take it off.', author: 'Anonymous' },
  { text: 'If it requires you to lose yourself to keep it, it\'s not worth having.', author: 'Anonymous' },
  { text: 'If the door won\'t open, it\'s not your door. Build a new one.', author: 'Anonymous' },
  { text: 'Cry, then get back to work.', author: 'Anonymous' },
  { text: 'We buy the finest shoes just to sit behind a desk all day.', author: 'Anonymous' },
  { text: 'The clock ticks loudest when you have nothing left to do.', author: 'Anonymous' },
  { text: 'I drink and I know things.', author: 'Tyrion Lannister' },
  { text: 'Holding a flower, dreaming of forever.', author: 'Anonymous' },
];

const STORAGE_KEY = 'aust-quote-last-shown';
const getToday = () => new Date().toDateString();

function getRandomIndex(avoidIndex) {
  const available = QUOTES.map((_, i) => i).filter((i) => i !== avoidIndex);
  return available[Math.floor(Math.random() * available.length)];
}

function hasBeenShownToday() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    const { date } = JSON.parse(stored);
    return date === getToday();
  } catch {
    return false;
  }
}

function markShownToday(quoteIndex) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getToday(), index: quoteIndex }));
  } catch { /* ignore */ }
}

function getStoredIndex() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return -1;
    const { index } = JSON.parse(stored);
    return typeof index === 'number' ? index : -1;
  } catch {
    return -1;
  }
}

export default function QuotePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const storedIdx = getStoredIndex();
    return storedIdx >= 0 && storedIdx < QUOTES.length ? storedIdx : getRandomIndex(-1);
  });
  const [animateKey, setAnimateKey] = useState(0);
  const [direction, setDirection] = useState(0); // -1 left, 1 right
  const initialAutoShowDone = useRef(false);

  // Auto-show once per day
  useEffect(() => {
    if (initialAutoShowDone.current) return;
    initialAutoShowDone.current = true;

    if (!hasBeenShownToday()) {
      // Pick a fresh random quote for today
      const freshIdx = getRandomIndex(-1);
      setCurrentIndex(freshIdx);
      markShownToday(freshIdx);

      // Delay slightly so it feels natural
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const goNext = useCallback(() => {
    const next = getRandomIndex(currentIndex);
    setCurrentIndex(next);
    markShownToday(next);
    setDirection(1);
    setAnimateKey((k) => k + 1);
  }, [currentIndex]);

  const goPrev = useCallback(() => {
    const prev = getRandomIndex(currentIndex);
    setCurrentIndex(prev);
    markShownToday(prev);
    setDirection(-1);
    setAnimateKey((k) => k + 1);
  }, [currentIndex]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleReopen = useCallback(() => {
    // Pick a new random quote on reopen
    const freshIdx = getRandomIndex(-1);
    setCurrentIndex(freshIdx);
    markShownToday(freshIdx);
    setDirection(1);
    setAnimateKey((k) => k + 1);
    setIsOpen(true);
  }, []);

  const quote = QUOTES[currentIndex];

  return (
    <>
      {/* Floating reopen button — always visible when popup is closed */}
      {!isOpen && (
        <button
          className="quote-reopen-btn"
          onClick={handleReopen}
          title="Daily Quote"
          aria-label="Open daily quote"
        >
          <Quote size={18} />
          <Sparkles size={12} className="quote-reopen-sparkle" />
        </button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div className="quote-overlay" onClick={handleClose}>
          {/* Prevent closing when clicking inside the card */}
          <div
            className="quote-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Quote of the day"
          >
            {/* Close button */}
            <button className="quote-close-btn" onClick={handleClose} aria-label="Close quote">
              <X size={18} />
            </button>

            {/* Label */}
            <div className="quote-label">
              <Sparkles size={14} />
              <span>Quote of the Day</span>
            </div>

            {/* Quote text with animation */}
            <div className="quote-content" key={animateKey}>
              <span className="quote-mark quote-mark-left">"</span>
              <p className={`quote-text ${direction >= 0 ? 'quote-slide-in-right' : 'quote-slide-in-left'}`}>
                {quote.text}
              </p>
              <span className="quote-mark quote-mark-right">"</span>
            </div>

            {/* Author */}
            <div className="quote-author" key={`author-${animateKey}`}>
              <span className="quote-dash">—</span>
              <span className={`quote-author-name ${direction >= 0 ? 'quote-fade-in-up' : 'quote-fade-in-up'}`}>
                {quote.author}
              </span>
            </div>

            {/* Navigation */}
            <div className="quote-nav">
              <button className="quote-nav-btn" onClick={goPrev} aria-label="Previous random quote">
                <ChevronLeft size={20} />
              </button>
              <div className="quote-dots">
                {QUOTES.slice(0, 5).map((_, i) => (
                  <span
                    key={i}
                    className="quote-dot"
                    style={{ opacity: 0.15 + (i / 5) * 0.15 }}
                  />
                ))}
                <span className="quote-dot quote-dot-active" />
                <span className="quote-dot-count">{currentIndex + 1}/{QUOTES.length}</span>
              </div>
              <button className="quote-nav-btn" onClick={goNext} aria-label="Next random quote">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
