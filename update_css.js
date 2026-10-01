const fs = require('fs');

const css = `.detailContainer {
  background-color: #000000;
  color: #ffffff;
  padding-bottom: 6rem;
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
}

@media (min-width: 1024px) {
  .detailContainer {
    max-width: 1200px;
    padding-top: 100px;
  }
}

.desktopGrid {
  display: flex;
  flex-direction: column;
}

.galleryArea { order: 1; }
.infoArea { order: 2; }
.extraArea { order: 3; }

@media (min-width: 1024px) {
  .desktopGrid {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    grid-template-areas:
      "gallery info"
      "extra   info";
    gap: 0 3rem;
    align-items: flex-start;
  }
  .galleryArea { grid-area: gallery; }
  .infoArea { grid-area: info; }
  .extraArea { grid-area: extra; }
}

.topInfo {
  padding: 1.5rem;
}

.extraInfo {
  padding: 1.5rem;
}

.statsRow {
  display: flex;
  justify-content: space-between;
  color: #888888;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.title {
  font-size: 1.8rem;
  font-weight: 400;
  letter-spacing: 0.05em;
  line-height: 1.3;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

@media (min-width: 768px) {
  .title {
    font-size: 2.2rem;
  }
}

.seller {
  font-size: 0.9rem;
  color: #888888;
  margin-bottom: 1.5rem;
}

.seller span {
  color: #3b82f6;
}

.price {
  font-size: 1.75rem;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .price {
    font-size: 2.2rem;
  }
}

.skuRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.sku {
  font-size: 0.95rem;
  color: #aaaaaa;
}

.divider {
  height: 1px;
  background-color: #222222;
  margin: 2rem 0;
  width: 100%;
}

.sectionTitle {
  font-size: 1rem;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

@media (min-width: 768px) {
  .sectionTitle {
    font-size: 1.2rem;
  }
}

.specRow {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem 0;
  border-bottom: 1px solid #222222;
}

.specRow:last-child {
  border-bottom: none;
}

@media (min-width: 768px) {
  .specRow {
    flex-direction: row;
    gap: 2rem;
  }
}

.specColumn {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.specLabel {
  font-size: 0.9rem;
  color: #aaaaaa;
  margin-bottom: 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.specValue {
  font-size: 1.05rem;
  color: #ffffff;
  font-weight: 500;
}

@media (min-width: 768px) {
  .specLabel { font-size: 0.95rem; }
  .specValue { font-size: 1.15rem; }
}

.descriptionBox {
  font-size: 0.95rem;
  color: #dddddd;
  line-height: 1.6;
  padding-bottom: 2rem;
}

@media (min-width: 768px) {
  .descriptionBox { font-size: 1.05rem; line-height: 1.8; }
}

.mobileGallery {
  width: 100%;
  padding: 1rem 1.5rem; 
  background-color: #000000;
}

.galleryFrame {
  width: 100%;
  position: relative;
  aspect-ratio: 4/3;
  background-color: #0a0a0a;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.8);
  border: 1px solid rgba(255,255,255,0.08);
}

.backBtn {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  background: transparent;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0.8;
}

.backBtn:hover {
  opacity: 1;
}

@media (min-width: 1024px) {
  .mobileGallery { padding: 0; background-color: transparent; }
  .topInfo { padding: 0; }
  .extraInfo { padding: 2rem 0; }
}

.whatsappCtaBox {
  margin: 2rem 0;
  padding: 2rem 1.5rem;
  background-color: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  text-align: center;
}

.whatsappCtaBox h3 {
  font-size: 1.3rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-family: var(--font-serif), serif;
}

.whatsappCtaBox p {
  color: #aaaaaa;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

@media (min-width: 768px) {
  .whatsappCtaBox { padding: 3rem 2rem; margin: 3rem 0; }
  .whatsappCtaBox h3 { font-size: 1.5rem; }
  .whatsappCtaBox p { font-size: 1.05rem; margin-bottom: 2rem; }
}

.whatsappCtaBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: #25D366;
  color: #ffffff !important;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.2s ease;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}

.whatsappCtaBtn svg {
  width: 20px;
  height: 20px;
}

.whatsappCtaBtn:hover {
  background-color: #20BA56;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
}

@media (min-width: 768px) {
  .whatsappCtaBtn {
    font-size: 1.1rem;
    padding: 1.25rem 2rem;
    border-radius: 50px;
    max-width: 400px;
    gap: 0.75rem;
  }
  .whatsappCtaBtn svg {
    width: 24px;
    height: 24px;
  }
}
`;
fs.writeFileSync('src/app/(public)/vehiculo/[slug]/page.module.css', css);
