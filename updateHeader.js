const fs = require('fs');
const path = 'src/components/Header.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add imports
code = code.replace(
  'import React, { useState, useEffect, useRef } from "react";', 
  'import React, { useState, useEffect, useRef } from "react";\nimport { usePathname } from "next/navigation";'
);

// 2. Add state and logic
code = code.replace(
  'const dropdownRef = useRef<HTMLDivElement>(null);', 
  `const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll(); // init
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = pathname === "/";
  const isTransparent = isHome && !isScrolled && !menuOpen;`
);

// 3. Update className
code = code.replace(
  '<header className={styles.header}>', 
  '<header className={`${styles.header} ${isTransparent ? styles.headerTransparent : ""}`}>'
);

fs.writeFileSync(path, code);
console.log('Header.tsx updated');
