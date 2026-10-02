const fs = require('fs');
const cssPath = 'src/app/(public)/page.module.css';
let css = fs.readFileSync(cssPath, 'utf8');

// Find and replace everything from start up to the first non-hero block (featuredSection)
const heroCSSStart = 0;
const heroCSS = `/* ═══════════════════════════════════════════════════════════
   HERO — Cinematic Premium  |  Autos del Patrón
═══════════════════════════════════════════════════════════ */

/* ─── Section shell ─── */
.heroSection {
  position: relative;
  width: 100%;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  padding-bottom: 6rem;
  margin-top: -80px;
  padding-top: 80px;
  overflow: hidden;
  background-color: #050505;
}

@media (min-width: 768px) {
  .heroSection {
    justify-content: center;
    padding-bottom: 0;
    align-items: center;
  }
}

/* ─── Background image ─── */
.heroBg {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.heroBgImg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 40%;
  animation: slowZoom 22s infinite alternate ease-in-out;
}

@media (min-width: 768px) {
  .heroBgImg {
    object-position: 60% center;
  }
}

@keyframes slowZoom {
  from { transform: scale(1); }
  to   { transform: scale(1.06); }
}

/* ─── Overlay — heavy on bottom-left, lighter top-right ─── */
.heroOverlay {
  position: absolute;
  inset: 0;
  background:
    /* Left column dark for text */
    linear-gradient(to right, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.65) 55%, rgba(5,5,5,0.05) 100%),
    /* Bottom dark so scroll indicator reads */
    linear-gradient(to top, rgba(5,5,5,0.85) 0%, transparent 35%);
  z-index: 2;
}

@media (max-width: 767px) {
  .heroOverlay {
    background:
      linear-gradient(to bottom,
        rgba(5,5,5,0.25) 0%,
        rgba(5,5,5,0.50) 35%,
        rgba(5,5,5,0.88) 65%,
        #050505 100%
      );
  }
}

/* ─── Content wrapper ─── */
.heroContent {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1280px;
  padding: 0 1.5rem;
  text-align: center;
}

@media (min-width: 768px) {
  .heroContent {
    text-align: left;
    padding: 0 3rem;
    max-width: 700px;
    margin-left: 0;
    margin-right: auto;
  }
}

@media (min-width: 1200px) {
  .heroContent {
    padding: 0 5rem;
  }
}

/* ─── Eyebrow ─── */
.heroEyebrow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .heroEyebrow {
    justify-content: flex-start;
  }
}

.heroEyebrowLine {
  display: inline-block;
  width: 2.5rem;
  height: 1px;
  background: var(--gold-accent);
  flex-shrink: 0;
}

.heroEyebrowText {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--gold-accent);
}

/* ─── Main title ─── */
.heroTitle {
  font-size: clamp(2.6rem, 8vw, 6rem);
  font-weight: 900;
  line-height: 1.0;
  margin: 0 0 1.25rem 0;
  color: #ffffff;
  text-shadow: 0 4px 30px rgba(0,0,0,0.8);
  letter-spacing: -0.02em;
  word-break: break-word;
}

.heroTitleGold {
  color: var(--gold-accent);
}

/* ─── Subtitle ─── */
.heroSubtitle {
  font-size: clamp(0.85rem, 2vw, 1.1rem);
  color: rgba(255,255,255,0.7);
  margin: 0 0 2.5rem 0;
  line-height: 1.6;
  font-weight: 400;
  letter-spacing: 0.05em;
}

.dot {
  color: var(--gold-accent);
  font-weight: 700;
}

/* ─── CTA Buttons ─── */
.heroButtons {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-bottom: 2rem;
  width: 100%;
}

@media (min-width: 480px) {
  .heroButtons {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (min-width: 768px) {
  .heroButtons {
    justify-content: flex-start;
    flex-wrap: nowrap;
  }
}

.primaryBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  background: var(--gold-accent);
  color: #050505;
  font-weight: 800;
  font-size: 0.82rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  padding: 1rem 2rem;
  border: 1px solid var(--gold-accent);
  border-radius: 3px;
  transition: background 0.25s, color 0.25s, transform 0.2s, box-shadow 0.25s;
  white-space: nowrap;
}

.primaryBtn:hover {
  background: transparent;
  color: var(--gold-accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(177,155,76,0.3);
}

.btnArrow {
  font-size: 1rem;
  transition: transform 0.2s;
}

.primaryBtn:hover .btnArrow {
  transform: translateX(4px);
}

.secondaryBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.06);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.82rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  padding: 1rem 2rem;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 3px;
  transition: background 0.25s, border-color 0.25s, transform 0.2s;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  white-space: nowrap;
}

.secondaryBtn:hover {
  background: rgba(255,255,255,0.14);
  border-color: rgba(255,255,255,0.6);
  transform: translateY(-2px);
}

/* ─── Trust badges ─── */
.heroBadges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.4rem 0.8rem;
  font-size: 0.72rem;
  font-weight: 500;
  color: rgba(255,255,255,0.42);
  letter-spacing: 0.06em;
}

@media (min-width: 768px) {
  .heroBadges {
    justify-content: flex-start;
  }
}

.badgeDot {
  color: var(--gold-accent);
  opacity: 0.7;
}

/* ─── Scroll Indicator ─── */
.scrollIndicator {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  color: rgba(255,255,255,0.45);
  text-decoration: none;
  transition: color 0.3s;
  z-index: 20;
}

.scrollIndicator:hover {
  color: var(--gold-accent);
}

.scrollText {
  font-size: 0.6rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  font-weight: 700;
}

.scrollArrow {
  font-size: 1.1rem;
  animation: bounceDown 2.2s ease-in-out infinite;
}

@keyframes bounceDown {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(7px); }
}

/* ─── Legacy classes kept for safety ─── */
.heroTag        { display: none; }
.heroTextWrapper { display: contents; }
.titleBreak     { display: none; }
.searchBar      { display: none; }
.searchField    { display: none; }
.searchDivider  { display: none; }
.searchBtn      { display: none; }
.heroMeta       { display: none; }
.advancedLink   { display: none; }

`;

// Find where the hero CSS ends (featuredSection or whatever is next after the hero block)
const heroEndMarker = '/* ═══════════════════════════════════════════';
const featuredIdx = css.indexOf('/* ═══════════════════════════════════════════', 1);
const restCSS = featuredIdx > 0 ? css.slice(featuredIdx) : css.slice(css.indexOf('.featuredSection'));

fs.writeFileSync(cssPath, heroCSS + restCSS);
console.log('CSS written successfully');
