/* ═══════════════════════════════════════════════════════
   IVORY TECH SOLUTIONS — Script
   Editorial Noir × AI-Powered × Rich Animations
   ═══════════════════════════════════════════════════════ */

import { dbSaveSession, dbLogActivity, dbSaveLead } from './firebase-service.js';


// ═══════════════════════════════════════════════════════
//  CUSTOM CURSOR INJECTION
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  let follower = document.querySelector('.cursor-follower');
  let dot = document.querySelector('.cursor-dot');
  
  if (!follower) {
    follower = document.createElement('div');
    follower.className = 'cursor-follower';
    document.body.appendChild(follower);
  }
  if (!dot) {
    dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);
  }

  document.addEventListener('mousemove', (e) => {
    follower.style.left = e.clientX + 'px';
    follower.style.top = e.clientY + 'px';
    dot.style.left = e.clientX + 'px';
    dot.style.top = e.clientY + 'px';
  });

  const interactiveElements = 'a, button, .service-card, .portfolio-item, .website-card, .menu-toggle, .add-to-cart-btn';
  
  // Attach hover events once initial load happens
  const attachHoverEvents = () => {
    document.querySelectorAll(interactiveElements).forEach(el => {
      // Avoid attaching multiple times
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = "true";
      
      el.addEventListener('mouseenter', () => {
        follower.classList.add('hovering');
        dot.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        follower.classList.remove('hovering');
        dot.classList.remove('hovering');
      });
    });
  };

  attachHoverEvents();
  // Optional: Run again if elements are injected dynamically later
  setTimeout(attachHoverEvents, 2000);
});

