'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowDown, ArrowRight, Footprints, Hexagon, Route, Sparkles, Compass, Flame } from 'lucide-react';
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

  const handleStageKeyDown = (event: React.KeyboardEvent, index: number) => {
    const isArrow = event.key === 'ArrowRight' || event.key === 'ArrowLeft';
    if (isArrow === false) return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const next = (index + direction + demoStages.length) % demoStages.length;
    setActiveStage(next);
    document.getElementById(`stage-tab-${next}`)?.focus();
  };

  return (
    <div className="stepclaim-site" data-type="software" data-radius="soft" data-buttons="pill" data-ground="sky">
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
        {/* Screen 1: Hero alone */}
        <section className="landing-hero" data-enter aria-labelledby="hero-title">
          <motion.div
            className="hero-message"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <TerritoryShader />
            
            {/* Real Smartphone Mockup showing StepClaim in Hand */}
            <div className="hero-mockup-wrapper">
              <div className="phone-glow" />
              <img 
                src="/images/phone-mockup.png" 
                alt="Person holding smartphone tracking outdoor route and conquered territories live with StepClaim" 
                className="hero-phone-img"
              />
              <div className="floating-badge badge-top">
                <span className="pulse-dot" />
                <span>GPS Live Track • 3.42 km</span>
              </div>
              <div className="floating-badge badge-bottom">
                <Hexagon className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>4 Territories Claimed</span>
              </div>
            </div>
          </motion.div>

          <div className="hero-bottomline">
            <span>Move through the familiar.</span>
            <span>See it differently.</span>
          </div>
        </section>

        {/* Screen 2: How It Works */}
        <section className="how-section" id="how-it-works" aria-labelledby="how-title">
          <div className="section-intro">
            <h2 id="how-title">The city opens up as you move.</h2>
            <p>Track a route, claim the ground you cover, then build on it next time you head out.</p>
          </div>
          <div className="demo-layout">
            <div className="demo-copy">
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
                    onKeyDown={(event) => handleStageKeyDown(event, index)}
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
            </div>

            <div
              className={`territory-demo stage-${activeStage}`}
              data-ui
              aria-label={`Territory preview: ${selectedStage.name}`}
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
            </div>
          </div>
        </section>

        {/* Screen 3: Movement Modes */}
        <section className="movement-section" aria-labelledby="movement-title">
          <div className="movement-heading">
            <h2 id="movement-title">Every pace counts.</h2>
            <p>Run, walk, or ride. StepClaim follows the way you already like to move.</p>
          </div>
          <div
            className={`mode-preview mode-${activeMode}`}
            data-ui
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
          </div>
        </section>

        {/* Screen 4: Real Movement Gallery Showcase (Anti-Slop Taste Cards) */}
        <section className="landing-gallery-section" aria-labelledby="gallery-title">
          <div className="section-intro">
            <h2 id="gallery-title">Real movement. Real world.</h2>
            <p>From sunrise loops to high-cadence strides, every outing expands your territory map.</p>
          </div>

          <div className="gallery-cards-grid">
            {/* Card 1: Hand holding Phone with StepClaim */}
            <div className="taste-card">
              <div className="taste-card-head">
                <span className="taste-tag tag-device">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Live Companion
                </span>
                <h3 className="taste-card-title">The City in Your Hand</h3>
                <p className="taste-card-copy">Real-time GPS tracking with hexagonal conquest right in your mobile browser.</p>
              </div>
              <div className="taste-photo-frame">
                <img 
                  src="/images/phone-mockup.png" 
                  alt="Smartphone running StepClaim live tracking held outdoors" 
                  loading="lazy"
                />
              </div>
            </div>

            {/* Card 2: Morning Trail Sunrise */}
            <div className="taste-card">
              <div className="taste-card-head">
                <span className="taste-tag tag-sunrise">
                  <Compass className="w-3.5 h-3.5" aria-hidden="true" /> Golden Hour Routes
                </span>
                <h3 className="taste-card-title">Dawn Patrol Loops</h3>
                <p className="taste-card-copy">Transform quiet morning paths and tree-lined neighborhood streets into claimed zones.</p>
              </div>
              <div className="taste-photo-frame">
                <img 
                  src="/images/morning-trail.jpg" 
                  alt="Sunlit morning running trail under trees" 
                  loading="lazy"
                />
              </div>
            </div>

            {/* Card 3: Runner in Action */}
            <div className="taste-card">
              <div className="taste-card-head">
                <span className="taste-tag tag-athlete">
                  <Flame className="w-3.5 h-3.5" aria-hidden="true" /> Pace and Power
                </span>
                <h3 className="taste-card-title">Built for Real Athletes</h3>
                <p className="taste-card-copy">Push your race pace, earn XP per 100 meters, level up, and maintain your daily streak.</p>
              </div>
              <div className="taste-photo-frame">
                <img 
                  src="/images/runner-action.jpg" 
                  alt="Athletic runner pacing outdoors" 
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Screen 5: Closing Action Band */}
        <section className="closing-band" aria-labelledby="closing-title">
          <div className="closing-lead-col">
            <h2 id="closing-title">Take the long way home.</h2>
            <p>Make a route, claim a little ground, and give yourself a reason to head out again.</p>
            <div className="closing-action">
              <p>Your map begins with one route.</p>
              <Link href="/register" className="closing-link">Create your account <ArrowRight aria-hidden="true" /></Link>
            </div>
          </div>

          <div className="starter-preview" data-ui aria-label="StepClaim starter overview">
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
            <p className="starter-empty">No recent activity yet. Start running.</p>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-main-row">
          <Link href="/" className="footer-brand"><span className="landing-mark"><Hexagon aria-hidden="true" /></span>StepClaim</Link>
          <p className="footer-motto">Movement makes the map.</p>
          <div className="footer-nav-links">
            <Link href="/login">Log in</Link>
            <Link href="/register">Create account</Link>
          </div>
        </div>
        <p className="footer-credits">Photos and composites licensed for StepClaim.</p>
      </footer>
    </div>
  );
}
