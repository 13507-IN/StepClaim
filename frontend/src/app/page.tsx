'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Footprints, Hexagon, Route } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const stages = [
  { label: 'Move', title: 'Leave a line behind.', description: 'Track the run, walk, or ride that gets you out the door.', metric: '2.4 km' },
  { label: 'Claim', title: 'Turn routes into territory.', description: 'Every active route expands a piece of your local map.', metric: '12 cells' },
  { label: 'Return', title: 'Make your map familiar.', description: 'Build a streak by taking the streets worth returning to.', metric: '7 days' },
  { label: 'Grow', title: 'Watch the city become yours.', description: 'Distance, XP, and territory become a record of your movement.', metric: '840 XP' },
];

const features = [
  ['A map with memory', 'Your routes leave a visible record—one block, one park, one shortcut at a time.'],
  ['A reason to go farther', 'The next cell is close enough to chase and far enough to make the detour matter.'],
  ['Progress you can feel', 'Distance, territory, and streaks grow together instead of disappearing into a feed.'],
];

export default function LandingPage() {
  const [stage, setStage] = useState(1);
  const current = stages[stage];

  return (
    <div className="territory-page">
      <header className="site-header">
        <Link href="/" aria-label="StepClaim home" className="brand">
          <span className="brand-mark"><Hexagon aria-hidden="true" /></span><span>StepClaim</span>
        </Link>
        <nav aria-label="Main navigation" className="site-nav">
          <Link href="#how-it-works">How it works</Link><Link href="/login">Log in</Link>
          <Link href="/register" className="nav-action">Start moving <ArrowRight aria-hidden="true" /></Link>
        </nav>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              Claim the ground you move through.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
              StepClaim turns every run, walk, and ride into a map that becomes recognisably yours.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }} className="hero-actions">
              <Link href="/register"><Button size="lg">Start your first route <ArrowRight /></Button></Link>
              <span><Footprints aria-hidden="true" /> Runs, walks, and rides</span>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.08 }} className="hero-field" data-ui>
            <div className="hex-sun" aria-hidden="true" />
            <div className="field-caption"><span>Today&apos;s territory</span><strong>North Loop</strong></div>
            <svg className="route-mark" viewBox="0 0 640 520" fill="none" aria-hidden="true">
              <path d="M87 405C171 366 135 290 238 266C303 251 301 173 393 190C473 205 467 126 556 87" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
              <path d="M87 405C171 366 135 290 238 266C303 251 301 173 393 190C473 205 467 126 556 87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 10" />
              <circle cx="87" cy="405" r="12" fill="currentColor" /><circle cx="556" cy="87" r="10" fill="currentColor" />
            </svg>
            <div className="map-readout"><span><Route aria-hidden="true" /> 4.82 km</span><span><Hexagon aria-hidden="true" /> 18 new cells</span></div>
          </motion.div>
        </section>

        <section className="manifesto-section" aria-labelledby="why-title">
          <div><h2 id="why-title">Your neighborhood is not a backdrop.</h2></div>
          <p className="manifesto-copy">It is the playing field. StepClaim makes the ordinary route home worth noticing, remembering, and taking one block farther.</p>
        </section>

        <section className="feature-section" aria-label="StepClaim features">
          {features.map(([title, description], index) => (
            <motion.article key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45, delay: index * 0.07 }}>
              <span className="feature-hex">{index + 1}</span><h2>{title}</h2><p>{description}</p>
            </motion.article>
          ))}
        </section>

        <section id="how-it-works" className="sequence-section">
          <div className="sequence-copy">
            <h2>{current.title}</h2><p>{current.description}</p><div className="sequence-metric">{current.metric}</div>
          </div>
          <div className="sequence-board" data-ui>
            <div className="mini-map" aria-hidden="true">
              <span className={`cell cell-a ${stage >= 0 ? 'is-active' : ''}`} /><span className={`cell cell-b ${stage >= 1 ? 'is-active' : ''}`} />
              <span className={`cell cell-c ${stage >= 2 ? 'is-active' : ''}`} /><span className={`cell cell-d ${stage >= 3 ? 'is-active' : ''}`} />
              <span className={`cell cell-e ${stage >= 1 ? 'is-active' : ''}`} /><span className={`cell cell-f ${stage >= 2 ? 'is-active' : ''}`} /><span className="mini-route" />
            </div>
            <label htmlFor="route-stage" className="sr-only">Route stage</label>
            <input id="route-stage" aria-valuetext={current.label} type="range" min="0" max="3" value={stage} onChange={(event) => setStage(Number(event.target.value))} />
            <div className="stage-labels">
              {stages.map((item, index) => <button key={item.label} className={index === stage ? 'is-current' : ''} onClick={() => setStage(index)}>{item.label}</button>)}
            </div>
          </div>
        </section>

        <section className="closing-section"><p>Where will you <Link href="/register">start</Link>?</p><span>Make a route. Claim a place. Come back tomorrow.</span></section>
      </main>

      <footer className="site-footer">
        <div className="footer-mark"><Hexagon aria-hidden="true" /><span>STEPCLAIM</span></div>
        <div><Link href="/login">Log in</Link><Link href="/register">Create account</Link></div><p>© {new Date().getFullYear()} StepClaim</p>
      </footer>
    </div>
  );
}