// ═══════════════════════════════════════════════════════
//  ENTER SPLASH → PAGE LOADER (audio unlocked by click)
// ═══════════════════════════════════════════════════════
(function initEnterSplash() {
  const splash    = document.getElementById('enter-splash');
  const enterBtn  = document.getElementById('enter-btn');
  const loader    = document.getElementById('page-loader');
  const bar       = document.getElementById('loader-progress-bar');
  const pct       = document.getElementById('loader-percentage');
  const bgAudio   = document.getElementById('bg-audio');
  const soundBtn  = document.getElementById('sound-toggle');

  const tagline   = document.getElementById('loader-tagline');

  if (!loader) return;

  if (!splash || !enterBtn) {
    // If no splash exists (e.g., student.html), start loader immediately
    startLoader();
  } else {
    // ── Animate realistic deep universe on the enter splash canvas ──
    const ec = document.getElementById('enter-particles');
    if (ec) {
      const ectx = ec.getContext('2d');
      let width, height, centerZ;
      let eAnimId;

      function resize() {
        const dpr = window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = window.innerHeight;
        ec.width = width * dpr;
        ec.height = height * dpr;
        ec.style.width = width + 'px';
        ec.style.height = height + 'px';
        ectx.setTransform(dpr, 0, 0, dpr, 0, 0); // Scale rendering context for ultra-crisp Retina/4k edge rendering
        centerZ = (width < height ? height : width) * 0.8;
      }
      resize();
      window.addEventListener('resize', resize);
      
      const numStars = 1400; // Increased density for deeper realism
      const stars = [];
      const colors = ['255, 255, 255', '210, 235, 255', '245, 250, 255', '255, 240, 220']; // White, Ice Blue, Bright White, Warm Gold
      for(let i=0; i<numStars; i++) {
          stars.push({
              x: Math.random() * width * 2 - width,
              y: Math.random() * height * 2 - height,
              z: Math.random() * centerZ,
              o: Math.random() * 0.8 + 0.2,
              size: Math.random() * 1.2 + 0.3,
              color: colors[Math.floor(Math.random() * colors.length)],
              hasGlow: Math.random() > 0.85 // 15% of stars are massive/glowing properly
          });
      }

      let speed = 2.0; // Warp speed
      
      let mx = width / 2;
      let my = height / 2;
      document.addEventListener('mousemove', e => { 
        mx = e.clientX; 
        my = e.clientY; 
      });

      function drawEnterUniverse() {
        // Deep space tail effect
        ectx.fillStyle = 'rgba(3, 3, 5, 0.4)';
        ectx.fillRect(0, 0, width, height);
        
        const cx = width / 2;
        const cy = height / 2;
        
        // Mouse drift rotation disabled (constant camera)
        const rotX = 0;
        const rotY = 0;
        const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
        const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

        stars.forEach(star => {
          star.z -= speed;
          if (star.z <= 0) {
              star.z = centerZ;
              star.x = Math.random() * width * 2 - width;
              star.y = Math.random() * height * 2 - height;
          }

          // 3D Rotation
          let tempY = star.y * cosX - star.z * sinX;
          let tempZ = star.y * sinX + star.z * cosX;
          let tempX = star.x * cosY + tempZ * sinY;
          tempZ = -star.x * sinY + tempZ * cosY;
          
          star.x = tempX;
          star.y = tempY;

          // Perspective Projection
          const scale = centerZ / star.z;
          const px = cx + star.x * scale;
          const py = cy + star.y * scale;
          // Dynamically scale but limit maximum sharpness point
          const size = Math.max(0.1, star.size * (1 - star.z / centerZ) * 2.2);

          if (px >= 0 && px <= width && py >= 0 && py <= height) {
              const depthAlpha = 1 - (star.z / centerZ);
              // Subtler fade-in avoids pop-in
              const op = Math.min(1, depthAlpha * 2.5) * star.o;
              
              // Draw Outer Photorealistic Halo (Scatter)
              if (size > 0.8 && star.hasGlow) {
                  ectx.beginPath();
                  ectx.arc(px, py, size * 4, 0, Math.PI * 2);
                  ectx.fillStyle = `rgba(${star.color}, ${op * 0.15})`;
                  ectx.fill();
              }

              // Draw Inner Dense Core
              ectx.beginPath();
              ectx.arc(px, py, size, 0, Math.PI * 2);
              ectx.fillStyle = `rgba(${star.color}, ${op})`;
              ectx.fill();
          }
        });
        eAnimId = requestAnimationFrame(drawEnterUniverse);
      }
      drawEnterUniverse();
    }

    // ── Enter button click → user gesture → unlock audio ──
    enterBtn.addEventListener('click', () => {
      // 1. Pre-load audio now (user gesture context)
      if (bgAudio) {
        bgAudio.volume = 0.4;
        bgAudio.load(); // prime it
      }

      // 2. Dismiss splash
      splash.classList.add('hidden');
      setTimeout(() => { splash.style.display = 'none'; }, 750);

      // 3. Start the page loader
      startLoader();
    });
  }

  // ── The actual loader logic ──
  function startLoader() {
    document.body.classList.add('loader-active');
    const canvas = document.getElementById('loader-particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;

    const pts = [];
    for (let i = 0; i < 40; i++) {
      pts.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height,
        size: Math.random()*2+0.5, sx: (Math.random()-0.5)*0.5, sy: (Math.random()-0.5)*0.5,
        op: Math.random()*0.5+0.1 });
    }
    let loaderAnimId;
    function drawLoaderParticles() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pts.forEach(p => {
        p.x+=p.sx; p.y+=p.sy;
        if(p.x<0||p.x>canvas.width) p.sx*=-1;
        if(p.y<0||p.y>canvas.height) p.sy*=-1;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,255,${p.op})`; ctx.fill();
      });
      for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
        const d=Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);
        if(d<100){ctx.beginPath();ctx.strokeStyle=`rgba(255,255,255,${0.05*(1-d/100)})`;ctx.lineWidth=0.5;ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke();}
      }
      loaderAnimId = requestAnimationFrame(drawLoaderParticles);
    }
    drawLoaderParticles();

    // ── Fun Facts Logic ──
    const facts = [
      "AI-Powered Digital Excellence",
      "Fact: Our AI drinks more digital coffee than our developers.",
      "Fact: 99% logic, 1% pure creative magic.",
      "Fact: We don't just think outside the box, we redesigned it.",
      "Fact: Building digital experiences faster than you can say 'ROI'.",
      "Fact: Where data meets design, and sparks fly."
    ];
    let factIndex = 0;
    if (tagline) tagline.style.transition = 'opacity 0.3s ease';
    
    // Initial 8s loader, maybe change fact every 2s (~4 facts shown)
    const factInterval = setInterval(() => {
      factIndex = (factIndex + 1) % facts.length;
      if (tagline) {
        tagline.style.opacity = 0;
        setTimeout(() => {
          tagline.textContent = facts[factIndex];
          tagline.style.opacity = 1;
        }, 300);
      }
    }, 2000);

    // Progress animation over 8 seconds
    const duration = 8000;
    const start = performance.now();
    function updateProgress(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const percent = Math.floor(eased * 100);
      if (bar) bar.style.width = percent + '%';
      if (pct) pct.textContent = percent + '%';
      if (progress < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        // Done — reveal the site
        clearInterval(factInterval);
        setTimeout(() => {
          loader.classList.add('loader-hidden');
          document.body.classList.remove('loader-active');
          cancelAnimationFrame(loaderAnimId);

          // Always start at the top of the page on initial entry
          if (!sessionStorage.getItem('ivory_site_entered')) {
             window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
             sessionStorage.setItem('ivory_site_entered', 'true');
          }

          // ── AUTOPLAY AUDIO (user gesture already given at "Enter") ──
          if (bgAudio) {
            const savedTime = sessionStorage.getItem('ivory_audio_time');
            if (savedTime) bgAudio.currentTime = parseFloat(savedTime);
            
            bgAudio.play().then(() => {
              if (soundBtn) soundBtn.classList.add('playing');
              sessionStorage.setItem('ivory_audio_playing', 'true');
            }).catch(() => {
              if (soundBtn) soundBtn.classList.remove('playing');
              sessionStorage.setItem('ivory_audio_playing', 'false');
            });
          }
          if (soundBtn) soundBtn.classList.add('visible');

          schedulLeadPopup();
        }, 300);
      }
    }
    requestAnimationFrame(updateProgress);
  }
})();


// ═══════════════════════════════════════════════════════
//  LEAD CATCHER POPUP (10s after page load)
// ═══════════════════════════════════════════════════════
function schedulLeadPopup() {
  if (sessionStorage.getItem('ivory_popup_shown')) return;
  setTimeout(() => {
    const overlay = document.getElementById('lead-popup-overlay');
    if (overlay) overlay.classList.add('active');
    sessionStorage.setItem('ivory_popup_shown', 'true');
  }, 10000);
}

(function initPopup() {
  const overlay = document.getElementById('lead-popup-overlay');
  const closeBtn = document.getElementById('lead-popup-close');
  const form = document.getElementById('lead-popup-form');
  if (!overlay) return;

  closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('popup-name').value;
    const email = document.getElementById('popup-email').value;
    // Save lead
    const leads = JSON.parse(localStorage.getItem('ivory_leads') || '[]');
    leads.unshift({ id:'lead-'+Date.now(), name, email, type:'Lead', date:new Date().toLocaleDateString(), device:window.innerWidth<768?'Mobile':'Desktop', source:'AI Audit Popup' });
    localStorage.setItem('ivory_leads', JSON.stringify(leads));
    // Success state
    form.innerHTML = '<div style="text-align:center;padding:2rem 0;"><div style="font-size:48px;margin-bottom:1rem;">✓</div><p style="font-size:16px;font-weight:700;">Audit Request Received!</p><p style="color:#888;margin-top:0.5rem;font-size:14px;">We\'ll be in touch within 24 hours.</p></div>';
    setTimeout(() => overlay.classList.remove('active'), 3000);
  });
})();

// ═══════════════════════════════════════════════════════
//  CLICK / TAP RIPPLE EFFECTS
// ═══════════════════════════════════════════════════════
(function initClickRipple() {
  const canvas = document.getElementById('click-ripple-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let ripples = [];

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  function createRipple(x, y) {
    // Ring
    ripples.push({ type:'ring', x, y, r:0, maxR:60, op:0.6, speed:3 });
    // Particles
    for (let i=0; i<8; i++) {
      const angle = (Math.PI*2/8)*i + Math.random()*0.3;
      const speed = 2+Math.random()*3;
      ripples.push({ type:'particle', x, y, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed, r:1.5+Math.random(), op:0.7, life:30 });
    }
  }

  document.addEventListener('click', (e) => createRipple(e.clientX, e.clientY));
  document.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    createRipple(t.clientX, t.clientY);
  }, {passive:true});

  function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ripples = ripples.filter(r => {
      if (r.type==='ring') {
        r.r += r.speed; r.op -= 0.02;
        if(r.op<=0) return false;
        ctx.beginPath(); ctx.arc(r.x,r.y,r.r,0,Math.PI*2);
        ctx.strokeStyle=`rgba(255,255,255,${r.op})`; ctx.lineWidth=1.5; ctx.stroke();
        return true;
      } else {
        r.x+=r.vx; r.y+=r.vy; r.life--; r.op-=0.025;
        if(r.life<=0||r.op<=0) return false;
        ctx.beginPath(); ctx.arc(r.x,r.y,r.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,255,${r.op})`; ctx.fill();
        return true;
      }
    });
    requestAnimationFrame(animate);
  }
  animate();
})();

