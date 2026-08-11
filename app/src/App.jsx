import { useState, useRef, useMemo } from 'react';
import { translations } from './translations';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, RotateCcw, Mail } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function calculateScore(answers) {
  const { q1, q2, q3, q4, q5 } = answers;
  const pegTotal = (q3 ?? 0) + (q4 ?? 0) + (q5 ?? 0);
  const pegAvg = (pegTotal / 3).toFixed(1);
  const isChronic = q1 >= 2;
  const isHighImpact = isChronic && q2 >= 2;
  const grade = !isChronic ? 0 : isHighImpact ? 3 : pegTotal >= 12 ? 2 : 1;

  return { pegTotal, pegAvg, grade };
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
  const [expandedGrade, setExpandedGrade] = useState(null);
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
    setAnswers(prev => ({ ...prev, [key]: parseInt(value, 10) }));
    
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
    if (key === 'q3') triggerDelayedScroll(q4Ref);
    if (key === 'q4') triggerDelayedScroll(q5Ref);
    if (key === 'q5') triggerDelayedScroll(resultsRef, true);
  };

  const score = useMemo(() => calculateScore(answers), [answers]);

  const answeredCount = [answers.q1, answers.q2, answers.q3, answers.q4, answers.q5].filter(v => v !== null).length;
  const isComplete = showResults;
  const currentQ = isComplete ? 5 : Math.min(answeredCount + 1, 5);
  const progressPercent = (answeredCount / 5) * 100;
  const progressText = isComplete
    ? t.progressComplete
    : t.progressLabel.replace('{current}', currentQ).replace('{total}', 5);

  const getPegInterpretation = (avg) => {
    const val = parseFloat(avg);
    if (val === 0) return t.results.pegInterpretation.none;
    if (val > 0 && val < 4) return t.results.pegInterpretation.mild;
    if (val >= 4 && val <= 7) return t.results.pegInterpretation.moderate;
    return t.results.pegInterpretation.severe;
  };

  const getPegBand = (avg) => {
    const val = parseFloat(avg);
    if (val === 0) return 'none';
    if (val < 4) return 'mild';
    if (val <= 7) return 'moderate';
    return 'severe';
  };

  const gradeAccentBg = {
    0: 'bg-emerald-500',
    1: 'bg-lime-500',
    2: 'bg-amber-500',
    3: 'bg-rose-500',
  };

  const pegBarColor = {
    none: 'bg-emerald-500',
    mild: 'bg-lime-500',
    moderate: 'bg-amber-500',
    severe: 'bg-rose-500',
  };

  const pegChipStyle = {
    none: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
    mild: 'bg-lime-100 text-lime-700 ring-1 ring-lime-200',
    moderate: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
    severe: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
  };

  const generateEmailBody = () => {
    const q1Answer = answers.q1 !== null ? t.q1.options[answers.q1] : 'N/A';
    const q2Answer = answers.q2 !== null ? t.q2.options[answers.q2] : 'N/A';
    const q3Answer = answers.q3 ?? 0;
    const q4Answer = answers.q4 ?? 0;
    const q5Answer = answers.q5 ?? 0;

    return `GCPS-R Pain Inventory Results
${'='.repeat(35)}

Questions:
1. Pain frequency (past 3 months): ${q1Answer}
2. Life/work limitation (past 3 months): ${q2Answer}
3. Pain level (0-10): ${q3Answer}
4. Enjoyment interference (0-10): ${q4Answer}
5. General activity interference (0-10): ${q5Answer}

Results:
${t.results.pegTotal}: ${score.pegTotal}
${t.results.pegAverage}: ${score.pegAvg} (${getPegInterpretation(score.pegAvg)})
${t.results.grade}: ${t.results.gradeNames[score.grade]}`;
  };

  const handleEmailResults = () => {
    const subject = encodeURIComponent('GCPS-R Pain Inventory Results');
    const body = encodeURIComponent(generateEmailBody());
    window.location.href = `mailto:jshames@gmail.com?subject=${subject}&body=${body}`;
  };

  const reset = () => {
    setAnswers({ q1: null, q2: null, q3: null, q4: null, q5: null });
    setShowResults(false);
    setExpandedGrade(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleGrade = (g) => {
    setExpandedGrade(prev => prev === g ? null : g);
  };

  return (
    <div className={cn("min-h-screen bg-clinical-50 font-sans text-ink pb-12", isRtl ? "rtl" : "ltr")} dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/95 text-white shadow-lg shadow-ink/10 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <h1 className="min-w-0 truncate text-base font-bold tracking-tight sm:text-lg">{t.title}</h1>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <a
              href="https://pain.docrehab.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-10 items-center rounded-xl px-2 text-lg font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:text-xs"
              aria-label={t.backToSite}
            >
              <span aria-hidden="true">←</span>
              <span className="hidden sm:inline">&nbsp;{t.backToSite}</span>
            </a>
            <button
              onClick={() => setLang(lang === 'en' ? 'he' : 'en')}
              aria-label={t.language}
              className="flex min-h-10 items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-2.5 text-xs font-bold text-white transition-colors hover:bg-white/20 sm:px-3 sm:text-sm"
            >
              <Languages size={15} />
              <span className="hidden sm:inline">{t.language}</span>
              <span className="sm:hidden">{t.languageShort}</span>
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 pb-3 sm:px-6">
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70 sm:text-xs">
            {progressText}
          </span>
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-white/15"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={progressPercent}
            aria-label={progressText}
          >
            <motion.div
              className="h-full rounded-full bg-electric-400"
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-7 px-4 py-6 sm:space-y-9 sm:px-6 sm:py-10">
        {/* Intro */}
        <section className="rounded-3xl border border-ink/10 bg-white px-5 py-5 shadow-clinical sm:px-7 sm:py-6">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-electric-600 sm:text-xs">
            <span className="h-2 w-2 rounded-full bg-electric-600" />
            <span>{t.title}</span>
          </div>
          <p className="max-w-lg text-base font-medium leading-relaxed text-slate-600 sm:text-lg">{t.instructions}</p>
        </section>

        {/* Question 1 */}
        <QuestionContainer eyebrow={`${t.questionLabel} 1 / 5`}>
          <h2 className={cn("mb-6 text-xl font-bold tracking-tight text-ink sm:mb-8 sm:text-2xl", isRtl && "hebrew-text")}>{t.q1.text}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <QuestionContainer key="q2" ref={q2Ref} animate eyebrow={`${t.questionLabel} 2 / 5`}>
              <h2 className={cn("mb-6 text-xl font-bold tracking-tight text-ink sm:mb-8 sm:text-2xl", isRtl && "hebrew-text")}>{t.q2.text}</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              key="7days"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-electric-600/20 bg-electric-50 px-4 py-4 text-center text-base font-semibold italic text-electric-800 sm:text-lg"
            >
              {t.last7Days}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question 3 */}
        <AnimatePresence>
          {answers.q2 !== null && (
            <QuestionContainer key="q3" ref={q3Ref} animate eyebrow={`${t.questionLabel} 3 / 5`}>
              <h2 className={cn("mb-1 text-xl font-bold tracking-tight text-ink sm:text-2xl", isRtl && "hebrew-text")}>{t.q3.text}</h2>
              <p className="mb-4 text-xs font-medium text-slate-500">{t.sliderHint}</p>
              <div className="rounded-2xl bg-ink px-4 py-5 text-center text-5xl font-black tabular-nums tracking-tight text-electric-300 sm:py-6 sm:text-6xl">
                {answers.q3 ?? 0}<span className="ms-2 text-sm font-bold tracking-normal text-white/50">/ 10</span>
              </div>
              <Slider 
                value={answers.q3 ?? 0} 
                onChange={(val) => handleSliderChange('q3', val)} 
                onEnd={() => handleSliderEnd('q3')}
                minLabel={t.q3.minLabel}
                maxLabel={t.q3.maxLabel}
                ariaLabel={t.q3.text}
              />
              <div className="flex justify-center mt-4">
                <button 
                  onClick={() => {
                    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                    setAnswers(prev => ({ ...prev, q3: prev.q3 ?? 0 }));
                    q4Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="min-h-11 rounded-xl border border-ink/10 bg-clinical-100 px-7 py-3 text-sm font-bold text-ink transition-colors hover:bg-clinical-200"
                >
                  {t.continue}
                </button>
              </div>
            </QuestionContainer>
          )}
        </AnimatePresence>

        {/* Question 4 */}
        <AnimatePresence>
          {answers.q2 !== null && answers.q3 !== null && (
            <QuestionContainer key="q4" ref={q4Ref} animate eyebrow={`${t.questionLabel} 4 / 5`}>
              <h2 className={cn("mb-1 text-xl font-bold tracking-tight text-ink sm:text-2xl", isRtl && "hebrew-text")}>{t.q4.text}</h2>
              <p className="mb-4 text-xs font-medium text-slate-500">{t.sliderHint}</p>
              <div className="rounded-2xl bg-ink px-4 py-5 text-center text-5xl font-black tabular-nums tracking-tight text-electric-300 sm:py-6 sm:text-6xl">
                {answers.q4 ?? 0}<span className="ms-2 text-sm font-bold tracking-normal text-white/50">/ 10</span>
              </div>
              <Slider 
                value={answers.q4 ?? 0} 
                onChange={(val) => handleSliderChange('q4', val)} 
                onEnd={() => handleSliderEnd('q4')}
                minLabel={t.q4.minLabel}
                maxLabel={t.q4.maxLabel}
                ariaLabel={t.q4.text}
              />
              <div className="flex justify-center mt-4">
                <button 
                  onClick={() => {
                    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                    setAnswers(prev => ({ ...prev, q4: prev.q4 ?? 0 }));
                    q5Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="min-h-11 rounded-xl border border-ink/10 bg-clinical-100 px-7 py-3 text-sm font-bold text-ink transition-colors hover:bg-clinical-200"
                >
                  {t.continue}
                </button>
              </div>
            </QuestionContainer>
          )}
        </AnimatePresence>

        {/* Question 5 */}
        <AnimatePresence>
          {answers.q2 !== null && answers.q4 !== null && (
            <QuestionContainer key="q5" ref={q5Ref} animate eyebrow={`${t.questionLabel} 5 / 5`}>
              <h2 className={cn("mb-1 text-xl font-bold tracking-tight text-ink sm:text-2xl", isRtl && "hebrew-text")}>{t.q5.text}</h2>
              <p className="mb-4 text-xs font-medium text-slate-500">{t.sliderHint}</p>
              <div className="rounded-2xl bg-ink px-4 py-5 text-center text-5xl font-black tabular-nums tracking-tight text-electric-300 sm:py-6 sm:text-6xl">
                {answers.q5 ?? 0}<span className="ms-2 text-sm font-bold tracking-normal text-white/50">/ 10</span>
              </div>
              <Slider 
                value={answers.q5 ?? 0} 
                onChange={(val) => handleSliderChange('q5', val)} 
                onEnd={() => handleSliderEnd('q5')}
                minLabel={t.q5.minLabel}
                maxLabel={t.q5.maxLabel}
                ariaLabel={t.q5.text}
              />
              <div className="flex justify-center mt-4">
                <button 
                  onClick={() => {
                    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                    setShowResults(true);
                    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                  }}
                  className="min-h-12 rounded-xl bg-electric-600 px-8 py-3 font-bold text-white shadow-lg shadow-electric-600/20 transition-all hover:-translate-y-0.5 hover:bg-electric-700 hover:shadow-xl"
                >
                  {t.showResults}
                </button>
              </div>
            </QuestionContainer>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {showResults && (
            <motion.section
              key="results"
              ref={resultsRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5 rounded-[1.75rem] bg-ink p-4 text-white shadow-clinical-lg sm:space-y-6 sm:p-6"
            >
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold tracking-tight">{t.results.title}</h2>
                <div className="w-16 h-1.5 bg-white/30 mx-auto rounded-full" />
              </div>

              {/* Grade Hero */}
              <div className="rounded-2xl bg-clinical-50 p-5 text-ink shadow-clinical-lg sm:p-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black text-white shrink-0 shadow-lg",
                    gradeAccentBg[score.grade]
                  )}>
                    {score.grade}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold text-electric-500 uppercase tracking-widest mb-1">
                      {t.results.grade}
                    </div>
                    <div className="text-lg font-bold leading-tight text-ink">
                      {t.results.gradeShortNames[score.grade]}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-slate-600 mt-4 pt-3 border-t border-slate-100">
                  {t.results.gradeNames[score.grade]}
                </div>

                {/* Grade Scale */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-electric-500 uppercase tracking-widest mb-2">
                    {t.results.gradeScaleLabel}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 1, 2, 3].map(g => {
                      const isUser = g === score.grade;
                      const isExpanded = expandedGrade === g;
                      return (
                        <button
                          key={g}
                          onClick={() => toggleGrade(g)}
                          aria-expanded={isExpanded}
                          aria-label={t.results.gradeNames[g]}
                          className={cn(
                            "rounded-xl p-2 flex flex-col items-center justify-center min-h-[64px] transition-all touch-manipulation",
                            isUser
                              ? cn(gradeAccentBg[g], "text-white shadow-md")
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700",
                            isExpanded && !isUser && "ring-2 ring-electric-400",
                            isExpanded && isUser && "ring-2 ring-white"
                          )}
                        >
                          <div className="text-2xl font-black tabular-nums leading-none">{g}</div>
                          <div className="text-[10px] font-bold leading-tight mt-1 text-center">
                            {t.results.gradeCellNames[g]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <AnimatePresence>
                    {expandedGrade !== null && (
                      <motion.div
                        key={expandedGrade}
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="text-xs font-medium text-slate-700 bg-slate-100 rounded-lg p-2.5 text-center">
                          {t.results.gradeNames[expandedGrade]}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* PEG Card */}
              <div className="space-y-4 rounded-2xl border border-white/15 bg-white/10 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium opacity-70 uppercase tracking-wider mb-1">
                      {t.results.pegAverage}
                    </div>
                    <div className="text-4xl font-bold tabular-nums leading-none">
                      {score.pegAvg}
                      <span className="text-base font-normal opacity-50 ms-1.5">/ 10</span>
                    </div>
                  </div>
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap",
                    pegChipStyle[getPegBand(score.pegAvg)]
                  )}>
                    {getPegInterpretation(score.pegAvg)}
                  </div>
                </div>

                <div>
                  <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        pegBarColor[getPegBand(score.pegAvg)]
                      )}
                      style={{ width: `${Math.min(100, (parseFloat(score.pegAvg) / 10) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-60 mt-2 px-0.5">
                    <span>{t.results.pegScale.none}</span>
                    <span>{t.results.pegScale.mild}</span>
                    <span>{t.results.pegScale.moderate}</span>
                    <span>{t.results.pegScale.severe}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                  <span className="text-xs font-medium opacity-70 uppercase tracking-wider">
                    {t.results.pegTotal}
                  </span>
                  <span className="text-2xl font-bold tabular-nums">
                    {score.pegTotal}
                    <span className="text-sm font-normal opacity-50 ms-1.5">/ 30</span>
                  </span>
                </div>
              </div>

              <button
                onClick={reset}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white py-4 font-bold text-electric-600 shadow-clinical-lg transition-colors hover:bg-electric-50 hover:shadow-xl"
              >
                <RotateCcw size={20} />
                {t.buttons.reset}
              </button>
              <button
                onClick={handleEmailResults}
                className="w-full flex items-center justify-center gap-2 bg-white/20 text-white font-bold py-4 rounded-xl hover:bg-white/30 transition-colors border border-white/30"
              >
                <Mail size={20} />
                {t.buttons.email}
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function QuestionContainer({ children, animate = false, ref, eyebrow }) {
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
      className="rounded-3xl border border-ink/10 bg-white p-5 shadow-clinical scroll-mt-24 sm:p-7"
    >
      <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-electric-600 sm:text-xs">
        {eyebrow}
      </div>
      {children}
    </Component>
  );
}

function ChoiceButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-14 rounded-xl border-2 px-4 py-4 text-center font-bold leading-tight transition-all duration-200 touch-manipulation",
        active
          ? "border-electric-600 bg-electric-600 text-white shadow-lg shadow-electric-600/20 ring-2 ring-electric-600 ring-offset-2 ring-offset-clinical-50"
          : "border-ink/15 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-electric-400 hover:bg-electric-50 hover:shadow-md"
      )}
    >
      {label}
    </button>
  );
}

function Slider({ value, onChange, onEnd, minLabel, maxLabel, ariaLabel }) {
  return (
    <div className="space-y-4 py-4 sm:space-y-5 sm:py-5">
      <div className="relative flex h-12 items-center" dir="ltr">
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={value}
          aria-label={ariaLabel}
          onChange={(e) => onChange(e.target.value)}
          onPointerUp={() => onEnd()}
          onMouseUp={() => onEnd()}
          onTouchEnd={() => onEnd()}
          className="h-3 w-full cursor-pointer appearance-none rounded-full"
          style={{ '--slider-progress': `${value * 10}%` }}
        />
      </div>

      <div className="flex justify-between gap-4 text-xs font-bold leading-snug text-slate-600 sm:text-sm" dir="ltr">
        <span className="flex-1 text-start">{minLabel}</span>
        <span className="flex-1 text-end">{maxLabel}</span>
      </div>
      <div className="flex justify-between px-1" dir="ltr">
        {[...Array(11)].map((_, i) => (
          <div key={i} className={cn("text-xs font-medium tabular-nums transition-colors sm:text-sm", value === i ? "font-bold text-electric-600" : "text-slate-400")}>
            {i}
          </div>
        ))}
      </div>
    </div>
  );
}
