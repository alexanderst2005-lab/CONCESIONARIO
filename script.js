const fs = require('fs'); 
const path = 'src/app/(public)/page.module.css'; 
const lines = fs.readFileSync(path, 'utf8').split('\n'); 
const newCSS = `/* ─── Eyebrow tag (Removed) ─── */
.heroTag { display: none; }

/* ─── Title ─── */
.heroTitle {
  font-size: clamp(2rem, 6vw, 4.2rem);
  font-weight: 800;
  line-height: 1.15;
  margin: 0 0 1rem 0;
  color: #ffffff;
  text-shadow: 0 4px 30px rgba(0, 0, 0, 0.95);
  letter-spacing: -0.01em;
}

.titleBreak { display: none; }
@media (min-width: 480px) { .titleBreak { display: block; } }

/* ─── Subtitle ─── */
.heroSubtitle {
  font-size: clamp(0.9rem, 2vw, 1.25rem);
  color: var(--gold-accent);
  margin: 0 auto 2.5rem auto;
  line-height: 1.6;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-shadow: 0 2px 15px rgba(0, 0, 0, 0.95);
}

/* ─── Buttons ─── */
.heroButtons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .heroButtons {
    flex-direction: row;
    max-width: 650px;
    justify-content: center;
    gap: 1.5rem;
  }
}

.primaryBtn, .secondaryBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.1rem 2rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: all 0.3s ease;
  text-decoration: none;
  width: 100%;
}

@media (min-width: 640px) {
  .primaryBtn, .secondaryBtn {
    width: auto;
    min-width: 240px;
  }
}

.primaryBtn {
  background: var(--gold-accent);
  color: #000;
  border: 1px solid var(--gold-accent);
  box-shadow: 0 10px 30px rgba(177, 155, 76, 0.25);
}

.primaryBtn:hover {
  background: #fff;
  border-color: #fff;
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(255, 255, 255, 0.3);
}

.secondaryBtn {
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.secondaryBtn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #fff;
  transform: translateY(-3px);
}

/* ─── Scroll Indicator ─── */
.scrollIndicator {
  position: absolute;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.55);
  text-decoration: none;
  transition: color 0.3s ease;
  z-index: 20;
}

.scrollIndicator:hover {
  color: var(--gold-accent);
}

.scrollText {
  font-size: 0.65rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  font-weight: 700;
}

.scrollArrow {
  font-size: 1.2rem;
  animation: bounceDown 2s infinite ease-in-out;
}

@keyframes bounceDown {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

.heroTextWrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  width: 100%;
}

/* subtle parallax animation */
@keyframes slowZoom {
  from { transform: scale(1); }
  to { transform: scale(1.05); }
}
.heroBgImg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  animation: slowZoom 20s infinite alternate ease-in-out;
}`; 
lines.splice(93, 191, newCSS); 
fs.writeFileSync(path, lines.join('\n'));
