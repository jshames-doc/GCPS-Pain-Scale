import { useState, useEffect, useRef, forwardRef } from 'react';
import { translations } from './translations';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [lang, setLang] = useState('he'); // Default to Hebrew as requested
  const [answers, setAnswers] = useState({
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q5: null
  });
  const [showResults, setShowResults] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const t = translations[lang];
  const isRtl = lang === 'he';

  const q2Ref = useRef(null);
  const q3Ref = useRef(null);
  const q4Ref = useRef(null);
  const q5Ref = useRef(null);
  const resultsRef = useRef(null);

  const handleAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    
    // Skip autoscroll on mobile (width < 768px)
    if (window.innerWidth < 768) return;

    // For button-based questions, scroll with a short delay
    if (key === 'q1') {
      setTimeout(() => q2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400);
    } else if (key === 'q2') {
      setTimeout(() => q3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400);
    }
  };

  const handleSliderChange = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: parseInt(value) }));
    
    // Clear any existing scroll timeout when the slider is moved
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
  };

  // Dedicated scroll effect for sliders with a 3-second delay
  const triggerDelayedScroll = (targetRef, isResults = false) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      if (isResults) {
        setShowResults(true);
        // We still want to show results, but maybe skip the smooth scroll on mobile
        if (window.innerWidth >= 768) {
          setTimeout(() => {
            if (resultsRef.current) {
              resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        }
      } else {
        // Skip autoscroll to next question on mobile
        if (window.innerWidth >= 768 && targetRef.current) {
          targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      scrollTimeoutRef.current = null;
    }, 3000);
  };

  const handleSliderEnd = (key) => {
    // If the value was null (first touch), set it to the current slider value
    if (answers[key] === null) {
      // The current value is already in state from handleSliderChange
    }

    // Trigger the delayed scroll
    if (key === 'q3') triggerDelayedScroll(q4Ref);
    if (key === 'q4') triggerDelayedScroll(q5Ref);
    if (key === 'q5') triggerDelayedScroll(resultsRef, true);
  };

  // Remove the previous immediate useEffect scroll
  useEffect(() => {
    // This effect is now just for initial showResults scroll if needed, 
    // but we'll handle most scrolling in the event handlers for better control.
  }, [showResults]);

  const calculateScore = () => {
    const { q1, q2, q3, q4, q5 } = answers;
    const q3v = q3 ?? 0;
    const q4v = q4 ?? 0;
    const q5v = q5 ?? 0;
    const pegTotal = q3v + q4v + q5v;
    const pegAvg = (pegTotal / 3).toFixed(1);
    
    let grade = 0;
    // q1 and q2 indices: 0: Never, 1: Some days, 2: Most days, 3: Every day
    const isChronic = q1 >= 2; // Most days or Every day
    const isHighImpact = isChronic && q2 >= 2; // Most days or Every day
    
    if (!isChronic) {
      grade = 0;
    } else if (isHighImpact) {
      grade = 3;
    } else {
      grade = pegTotal >= 12 ? 2 : 1;
    }

    return { pegTotal, pegAvg, grade };
  };

  const score = calculateScore();

  const reset = () => {
    setAnswers({ q1: null, q2: null, q3: 0, q4: 0, q5: 0 });
    setShowResults(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={cn("min-h-screen bg-clinical-50 font-sans text-slate-900 pb-20", isRtl ? "rtl" : "ltr")} dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-clinical-50 shadow-clinical px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-800 tracking-tight">{t.title}</h1>
        <button 
          onClick={() => setLang(lang === 'en' ? 'he' : 'en')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-white/40 text-indigo-700 hover:bg-white/90 transition-colors font-medium shadow-sm"
        >
          <Languages size={18} />
          <span>{t.language}</span>
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-14">
        {/* Intro */}
        <section className="text-center space-y-3">
          <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-lg mx-auto">{t.instructions}</p>
        </section>

        {/* Question 1 */}
        <QuestionContainer>
          <h2 className={cn("text-2xl font-bold mb-8 tracking-tight text-slate-800", isRtl && "hebrew-text")}>{t.q1.text}</h2>
          <div className="grid grid-cols-2 gap-3">
            {t.q1.options.map((opt, i) => (
              <ChoiceButton 
                key={i} 
                label={opt} 
                active={answers.q1 === i} 
                onClick={() => handleAnswer('q1', i)} 
              />
            ))}
          </div>
        </QuestionContainer>

        {/* Question 2 */}
        <AnimatePresence>
          {answers.q1 !== null && (
            <QuestionContainer ref={q2Ref} animate>
              <h2 className={cn("text-2xl font-bold mb-8 tracking-tight text-slate-800", isRtl && "hebrew-text")}>{t.q2.text}</h2>
              <div className="grid grid-cols-2 gap-3">
                {t.q2.options.map((opt, i) => (
                  <ChoiceButton 
                    key={i} 
                    label={opt} 
                    active={answers.q2 === i} 
                    onClick={() => handleAnswer('q2', i)} 
                  />
                ))}
              </div>
            </QuestionContainer>
          )}
        </AnimatePresence>

        {/* 7 Days Context */}
        <AnimatePresence>
          {answers.q2 !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-6 text-center italic text-slate-600 font-medium text-lg border-y border-slate-200/60"
            >
              {t.last7Days}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question 3 */}
        <AnimatePresence>
          {answers.q2 !== null && (
            <QuestionContainer ref={q3Ref} animate>
              <h2 className={cn("text-2xl font-bold mb-1 tracking-tight text-slate-800", isRtl && "hebrew-text")}>{t.q3.text}</h2>
              <p className="text-slate-400 text-xs font-medium mb-4">{t.sliderHint}</p>
              <div className="text-6xl font-black text-indigo-600 text-center py-6 tabular-nums tracking-tight">
                {answers.q3 ?? 0}
              </div>
              <Slider 
                value={answers.q3 ?? 0} 
                onChange={(val) => handleSliderChange('q3', val)} 
                onEnd={() => handleSliderEnd('q3')}
                minLabel={t.q3.minLabel}
                maxLabel={t.q3.maxLabel}
                isRtl={isRtl}
              />
              <div className="flex justify-center mt-4">
                <button 
                  onClick={() => {
                    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                    q4Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="px-8 py-3 bg-clinical-100 text-slate-600 rounded-full font-bold text-sm hover:bg-slate-200 transition-colors shadow-sm"
                >
                  {isRtl ? "המשך" : "Continue"}
                </button>
              </div>
            </QuestionContainer>
          )}
        </AnimatePresence>

        {/* Question 4 */}
        <AnimatePresence>
          {answers.q2 !== null && answers.q3 !== null && (
            <QuestionContainer ref={q4Ref} animate>
              <h2 className={cn("text-2xl font-bold mb-1 tracking-tight text-slate-800", isRtl && "hebrew-text")}>{t.q4.text}</h2>
              <p className="text-slate-400 text-xs font-medium mb-4">{t.sliderHint}</p>
              <div className="text-6xl font-black text-indigo-600 text-center py-6 tabular-nums tracking-tight">
                {answers.q4 ?? 0}
              </div>
              <Slider 
                value={answers.q4 ?? 0} 
                onChange={(val) => handleSliderChange('q4', val)} 
                onEnd={() => handleSliderEnd('q4')}
                minLabel={t.q4.minLabel}
                maxLabel={t.q4.maxLabel}
                isRtl={isRtl}
              />
              <div className="flex justify-center mt-4">
                <button 
                  onClick={() => {
                    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                    q5Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="px-8 py-3 bg-clinical-100 text-slate-600 rounded-full font-bold text-sm hover:bg-slate-200 transition-colors shadow-sm"
                >
                  {isRtl ? "המשך" : "Continue"}
                </button>
              </div>
            </QuestionContainer>
          )}
        </AnimatePresence>

        {/* Question 5 */}
        <AnimatePresence>
          {answers.q2 !== null && answers.q4 !== null && (
            <QuestionContainer ref={q5Ref} animate>
              <h2 className={cn("text-2xl font-bold mb-1 tracking-tight text-slate-800", isRtl && "hebrew-text")}>{t.q5.text}</h2>
              <p className="text-slate-400 text-xs font-medium mb-4">{t.sliderHint}</p>
              <div className="text-6xl font-black text-indigo-600 text-center py-6 tabular-nums tracking-tight">
                {answers.q5 ?? 0}
              </div>
              <Slider 
                value={answers.q5 ?? 0} 
                onChange={(val) => handleSliderChange('q5', val)} 
                onEnd={() => handleSliderEnd('q5')}
                minLabel={t.q5.minLabel}
                maxLabel={t.q5.maxLabel}
                isRtl={isRtl}
              />
              <div className="flex justify-center mt-4">
                <button 
                  onClick={() => {
                    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                    setShowResults(true);
                    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                  }}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 shadow-clinical-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  {isRtl ? "הצג תוצאות" : "Show Results"}
                </button>
              </div>
            </QuestionContainer>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {showResults && (
            <motion.section 
              ref={resultsRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[2rem] p-8 shadow-clinical-lg space-y-8 bg-gradient-to-b from-indigo-600 to-indigo-700 text-white"
            >
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold tracking-tight">{t.results.title}</h2>
                <div className="w-16 h-1.5 bg-white/30 mx-auto rounded-full" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-2xl p-5 text-center backdrop-blur-sm border border-white/10">
                  <div className="text-sm font-medium opacity-80 mb-2">{t.results.pegTotal}</div>
                  <div className="text-4xl font-bold tabular-nums">{score.pegTotal}</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-5 text-center backdrop-blur-sm border border-white/10">
                  <div className="text-sm font-medium opacity-80 mb-2">{t.results.pegAverage}</div>
                  <div className="text-4xl font-bold tabular-nums">{score.pegAvg}</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 text-indigo-900 shadow-clinical">
                <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">
                  {t.results.grade}
                </div>
                <div className="text-2xl font-bold leading-tight tracking-tight">
                  {t.results.gradeNames[score.grade]}
                </div>
              </div>

              <p className="text-sm text-indigo-100 text-center italic opacity-80 leading-relaxed">
                {t.results.description}
              </p>

              <button 
                onClick={reset}
                className="w-full flex items-center justify-center gap-2 bg-white text-indigo-600 font-bold py-4 rounded-xl hover:bg-indigo-50 transition-colors shadow-clinical-lg hover:shadow-xl"
              >
                <RotateCcw size={20} />
                {t.buttons.reset}
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

const QuestionContainer = forwardRef(({ children, animate = false }, ref) => {
  const Component = animate ? motion.section : 'section';
  const props = animate ? {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  } : {};

  return (
    <Component 
      ref={ref}
      {...props}
      className="glass rounded-[2rem] p-8 shadow-clinical border border-white/40 scroll-mt-24"
    >
      {children}
    </Component>
  );
});

function ChoiceButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "py-5 px-4 rounded-2xl font-bold text-center transition-all duration-200 border-2 touch-manipulation leading-tight",
        active 
          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200/50 scale-[1.02] ring-2 ring-indigo-600 ring-offset-2 ring-offset-clinical-50" 
          : "bg-white/60 backdrop-blur-sm border-slate-200/60 text-slate-600 hover:border-indigo-300 hover:bg-white/80 hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      {label}
    </button>
  );
}

function Slider({ value, onChange, onEnd, minLabel, maxLabel, isRtl }) {
  return (
    <div className="space-y-6 py-6">
      <div className="relative h-14 flex items-center">
        <input 
          type="range"
          min="0"
          max="10"
          step="1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPointerUp={() => onEnd()}
          onMouseUp={() => onEnd()}
          onTouchEnd={() => onEnd()}
          className="w-full h-3 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to ${isRtl ? 'left' : 'right'}, #4f46e5 ${value * 10}%, #E2E8F0 ${value * 10}%)`
          }}
        />
      </div>

      <div className="flex justify-between text-sm font-bold text-slate-500 gap-4">
        <span className="flex-1 text-start leading-snug">{minLabel}</span>
        <span className="flex-1 text-end leading-snug">{maxLabel}</span>
      </div>
      <div className="flex justify-between px-1">
        {[...Array(11)].map((_, i) => (
          <div key={i} className={cn("text-sm font-medium transition-colors tabular-nums", value == i ? "text-indigo-600 font-bold" : "text-slate-300")}>
            {i}
          </div>
        ))}
      </div>
    </div>
  );
}
