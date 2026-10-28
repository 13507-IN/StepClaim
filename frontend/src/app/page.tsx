'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowDown, ArrowRight, Footprints, Hexagon, Route } from 'lucide-react';
import { TerritoryShader } from '@/components/landing/territory-shader';

const demoStages = [
  {
    name: 'Move',
    heading: 'Go your own way.',
    copy: 'A run, walk, or ride becomes a route through the real world.',
  },
  {
    name: 'Claim',
    heading: 'Make the map yours.',
    copy: 'The ground you cover becomes territory you can capture.',
  },
  {
    name: 'Grow',
    heading: 'Come back stronger.',
    copy: 'Earn XP, build your streak, and give every outing a next step.',
  },
];

const movementModes = [
  { name: 'Run', description: 'Turn your usual loop into ground worth claiming.', route: 'M22 106C94 91 99 56 157 62C222 68 222 29 276 37C327 44 344 20 398 18' },
  { name: 'Walk', description: 'Explore a little further, at a pace that feels good.', route: 'M22 22C84 33 82 75 150 70C213 65 220 107 275 94C326 82 340 114 398 108' },
  { name: 'Ride', description: 'Cover new streets and open up your map.', route: 'M22 96C74 98 88 30 151 40C215 50 239 105 295 81C344 60 349 29 398 25' },
];