// ═══════════════════════════════════════════════════════
//  PORTFOLIO DATA (localStorage sync)
// ═══════════════════════════════════════════════════════
function initPortfolio() {
  const wrapper = document.getElementById('portfolio-swiper-wrapper');
  if (!wrapper) return;

  // Seed default data if not exists
  if (!localStorage.getItem('ivory_portfolio')) {
    const defaults = [
      { id:'p1', title:'Noir Cosmetics', category:'Full-Stack Rebranding & E-Commerce', img:'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=1000&auto=format&fit=crop', link:'#' },
      { id:'p2', title:'Vertex SaaS', category:'UI/UX Design & Dashboard App', img:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop', link:'#' },
      { id:'p3', title:'Urban Arch', category:'Global SEO & Influencer Campaign', img:'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop', link:'#' },
      { id:'p4', title:'Axiom Tech', category:'Social Media Scaling & Content Strategy', img:'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop', link:'#' }
    ];
    localStorage.setItem('ivory_portfolio', JSON.stringify(defaults));
  }

  const items = JSON.parse(localStorage.getItem('ivory_portfolio') || '[]');
  wrapper.innerHTML = '';
  items.forEach(item => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide portfolio-item';
    slide.innerHTML = `
      <img src="${item.img}" alt="${item.title}" loading="lazy">
      <div class="portfolio-content">
        <h3>${item.title}</h3>
        <span>${item.category}</span>
      </div>
      <a href="${item.link}" class="portfolio-link" target="_blank">View Portfolio</a>
    `;
    wrapper.appendChild(slide);
  });
}
initPortfolio();

// ═══════════════════════════════════════════════════════
//  WEBSITE SHOWCASE (localStorage sync)
// ═══════════════════════════════════════════════════════
function initWebsites() {
  const grid = document.getElementById('websites-grid');
  if (!grid) return;

  if (!localStorage.getItem('ivory_websites')) {
    const defaults = [
      { id:'w1', title:'Noir Cosmetics Store', desc:'Premium e-commerce platform with AI-powered product recommendations.', img:'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop', url:'#' },
      { id:'w2', title:'Vertex Analytics Dashboard', desc:'Real-time SaaS dashboard with interactive data visualizations.', img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop', url:'#' },
      { id:'w3', title:'Urban Arch Portfolio', desc:'Architectural firm showcase with immersive 3D gallery experience.', img:'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop', url:'#' }
    ];
    localStorage.setItem('ivory_websites', JSON.stringify(defaults));
  }

  const sites = JSON.parse(localStorage.getItem('ivory_websites') || '[]');
  grid.innerHTML = '';
  if (sites.length === 0) {
    grid.innerHTML = '<div class="websites-empty">No websites to display yet. Add them from the admin panel.</div>';
    return;
  }
  sites.forEach(site => {
    const card = document.createElement('div');
    card.className = 'website-card';
    card.setAttribute('data-tilt', 'true');
    card.innerHTML = `
      <div style="overflow:hidden;height:220px;position:relative;">
        <img src="${site.img}" alt="${site.title}" class="website-card-img" loading="lazy">
        <div class="website-card-overlay"></div>
      </div>
      <div class="website-card-body">
        <h3 class="website-card-title">${site.title}</h3>
        <p class="website-card-desc">${site.desc}</p>
        <a href="${site.url}" class="website-card-link" target="_blank">Visit Site
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17l9.2-9.2M17 17V7.8H7.8"/></svg>
        </a>
      </div>
    `;
    grid.appendChild(card);
  });
}
initWebsites();

// ═══════════════════════════════════════════════════════
//  DATABASE SYNC (Services from localStorage)
// ═══════════════════════════════════════════════════════
function initDatabaseAndRenderServices() {
  const servicesGrid = document.querySelector('.services-grid');
  if (!servicesGrid) return;

  // Always ensure add-to-cart buttons exist on all service cards
  const allCards = servicesGrid.querySelectorAll('.service-card');
  allCards.forEach((card, index) => {
    if (card.querySelector('.add-to-cart-btn')) return;
    
    const titleEl = card.querySelector('.service-title');
    const title = titleEl ? titleEl.textContent.trim() : 'Service ' + (index + 1);
    const serviceId = title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 15);
    
    const btn = document.createElement('button');
    btn.className = 'add-to-cart-btn';
    btn.setAttribute('data-service', title);
    btn.setAttribute('data-id', serviceId);
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Add to Requirements';
    card.appendChild(btn);
  });

  // Also save to localStorage for admin panel sync
  if (!localStorage.getItem('ivory_services')) {
    const initialData = Array.from(allCards).map((card, index) => ({
      id: 'svc-' + Date.now() + '-' + index,
      title: card.querySelector('.service-title')?.textContent || 'Service ' + (index + 1),
      desc: card.querySelector('.service-desc')?.textContent || '',
      tags: Array.from(card.querySelectorAll('li')).map(li => li.textContent).join(', '),
      status: 'Active',
      originalSvg: card.querySelector('.service-icon')?.innerHTML || '',
      imgs: []
    }));
    if (initialData.length > 0) localStorage.setItem('ivory_services', JSON.stringify(initialData));
  }
}

// ═══════════════════════════════════════════════════════
//  LENIS SMOOTH SCROLLING (Integrated with GSAP Ticker)
// ═══════════════════════════════════════════════════════
const lenis = new Lenis({ 
  duration: 1.2, 
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
  direction: 'vertical', 
  gestureDirection: 'vertical', 
  smooth: true, 
  mouseMultiplier: 1, 
  smoothTouch: false, 
  touchMultiplier: 2, 
  infinite: false 
});

gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ═══════════════════════════════════════════════════════
//  CUSTOM CURSOR
// ═══════════════════════════════════════════════════════
const cursorFollower = document.getElementById('cursor-follower');
const cursorDot = document.getElementById('cursor-dot');
let mouseX=0, mouseY=0, followerX=0, followerY=0;
const interactiveOrb = document.querySelector('.orb-3');
let orbX=0, orbY=0;

if (cursorFollower && cursorDot && window.matchMedia('(min-width:1025px)').matches) {
  document.addEventListener('mousemove', (e) => { mouseX=e.clientX; mouseY=e.clientY; cursorDot.style.left=mouseX+'px'; cursorDot.style.top=mouseY+'px'; });
  function animateCursor() {
    followerX+=(mouseX-followerX)*0.12; followerY+=(mouseY-followerY)*0.12;
    cursorFollower.style.left=followerX+'px'; cursorFollower.style.top=followerY+'px';
    if(interactiveOrb){orbX+=(mouseX-orbX)*0.05;orbY+=(mouseY-orbY)*0.05;interactiveOrb.style.transform=`translate(${orbX*0.3}px,${orbY*0.3}px)`;}
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
  const hoverTargets = document.querySelectorAll('a, button, .service-card, .portfolio-item, .testimonial-card, .process-step-enhanced, .website-card, [data-magnetic]');
  hoverTargets.forEach(t => {
    t.addEventListener('mouseenter', () => { cursorFollower.classList.add('hovering'); cursorDot.classList.add('hovering'); });
    t.addEventListener('mouseleave', () => { cursorFollower.classList.remove('hovering'); cursorDot.classList.remove('hovering'); });
  });
}

// ═══════════════════════════════════════════════════════
//  MAGNETIC BUTTONS
// ═══════════════════════════════════════════════════════
if (window.matchMedia('(min-width:1025px)').matches) {
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', (e) => { const r=el.getBoundingClientRect(); el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*0.2}px,${(e.clientY-r.top-r.height/2)*0.2}px)`; });
    el.addEventListener('mouseleave', () => { el.style.transform='translate(0,0)'; el.style.transition='transform 0.4s cubic-bezier(0.34,1.56,0.64,1)'; setTimeout(()=>{el.style.transition='';},400); });
  });
}

// ═══════════════════════════════════════════════════════
//  HERO PARTICLES
// ═══════════════════════════════════════════════════════
const heroCanvas = document.getElementById('hero-particles');
if (heroCanvas) {
  const ctx = heroCanvas.getContext('2d');
  let particles = [];
  function resizeCanvas() { heroCanvas.width=window.innerWidth; heroCanvas.height=window.innerHeight; }
  resizeCanvas(); window.addEventListener('resize', resizeCanvas);
  class Particle {
    constructor() { this.reset(); }
    reset() { this.x=Math.random()*heroCanvas.width; this.y=Math.random()*heroCanvas.height; this.size=Math.random()*1.5+0.5; this.speedX=(Math.random()-0.5)*0.3; this.speedY=(Math.random()-0.5)*0.3; this.opacity=Math.random()*0.4+0.1; this.pulse=Math.random()*Math.PI*2; }
    update() { this.x+=this.speedX; this.y+=this.speedY; this.pulse+=0.02; if(this.x<0||this.x>heroCanvas.width||this.y<0||this.y>heroCanvas.height) this.reset(); }
    draw() { const o=this.opacity+Math.sin(this.pulse)*0.15; ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,Math.PI*2); ctx.fillStyle=`rgba(255,255,255,${Math.max(0,o)})`; ctx.fill(); }
  }
  for(let i=0;i<60;i++) particles.push(new Particle());
  function drawConnections(){for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){const d=Math.hypot(particles[i].x-particles[j].x,particles[i].y-particles[j].y);if(d<120){ctx.beginPath();ctx.strokeStyle=`rgba(255,255,255,${0.03*(1-d/120)})`;ctx.lineWidth=0.5;ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.stroke();}}}
  function animateParticles(){ctx.clearRect(0,0,heroCanvas.width,heroCanvas.height);particles.forEach(p=>{p.update();p.draw();});drawConnections();requestAnimationFrame(animateParticles);}
  animateParticles();
}

