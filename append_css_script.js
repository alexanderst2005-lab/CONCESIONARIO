const fs = require('fs');
const content = fs.readFileSync('src/app/(public)/page.module.css', 'utf8');
const newCss = `
/* Hero Content Block */
.heroContentBlock {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 3rem;
  text-align: center;
}

.heroActions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btnPrimaryGold {
  background-color: var(--gold-accent);
  color: #000;
  padding: 1rem 2rem;
  font-weight: 700;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 30px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid var(--gold-accent);
}

.btnPrimaryGold:hover {
  background-color: transparent;
  color: var(--gold-accent);
}

.btnSecondaryOutline {
  background-color: transparent;
  color: #fff;
  padding: 1rem 2rem;
  font-weight: 700;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 30px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btnSecondaryOutline:hover {
  border-color: #fff;
  background-color: rgba(255,255,255,0.1);
}

/* Redesign Search Box */
.searchBoxWrapper {
  background: rgba(10, 10, 10, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}

.searchBox {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: center;
}

@media (min-width: 768px) {
  .searchBox {
    grid-template-columns: 1fr auto 1fr auto 1fr auto;
    gap: 0;
  }
}

.searchDivider {
  display: none;
}

@media (min-width: 768px) {
  .searchDivider {
    display: block;
    width: 1px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.1);
    margin: 0 1rem;
  }
}

.searchField {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.searchField label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gold-accent);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.searchField select,
.searchField input {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1rem;
  outline: none;
  padding: 0;
  width: 100%;
}

.searchField select option {
  background-color: #111;
  color: #fff;
}

.searchFieldBtn {
  margin-top: 1rem;
}

@media (min-width: 768px) {
  .searchFieldBtn {
    margin-top: 0;
    margin-left: 1rem;
  }
}

.searchBtn {
  background-color: var(--gold-accent);
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
}

.searchBtn:hover {
  background-color: #c9b158;
  transform: translateY(-2px);
}

.advancedSearch {
  text-align: center;
  margin-top: 1.5rem;
}

.advancedSearch a {
  color: #aaaaaa;
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.advancedSearch a:hover {
  color: var(--gold-accent);
}
`;
fs.writeFileSync('src/app/(public)/page.module.css', content + newCss, 'utf8');