export default function LandingPage() {
  const [activeStage, setActiveStage] = useState(1);
  const [activeMode, setActiveMode] = useState(0);
  const selectedStage = demoStages[activeStage];
  const selectedMode = movementModes[activeMode];

  return (
    <div className="stepclaim-site">
      <header className="landing-header">
        <Link href="/" className="landing-brand" aria-label="StepClaim home">
          <span className="landing-mark"><Hexagon aria-hidden="true" /></span>
          <span>StepClaim</span>
        </Link>
        <nav aria-label="Main navigation" className="landing-nav">
          <Link href="#how-it-works">How it works</Link>
          <Link href="/login">Log in</Link>
          <Link href="/register" className="landing-nav-cta">Create account <ArrowRight aria-hidden="true" /></Link>
        </nav>
      </header>

      <main>
        <section className="landing-hero" aria-labelledby="hero-title">
          <motion.div
            className="hero-message"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 0.7, 0.2, 1] }}
          >
            <h1 id="hero-title"><span>Your route.</span><span>Your territory.</span></h1>
            <p>StepClaim turns running, walking, and riding into territory you can capture, grow, and revisit.</p>
            <div className="hero-links">
              <Link href="/register" className="primary-link">Start your first route <ArrowRight aria-hidden="true" /></Link>
              <Link href="#how-it-works" className="quiet-link">See how it works <ArrowDown aria-hidden="true" /></Link>
            </div>
          </motion.div>

          <motion.div
            className="hero-art"
            data-ui
            initial={{ opacity: 0, scale: 0.975 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 0.7, 0.2, 1] }}
          >
            <TerritoryShader />
            <div className="map-grid" aria-hidden="true">
              <span className="map-cell map-cell-1" />
              <span className="map-cell map-cell-2" />
              <span className="map-cell map-cell-3" />
              <span className="map-cell map-cell-4" />
              <span className="map-cell map-cell-5" />
              <span className="map-cell map-cell-6" />
              <span className="map-cell map-cell-7" />
              <span className="map-cell map-cell-8" />
            </div>
            <svg className="hero-route" viewBox="0 0 760 560" fill="none" aria-hidden="true">
              <path className="route-shadow" d="M94 438C179 419 159 352 245 338C329 323 321 254 402 247C480 241 479 173 556 163C612 156 625 119 675 98" />
              <path className="route-line" pathLength="1" d="M94 438C179 419 159 352 245 338C329 323 321 254 402 247C480 241 479 173 556 163C612 156 625 119 675 98" />
              <circle className="route-start" cx="94" cy="438" r="7" />
              <circle className="route-end" cx="675" cy="98" r="9" />
              <circle className="route-end-ring" cx="675" cy="98" r="19" />
            </svg>
            <div className="art-caption" data-ui><span>Sample route</span><span>One more way through the city</span></div>
            <div className="art-key"><span /><span>Territory claimed</span></div>
          </motion.div>
          <motion.div
            className="hero-bottomline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <span>Move through the familiar.</span>
            <span>See it differently.</span>
          </motion.div>
        </section>

        <section className="how-section" id="how-it-works" aria-labelledby="how-title">
          <div className="section-intro">
            <motion.h2
              id="how-title"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45 }}
            >
              The city opens up as you move.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: 0.08 }}
            >
              Track a route, claim the ground you cover, then build on it next time you head out.
            </motion.p>
          </div>
          <div className="demo-layout">
            <motion.div
              className="demo-copy"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5 }}
            >
              <div className="demo-tabs" role="tablist" aria-label="How StepClaim works">
                {demoStages.map((stage, index) => (
                <button
                  key={stage.name}
                  id={`stage-tab-${index}`}
                  role="tab"
                  type="button"
                  aria-selected={activeStage === index}
                  aria-controls="stage-panel"
                  tabIndex={activeStage === index ? 0 : -1}
                  className={activeStage === index ? 'demo-tab is-selected' : 'demo-tab'}
                  onClick={() => setActiveStage(index)}
                  onKeyDown={(event) => {
                    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
                    event.preventDefault();
                    const direction = event.key === 'ArrowRight' ? 1 : -1;
                    const next = (index + direction + demoStages.length) % demoStages.length;
                    setActiveStage(next);
                    document.getElementById(`stage-tab-${next}`)?.focus();
                  }}
                  >
                    {stage.name}
                  </button>
                ))}
              </div>
              <div
                id="stage-panel"
                role="tabpanel"
                aria-labelledby={`stage-tab-${activeStage}`}
                className="demo-stage-copy"
                key={activeStage}
              >
                <h3>{selectedStage.heading}</h3>
                <p>{selectedStage.copy}</p>
              </div>
              <Link href="/register" className="text-link">Make your first move <ArrowRight aria-hidden="true" /></Link>
            </motion.div>

            <motion.div
              className={`territory-demo stage-${activeStage}`}
              data-ui
              aria-label={`Territory preview: ${selectedStage.name}`}
              initial={{ opacity: 0, scale: 0.985 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55 }}
            >
              <div className="demo-map-lines" aria-hidden="true" />
              <div className="demo-map-cells" aria-hidden="true">
                <span className="demo-cell cell-a" /><span className="demo-cell cell-b" />
                <span className="demo-cell cell-c" /><span className="demo-cell cell-d" />
                <span className="demo-cell cell-e" /><span className="demo-cell cell-f" />
                <span className="demo-cell cell-g" /><span className="demo-cell cell-h" />
                <span className="demo-cell cell-i" /><span className="demo-cell cell-j" />
                <span className="demo-cell cell-k" /><span className="demo-cell cell-l" />
              </div>
              <svg className="demo-route" viewBox="0 0 620 360" fill="none" aria-hidden="true">
                <path d="M42 280C112 275 112 204 203 213C284 222 286 134 361 155C434 176 436 88 568 66" />
                <circle cx="42" cy="280" r="6" /><circle cx="568" cy="66" r="7" />
              </svg>
              <div className="demo-state">
                {activeStage === 0 ? <Footprints aria-hidden="true" /> : activeStage === 1 ? <Hexagon aria-hidden="true" /> : <Route aria-hidden="true" />}
                <span>{activeStage === 0 ? 'Route tracked' : activeStage === 1 ? 'Territory expanded' : 'Progress saved'}</span>
              </div>
              <span className="map-wordmark">STEPCLAIM</span>
            </motion.div>
          </div>
        </section>

        <section className="movement-section" aria-labelledby="movement-title">
          <div className="movement-heading">
            <motion.h2
              id="movement-title"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45 }}
            >
              Every pace counts.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: 0.08 }}
            >
              Run, walk, or ride. StepClaim follows the way you already like to move.
            </motion.p>
          </div>
          <motion.div
            className={`mode-preview mode-${activeMode}`}
            data-ui
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <div className="mode-options" role="group" aria-label="Choose a movement type">
              {movementModes.map((mode, index) => (
                <button
                  key={mode.name}
                  type="button"
                  aria-pressed={activeMode === index}
                  className={activeMode === index ? 'mode-option is-active' : 'mode-option'}
                  onClick={() => setActiveMode(index)}
                >
                  {mode.name}
                </button>
              ))}
            </div>
            <div className="mode-preview-map">
              <div className="mode-map-cells" aria-hidden="true">
                <span /><span /><span /><span /><span />
              </div>
              <svg viewBox="0 0 420 130" fill="none" aria-hidden="true">
                <path d={selectedMode.route} />
                <circle cx="22" cy={activeMode === 1 ? 22 : 106} r="5" />
                <circle cx="398" cy={activeMode === 1 ? 108 : activeMode === 2 ? 25 : 18} r="7" />
              </svg>
            </div>
            <div className="mode-preview-caption" key={activeMode}>
              <h3>{selectedMode.name}</h3>
              <p>{selectedMode.description}</p>
            </div>
          </motion.div>
        </section>

        <motion.section
          className="closing-band"
          aria-labelledby="closing-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
        >
          <div>
            <motion.h2
              id="closing-title"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45 }}
            >
              Take the long way home.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: 0.08 }}
            >
              Make a route, claim a little ground, and give yourself a reason to head out again.
            </motion.p>
            <div className="closing-action">
              <p>Your map begins with one route.</p>
              <Link href="/register" className="closing-link">Create your account <ArrowRight aria-hidden="true" /></Link>
            </div>
          </div>
          <div className="starter-preview" data-ui aria-label="New StepClaim dashboard preview">
            <div className="starter-preview-heading">
              <div>
                <h3>Overview</h3>
                <p>Your territory</p>
              </div>
              <span>Level 1</span>
            </div>
            <div className="starter-stats">
              <div>
                <span>Total distance</span>
                <strong>0.00 <small>km</small></strong>
              </div>
              <div>
                <span>Territories</span>
                <strong>0</strong>
              </div>
              <div>
                <span>Active streak</span>
                <strong>0 <small>days</small></strong>
              </div>
              <div>
                <span>Progress to next level</span>
                <div className="starter-progress"><span /></div>
              </div>
            </div>
            <p className="starter-empty">No recent activity yet. Start running!</p>
          </div>
        </motion.section>
      </main>

      <footer className="landing-footer">
        <Link href="/" className="footer-brand"><span className="landing-mark"><Hexagon aria-hidden="true" /></span>StepClaim</Link>
        <p>Movement makes the map.</p>
        <div><Link href="/login">Log in</Link><Link href="/register">Create account</Link></div>
      </footer>
    </div>
  );
}