// ═══════════════════════════════════════════════════════
//  DARK UNIVERSE WITH SHOOTING STARS
// ═══════════════════════════════════════════════════════
(function initUniverse() {
  const canvas = document.getElementById('universe-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Stars
  const stars = [];
  const STAR_COUNT = 200;
  
  class Star {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.5;
      this.opacity = Math.random() * 0.8 + 0.2;
      this.twinkleSpeed = Math.random() * 0.02 + 0.01;
      this.twinklePhase = Math.random() * Math.PI * 2;
    }
    update() {
      this.twinklePhase += this.twinkleSpeed;
    }
    draw() {
      const o = this.opacity * (0.5 + 0.5 * Math.sin(this.twinklePhase));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${o})`;
      ctx.fill();
    }
  }
  
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(new Star());
  }

  // Shooting Stars
  const shootingStars = [];
  
  class ShootingStar {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height * 0.5;
      const angle = Math.PI / 4 + Math.random() * Math.PI / 6;
      this.speed = 8 + Math.random() * 8;
      this.vx = Math.cos(angle) * this.speed;
      this.vy = Math.sin(angle) * this.speed;
      this.length = 50 + Math.random() * 100;
      this.opacity = 1;
      this.active = true;
    }
    update() {
      if (!this.active) return;
      this.x += this.vx;
      this.y += this.vy;
      this.opacity -= 0.015;
      if (this.opacity <= 0 || this.x > canvas.width || this.y > canvas.height) {
        this.active = false;
      }
    }
    draw() {
      if (!this.active) return;
      const tailX = this.x - this.vx * 3;
      const tailY = this.y - this.vy * 3;
      const gradient = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(1, `rgba(255, 255, 255, ${this.opacity})`);
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
      // Head glow
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.fill();
    }
  }

  let lastShootingStar = 0;
  const SHOOTING_STAR_INTERVAL = 3000 + Math.random() * 5000;

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    stars.forEach(star => {
      star.update();
      star.draw();
    });
    
    // Spawn shooting stars
    const now = Date.now();
    if (now - lastShootingStar > SHOOTING_STAR_INTERVAL) {
      shootingStars.push(new ShootingStar());
      lastShootingStar = now;
    }
    
    // Update and draw shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      shootingStars[i].update();
      shootingStars[i].draw();
      if (!shootingStars[i].active) {
        shootingStars.splice(i, 1);
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  animate();
})();

// ═══════════════════════════════════════════════════════
//  CART / REQUIREMENTS SYSTEM
// ═══════════════════════════════════════════════════════
const CART_KEY = 'ivory_requirements';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

function updateCartUI() {
  const cartBadge = document.getElementById('cart-badge');
  const cartCount = document.getElementById('cart-count');
  const cartBody = document.getElementById('cart-body');
  const cartEmpty = document.getElementById('cart-empty');
  if (!cartBadge || !cartBody) return;
  
  const count = cart.length;
  cartBadge.textContent = count;
  if (cartCount) cartCount.textContent = count;
  
  if (count === 0) {
    cartBadge.classList.add('zero');
    if (cartEmpty) cartEmpty.style.display = 'block';
  } else {
    cartBadge.classList.remove('zero');
    if (cartEmpty) cartEmpty.style.display = 'none';
  }
  
  // Render cart items
  const items = cartBody.querySelectorAll('.cart-item');
  items.forEach(item => item.remove());
  
  cart.forEach((service, index) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <span class="cart-item-name">${service}</span>
      </div>
      <button class="cart-item-remove" data-index="${index}">&times;</button>
    `;
    cartBody.insertBefore(itemEl, cartEmpty);
  });
  
  // Update add-to-cart buttons state
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    if (cart.includes(btn.dataset.service)) {
      btn.classList.add('added');
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Added`;
    }
  });
}

function openCart() {
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  if (cartDrawer) cartDrawer.classList.add('open');
  if (cartOverlay) cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  if (cartDrawer) cartDrawer.classList.remove('open');
  if (cartOverlay) cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

function addToCart(service) {
  if (!cart.includes(service)) {
    cart.push(service);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartUI();
    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge && typeof gsap !== 'undefined') {
      gsap.fromTo(cartBadge, { scale: 1.5 }, { scale: 1, duration: 0.4, ease: 'back.out(1.7)' });
    }
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

function sendToWhatsApp() {
  if (cart.length === 0) {
    alert('Please add at least one service to your requirements.');
    return;
  }
  const phone = '918080531468';
  const servicesList = cart.map(s => `• ${s}`).join('%0A');
  const message = `Hello! I'm interested in the following services from Ivory Tech Solutions:%0A%0A${servicesList}%0A%0APlease provide more information. Thank you!`;
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}

function initSyllabusAccordion() {
  const headers = document.querySelectorAll('.syllabus-accordion-header');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const parent = header.parentElement;
      const isOpen = parent.classList.contains('active');
      
      // Close all others
      document.querySelectorAll('.syllabus-accordion').forEach(acc => acc.classList.remove('active'));
      
      if (!isOpen) {
        parent.classList.add('active');
      }
    });
  });
}
function initCartEvents() {
  const cartToggle = document.getElementById('cart-toggle');
  const cartClose = document.getElementById('cart-close');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartCheckout = document.getElementById('cart-checkout');
  const cartBody = document.getElementById('cart-body');
  
  cartToggle?.addEventListener('click', openCart);
  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);
  cartCheckout?.addEventListener('click', sendToWhatsApp);
  
  cartBody?.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.cart-item-remove');
    if (removeBtn) {
      removeFromCart(parseInt(removeBtn.dataset.index));
    }
  });
  
  // Add-to-cart buttons - use document for delegation
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart-btn');
    if (!btn) return;
    
    const service = btn.dataset.service;
    
    if (cart.includes(service)) {
      openCart();
    } else {
      cart.push(service);
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      btn.classList.add('added');
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Added';
      updateCartUI();
      openCart();
    }
  });
}

// ═══════════════════════════════════════════════════════
//  TYPING ANIMATION
// ═══════════════════════════════════════════════════════
const typingWords = ['MARKETING & DESIGN','WEB DEVELOPMENT','APP DESIGNING','BRAND STRATEGY','SOCIAL MEDIA','UI/UX DESIGN','DIGITAL ADS','CONTENT CREATION'];
const typingTextEl = document.getElementById('typing-text');
let wordIndex=0, charIndex=0, isDeleting=false, typingSpeed=100;
function typeEffect() {
  const w=typingWords[wordIndex];
  if(!isDeleting){typingTextEl.textContent=w.substring(0,charIndex+1);charIndex++;typingSpeed=80+Math.random()*60;if(charIndex===w.length){typingSpeed=2000;isDeleting=true;}}
  else{typingTextEl.textContent=w.substring(0,charIndex-1);charIndex--;typingSpeed=40;if(charIndex===0){isDeleting=false;wordIndex=(wordIndex+1)%typingWords.length;typingSpeed=500;}}
  setTimeout(typeEffect,typingSpeed);
}

// ═══════════════════════════════════════════════════════
//  DOM CONTENT LOADED  
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

  // ── Initialize Services & Cart ──
  initDatabaseAndRenderServices();
  updateCartUI();
  initCartEvents();
  initSyllabusAccordion();

  // ── Sound toggle button (pause / resume) ──
  const _soundBtn = document.getElementById('sound-toggle');
  const _bgAudio  = document.getElementById('bg-audio');
  
  if (_bgAudio) {
    _bgAudio.volume = 0.5;
    // Restore audio stat from sessionStorage
    const wasPlaying = sessionStorage.getItem('ivory_audio_playing');
    const savedTime = sessionStorage.getItem('ivory_audio_time');
    
    if (wasPlaying === 'true') {
      if (savedTime) _bgAudio.currentTime = parseFloat(savedTime);
      _bgAudio.play().then(() => {
        if (_soundBtn) _soundBtn.classList.add('playing');
      }).catch(e => console.warn('Autoplay blocked crossing to new page'));
    }

    // Continuously save exact timestamp
    setInterval(() => {
      if (!_bgAudio.paused) {
        sessionStorage.setItem('ivory_audio_time', _bgAudio.currentTime);
      }
    }, 250);
  }

  if (_soundBtn && _bgAudio) {
    _soundBtn.addEventListener('click', () => {
      if (_bgAudio.paused) {
        _bgAudio.play().then(() => {
          _soundBtn.classList.add('playing');
          sessionStorage.setItem('ivory_audio_playing', 'true');
        }).catch(() => {});
      } else {
        _bgAudio.pause();
        _soundBtn.classList.remove('playing');
        sessionStorage.setItem('ivory_audio_playing', 'false');
      }
    });
  }


  // ── HERO ENTRANCE ──
  const heroTimeline = gsap.timeline({ delay: 0.3 });
  const charWrap = document.querySelector('.char-wrap');
  if (charWrap) {
    const text = charWrap.getAttribute('data-text');
    charWrap.textContent = '';
    [...text].forEach(char => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block'; span.style.opacity = '0';
      span.style.transform = 'translateY(100%) rotateX(-90deg)';
      span.className = 'hero-char';
      charWrap.appendChild(span);
    });
    charWrap.style.opacity = '1'; charWrap.style.transform = 'none';
    heroTimeline.to('.hero-char', { y:0, rotateX:0, opacity:1, duration:0.8, stagger:0.04, ease:'power4.out' });
  }
  heroTimeline.call(() => { typeEffect(); }, null, '+=0.3');
  if (document.querySelector('.hero-subtext-container')) {
    heroTimeline.to('.hero-subtext-container', { y:0, opacity:1, duration:1.2, ease:'power4.out' }, '-=0.6');
  }


  // ── AI ACCURACY RING ANIMATION ──
  const aiRing = document.querySelector('.ai-ring-progress');
  const aiNumber = document.querySelector('.ai-ring-number');
  if (aiRing && aiNumber) {
    const circumference = 2 * Math.PI * 54; // r=54
    ScrollTrigger.create({
      trigger: '.hero-ai-badge', start: 'top 90%', once: true,
      onEnter: () => {
        aiRing.style.strokeDashoffset = circumference * (1 - 0.99);
        gsap.to({ val: 0 }, { val: 99, duration: 2, ease: 'power2.out',
          onUpdate: function() { aiNumber.textContent = Math.floor(this.targets()[0].val); }
        });
      }
    });
  }

  // ── NAVBAR (hidden until scroll) ──
  const navbar = document.getElementById('navbar');
  if (navbar) {
    let navRevealed = false;
    ScrollTrigger.create({
      start: 'top -10',
      onUpdate: (self) => {
        // Reveal navbar on first scroll
        if (window.scrollY > 10 && !navRevealed) {
          navbar.classList.remove('nav-hidden');
          navbar.classList.add('nav-visible');
          navRevealed = true;
        }
        // Scrolled bg
        if (self.direction === 1 && window.scrollY > 80) navbar.classList.add('scrolled');
        else if (window.scrollY <= 80) navbar.classList.remove('scrolled');
        // Hide when scrolled back to very top
        if (window.scrollY <= 10) {
          navbar.classList.add('nav-hidden');
          navbar.classList.remove('nav-visible');
          navRevealed = false;
        }
      }
    });
  }

  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => { menuToggle.classList.toggle('active'); mobileNav.classList.toggle('open'); document.body.style.overflow=mobileNav.classList.contains('open')?'hidden':''; });
    mobileNav.querySelectorAll('.mobile-nav-link').forEach(l => l.addEventListener('click', () => { menuToggle.classList.remove('active'); mobileNav.classList.remove('open'); document.body.style.overflow=''; }));
  }

  // ── SCROLL REVEALS ──
  gsap.utils.toArray('[data-reveal-tag]').forEach(el => { ScrollTrigger.create({trigger:el,start:'top 90%',once:true,onEnter:()=>el.classList.add('revealed')}); });
  gsap.utils.toArray('[data-reveal-title]').forEach(el => { ScrollTrigger.create({trigger:el,start:'top 88%',once:true,onEnter:()=>el.classList.add('revealed')}); });
  gsap.utils.toArray('[data-reveal-fade]').forEach(el => { ScrollTrigger.create({trigger:el,start:'top 88%',once:true,onEnter:()=>el.classList.add('revealed')}); });

  // ── STATS COUNTER ──
  document.querySelectorAll('.stat-number').forEach(num => {
    const target = parseInt(num.getAttribute('data-target'));
    ScrollTrigger.create({ trigger:num, start:'top 85%', once:true,
      onEnter:()=>{ gsap.to({val:0},{val:target,duration:2.5,ease:'power2.out',onUpdate:function(){num.textContent=Math.floor(this.targets()[0].val);}}); }
    });
  });

  // ── ABOUT SECTION COUNTERS ──
  document.querySelectorAll('.about-big-num').forEach(num => {
    const target = parseInt(num.getAttribute('data-target'));
    ScrollTrigger.create({ trigger: num, start: 'top 88%', once: true,
      onEnter: () => { gsap.to({val:0},{val:target,duration:2,ease:'power2.out',onUpdate:function(){num.textContent=Math.floor(this.targets()[0].val);}}); }
    });
  });
  gsap.utils.toArray('.about-value-card').forEach((card, i) => {
    gsap.from(card, { scrollTrigger:{trigger:card,start:'top 90%',once:true}, y:30, opacity:0, duration:0.8, delay:i*0.12, ease:'power3.out' });
  });


  // ── SERVICE CARDS ──
  gsap.utils.toArray('.service-card').forEach((card,i) => {
    gsap.from(card, { scrollTrigger:{trigger:card,start:'top 92%',once:true}, y:60, opacity:0, duration:0.9, delay:(i%2)*0.2, ease:'power3.out' });
  });
  if (window.matchMedia('(min-width:1025px)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r=card.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-0.5; const y=(e.clientY-r.top)/r.height-0.5;
        card.style.transform=`perspective(1000px) rotateX(${y*-5}deg) rotateY(${x*5}deg) translateZ(10px)`;
        card.style.setProperty('--glow-x',((e.clientX-r.left)/r.width*100)+'%');
        card.style.setProperty('--glow-y',((e.clientY-r.top)/r.height*100)+'%');
      });
      card.addEventListener('mouseleave', () => { card.style.transform='perspective(1000px) rotateX(0) rotateY(0) translateZ(0)'; card.style.transition='transform 0.5s cubic-bezier(0.34,1.56,0.64,1)'; setTimeout(()=>{card.style.transition='';},500); });
    });
  }

  // ── PROCESS TIMELINE (Enhanced) ──
  const timelineFill = document.getElementById('timeline-line-fill');
  gsap.utils.toArray('.process-step-enhanced').forEach((step,i) => {
    ScrollTrigger.create({ trigger:step, start:'top 85%', once:true,
      onEnter:() => { step.classList.add('revealed'); step.style.transitionDelay = (i*0.15)+'s'; }
    });
  });
  if (timelineFill) {
    ScrollTrigger.create({
      trigger:'.process-timeline', start:'top 80%', end:'bottom 20%', scrub:true,
      onUpdate:(self)=>{ timelineFill.style.height = (self.progress*100)+'%'; }
    });
  }

  // ── PORTFOLIO SWIPER ──
  if (document.querySelector('.portfolio-swiper')) {
    const swiper = new Swiper('.portfolio-swiper', {
      effect:'coverflow', grabCursor:true, centeredSlides:true, slidesPerView:'auto', loop:false,
      coverflowEffect:{rotate:30,stretch:0,depth:250,modifier:1,slideShadows:true},
      autoplay:{delay:3000,disableOnInteraction:false},
      pagination:{el:'.swiper-pagination',clickable:true},
      navigation:{nextEl:'.swiper-button-next',prevEl:'.swiper-button-prev'}
    });
    gsap.from('.portfolio-swiper', { scrollTrigger:{trigger:'.portfolio',start:'top 85%',once:true}, y:60, opacity:0, duration:1.2, ease:'power3.out' });
  }

  // ── WEBSITE CARDS ──
  gsap.utils.toArray('.website-card').forEach((card,i) => {
    gsap.from(card, { scrollTrigger:{trigger:card,start:'top 90%',once:true}, y:50, opacity:0, scale:0.95, duration:0.9, delay:i*0.15, ease:'power3.out' });
  });

  // ── TESTIMONIALS ──
  gsap.utils.toArray('.testimonial-card').forEach((card,i) => {
    gsap.from(card, { scrollTrigger:{trigger:card,start:'top 90%',once:true}, y:40, opacity:0, scale:0.96, duration:0.9, delay:i*0.15, ease:'power3.out' });
  });

  // ── CTA ──
  if (document.querySelector('.contact-cta') && document.querySelector('.cta-inner')) {
    gsap.from('.cta-inner', { scrollTrigger:{trigger:'.contact-cta',start:'top 80%',once:true}, y:60, opacity:0, scale:0.97, duration:1.2, ease:'power3.out' });
  }


  // ── MARQUEE ──
  const marqueeTrack = document.getElementById('marquee-track');
  if(marqueeTrack) ScrollTrigger.create({trigger:'.marquee-container',start:'top bottom',end:'bottom top',scrub:1,onUpdate:(self)=>{marqueeTrack.style.animationDuration=(25/(1+self.progress*2))+'s';}});

  // ── SCROLL INDICATOR ──
  const scrollIndicator = document.getElementById('scroll-indicator');
  if(scrollIndicator) ScrollTrigger.create({start:'top -200',onUpdate:()=>{if(window.scrollY>200){scrollIndicator.style.opacity='0';scrollIndicator.style.transform='translateY(10px)';}else{scrollIndicator.style.opacity='';scrollIndicator.style.transform='';}}});

  // ── FOOTER ──
  if (document.querySelector('.site-footer') && document.querySelector('.footer-inner')) {
    gsap.from('.footer-inner', { scrollTrigger:{trigger:'.site-footer',start:'top 90%',once:true}, y:30, opacity:0, duration:1, ease:'power3.out' });
  }


  // ── CONTACT FORM ──
  const contactForm = document.getElementById('contact-form');
  if(contactForm) {
    gsap.from('.contact-input, .contact-btn', { scrollTrigger:{trigger:contactForm,start:'top 85%',once:true}, y:20, opacity:0, duration:0.7, stagger:0.1, ease:'power3.out' });
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('contact-submit');
      try {
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        const leadObj = { id:'lead-'+Date.now(), date:new Date().toLocaleDateString(), device:window.innerWidth<768?'Mobile':'Desktop' };
        inputs.forEach(input => { if(input.type==='text')leadObj.name=input.value; else if(input.type==='email')leadObj.email=input.value; });
        
        // ── Cloud Save (Firebase) ──
        dbSaveLead(leadObj);
        
        // ── Local Fallback ──
        const leads = JSON.parse(localStorage.getItem('ivory_leads')||'[]');
        leads.unshift(leadObj); localStorage.setItem('ivory_leads', JSON.stringify(leads));
      } catch(err) { console.error('Lead capture err', err); }

      gsap.to(btn, { scale:0.95,duration:0.1,yoyo:true,repeat:1,
        onComplete:()=>{ btn.textContent='✓ Sent!'; btn.style.opacity='0.7'; btn.disabled=true;
          setTimeout(()=>{ btn.innerHTML='Send Message <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>'; btn.style.opacity='1'; btn.disabled=false; contactForm.reset(); },2500);
        }
      });
    });
  }

  // ── PARALLAX ──
  gsap.utils.toArray('section').forEach(section => {
    gsap.fromTo(section, {backgroundPositionY:'0%'}, {backgroundPositionY:'20%', scrollTrigger:{trigger:section,start:'top bottom',end:'bottom top',scrub:true}, ease:'none'});
  });

  // ── AMBIENT VIDEO AUTOPLAY ──
  const ambientVideo = document.getElementById('hero-ambient-video');
  if (ambientVideo) {
    ambientVideo.play().catch(() => {
      // Autoplay blocked — try on first interaction
      const playOnce = () => { ambientVideo.play(); document.removeEventListener('click', playOnce); document.removeEventListener('touchstart', playOnce); };
      document.addEventListener('click', playOnce);
      document.addEventListener('touchstart', playOnce);
    });
  }

});

// ═══════════════════════════════════════════════════════
//  USER TRACKING & SESSION SYSTEM
// ═══════════════════════════════════════════════════════
(function initUserTracking() {
  const SESSION_KEY = 'ivory_sessions';
  const ACTIVITY_KEY = 'ivory_session_activity';
  const sessionId = 'sess-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);

  // ── Gather Device Metadata ──
  const ua = navigator.userAgent;
  function getBrowser() {
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Unknown';
  }
  function getOS() {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS')) return 'macOS';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    if (ua.includes('Linux')) return 'Linux';
    return 'Unknown';
  }
  function getDeviceType() {
    if (window.innerWidth <= 768) return 'Mobile';
    if (window.innerWidth <= 1024) return 'Tablet';
    return 'Desktop';
  }

  const sessionData = {
    id: sessionId,
    startTime: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    browser: getBrowser(),
    browserVersion: ua.match(/(?:Chrome|Firefox|Safari|Edg|OPR)\/([\d.]+)/)?.[1] || 'N/A',
    os: getOS(),
    device: getDeviceType(),
    screenRes: window.screen.width + 'x' + window.screen.height,
    viewportSize: window.innerWidth + 'x' + window.innerHeight,
    language: navigator.language || 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
    referrer: document.referrer || 'Direct',
    currentPage: window.location.pathname,
    pageTitle: document.title,
    userAgent: ua,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === '1',
    connectionType: navigator.connection ? navigator.connection.effectiveType : 'Unknown',
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    ip: 'Resolving...',
    city: 'Resolving...',
    region: 'Resolving...',
    country: 'Resolving...',
    isp: 'Resolving...',
    latitude: null,
    longitude: null,
    // Activity tracking
    pagesViewed: [window.location.pathname],
    scrollDepth: 0,
    clickCount: 0,
    timeOnSite: 0,
    isActive: true
  };

  // ── Save session ──
  function saveSession() {
    sessionData.lastActive = new Date().toISOString();
    
    // ── Cloud Save (Firebase) ──
    dbSaveSession(sessionId, sessionData);

    // ── Local Fallback ──
    const sessions = JSON.parse(localStorage.getItem(SESSION_KEY) || '[]');
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx > -1) sessions[idx] = sessionData;
    else sessions.push(sessionData);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessions));
  }

  // ── Save activity event ──
  function logActivity(type, data) {
    const event = {
      sessionId,
      type,
      data,
      timestamp: new Date().toISOString(),
      page: window.location.pathname
    };

    // ── Cloud Save (Firebase) ──
    dbLogActivity(event);

    // ── Local Fallback ──
    const activities = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]');
    activities.push(event);
    if (activities.length > 500) activities.splice(0, activities.length - 500);
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
  }


  // ── IP & Geolocation (free API) ──
  fetch('https://ipapi.co/json/')
    .then(r => r.json())
    .then(data => {
      sessionData.ip = data.ip || 'Unknown';
      sessionData.city = data.city || 'Unknown';
      sessionData.region = data.region || 'Unknown';
      sessionData.country = data.country_name || 'Unknown';
      sessionData.isp = data.org || 'Unknown';
      sessionData.latitude = data.latitude || null;
      sessionData.longitude = data.longitude || null;
      saveSession();
      logActivity('geo_resolved', { ip: data.ip, city: data.city, country: data.country_name });
    })
    .catch(() => {
      sessionData.ip = 'Blocked';
      sessionData.city = 'Unknown';
      saveSession();
    });

  // ── Track Scroll Depth ──
  let maxScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollPct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (scrollPct > maxScroll) {
      maxScroll = scrollPct;
      sessionData.scrollDepth = maxScroll;
    }
  }, { passive: true });

  // ── Track Clicks ──
  document.addEventListener('click', (e) => {
    sessionData.clickCount++;
    const target = e.target.closest('a, button, [data-magnetic], .service-card, .portfolio-item, .website-card');
    if (target) {
      logActivity('click', {
        tag: target.tagName,
        text: (target.textContent || '').substring(0, 50).trim(),
        href: target.href || null,
        class: target.className.substring(0, 60)
      });
    }
  });

  // ── Track Section Views ──
  const observedSections = document.querySelectorAll('section[id]');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;
        logActivity('section_view', { section: sectionId });
        if (!sessionData.pagesViewed.includes('#' + sectionId)) {
          sessionData.pagesViewed.push('#' + sectionId);
        }
      }
    });
  }, { threshold: 0.3 });
  observedSections.forEach(sec => sectionObserver.observe(sec));

  // ── Heartbeat (update every 5s) ──
  setInterval(() => {
    sessionData.timeOnSite += 5;
    sessionData.lastActive = new Date().toISOString();
    saveSession();
  }, 5000);

  // ── Mark session as inactive on leave ──
  window.addEventListener('beforeunload', () => {
    sessionData.isActive = false;
    sessionData.lastActive = new Date().toISOString();
    saveSession();
    logActivity('session_end', { duration: sessionData.timeOnSite, scrollDepth: sessionData.scrollDepth, clicks: sessionData.clickCount });
  });

  // ── Visibility change tracking ──
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      logActivity('tab_hidden', {});
      sessionData.isActive = false;
    } else {
      logActivity('tab_visible', {});
      sessionData.isActive = true;
    }
    saveSession();
  });

  // ── Initial save ──
  saveSession();
  logActivity('session_start', { browser: sessionData.browser, os: sessionData.os, device: sessionData.device });

  // ── Clean stale sessions (older than 30 min) ──
  const sessions = JSON.parse(localStorage.getItem(SESSION_KEY) || '[]');
  const cutoff = Date.now() - 30 * 60 * 1000;
  const cleaned = sessions.filter(s => {
    const lastActive = new Date(s.lastActive).getTime();
    return lastActive > cutoff || s.id === sessionId;
  });
  localStorage.setItem(SESSION_KEY, JSON.stringify(cleaned));

})();

// (Audio is initialised inside the page loader completion callback above)


// Apply Founder Social Links dynamically
function loadFounderSocials() {
    const socials = JSON.parse(localStorage.getItem('ivory_founder_socials') || '{}');
    const defaultSocials = {
        'pranav-fb': '#', 'pranav-insta': '#', 'pranav-linkedin': '#',
        'pratik-fb': '#', 'pratik-insta': '#', 'pratik-linkedin': '#'
    };
    
    // Merge defaults with saved
    const currentSocials = { ...defaultSocials, ...socials };
    
    // Apply
    for (const [id, url] of Object.entries(currentSocials)) {
        const el = document.getElementById(id);
        if (el) {
            el.href = url && url.trim() !== '' ? url : '#';
            if(url && url.trim() !== '' && url !== '#'){
                 el.target = '_blank';
            } else {
                 el.removeAttribute('target');
            }
        }
    }
}
document.addEventListener('DOMContentLoaded', loadFounderSocials);
