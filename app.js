document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // GSAP PRELOADER & SETUP
    // ============================================
    if (typeof gsap !== 'undefined') {
        const tlPreloader = gsap.timeline();
        
        // Block interaction during load
        document.body.style.overflow = 'hidden';

        tlPreloader.to('#preloader-progress', {
            width: '100%',
            duration: 1.5,
            ease: 'power3.inOut'
        })
        .to('#preloader-text', {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'back.out(1.7)'
        }, "-=0.5")
        .to('#preloader', {
            yPercent: -100,
            duration: 1.2,
            ease: 'power4.inOut',
            delay: 0.5,
            onComplete: () => {
                document.body.style.overflow = ''; // Restore scroll
                // Trigger Hero Animation only after preloader is done
                if (window.tlHero) window.tlHero.play();
                if (window.ScrollTrigger) ScrollTrigger.refresh();
            }
        });
    }

    // --- Lenis Premium Smooth Scroll ---
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1.1,
      smoothTouch: false,
      touchMultiplier: 2.5,
      infinite: false,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // Sync GSAP ScrollTrigger with Lenis
    if (window.ScrollTrigger) {
        lenis.on('scroll', ScrollTrigger.update)
        gsap.ticker.add((time)=>{
          lenis.raf(time * 1000)
        })
        gsap.ticker.lagSmoothing(0)
    }

    // 1. Footer Year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
// 2. Mobile Menu Logic (Fixed: Closes on Link Click & Click Outside)
  const toggleBtn = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuIcon = document.getElementById('menuIcon');
  const closeIcon = document.getElementById('closeIcon');
  
  // Select all links inside the mobile menu automatically
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

  function closeMenu() {
      if (!mobileMenu) return;
      mobileMenu.classList.add('hidden');
      if(menuIcon) menuIcon.classList.remove('hidden');
      if(closeIcon) closeIcon.classList.add('hidden');
  }

  function openMenu() {
      if (!mobileMenu) return;
      mobileMenu.classList.remove('hidden');
      if(menuIcon) menuIcon.classList.add('hidden');
      if(closeIcon) closeIcon.classList.remove('hidden');
  }

  if (toggleBtn && mobileMenu) {
      // Toggle button click
      toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent this click from immediately closing the menu via the document listener below
          const isHidden = mobileMenu.classList.contains('hidden');
          if (isHidden) {
              openMenu();
          } else {
              closeMenu();
          }
      });

      // 1. Close when clicking any link inside the menu
      mobileLinks.forEach(link => {
          link.addEventListener('click', closeMenu);
      });

      // 2. Close when clicking anywhere outside the menu
      document.addEventListener('click', (e) => {
          // If the menu is OPEN... AND the click is NOT inside the menu... AND NOT on the toggle button
          if (!mobileMenu.classList.contains('hidden') && 
              !mobileMenu.contains(e.target) && 
              !toggleBtn.contains(e.target)) {
              closeMenu();
          }
      });
  }

    // 3. Video Fallback
    const vid = document.getElementById('heroVideo');
    const gif = document.getElementById('heroGif');
    if (vid && gif) {
        vid.addEventListener('error', () => { vid.style.display = 'none'; gif.classList.remove('hidden'); });
        setTimeout(() => { if (vid.readyState < 3) { vid.style.display = 'none'; gif.classList.remove('hidden'); } }, 3000);
    }

    // 4. Home Carousel
    const carousel = document.querySelector('.carousel');
    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
        const prevBtn = carousel.querySelector('.carousel-arrow.left');
        const nextBtn = carousel.querySelector('.carousel-arrow.right');
        let idx = 0;

        function showSlide(n) {
            slides.forEach((s, i) => s.classList.toggle('active', i === n));
        }
        function next() { idx = (idx + 1) % slides.length; showSlide(idx); }
        function prev() { idx = (idx - 1 + slides.length) % slides.length; showSlide(idx); }
        let autoplay = setInterval(next, 3500);

        if (nextBtn) nextBtn.addEventListener('click', () => { next(); clearInterval(autoplay); autoplay = setInterval(next, 3500); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prev(); clearInterval(autoplay); autoplay = setInterval(next, 3500); });
    }

    // 5. Features Bubbles (Polar Position)
    const composition = document.getElementById("featuresComposition");
    const circle = document.getElementById("featuresCircle");
    const svg = document.querySelector(".features-svg");
    const bubbles = Array.from(document.querySelectorAll(".feature-bubble"));

    function placeBubbles() {
        if (window.innerWidth < 768) return; // Let CSS handle mobile stack
        if (!composition || !circle) return;

        const compRect = composition.getBoundingClientRect();
        const circleRect = circle.getBoundingClientRect();
        const cx = (circleRect.left + circleRect.width / 2) - compRect.left;
        const cy = (circleRect.top + circleRect.height / 2) - compRect.top;
        const radius = circleRect.width / 2 * 1.4;

        if (svg) { svg.innerHTML = ''; }

        bubbles.forEach(b => {
            const deg = parseFloat(b.getAttribute("data-angle") || 0);
            const rad = deg * Math.PI / 180;
            const x = cx + Math.cos(rad) * radius - b.offsetWidth / 2;
            const y = cy + Math.sin(rad) * radius - b.offsetHeight / 2;
            b.style.left = `${x}px`;
            b.style.top = `${y}px`;

            // Draw line
            if (svg) {
                 const lx = cx + Math.cos(rad) * (circleRect.width/2);
                 const ly = cy + Math.sin(rad) * (circleRect.height/2);
                 const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                 path.setAttribute("d", `M ${lx} ${ly} L ${x + b.offsetWidth/2} ${y + b.offsetHeight/2}`);
                 path.setAttribute("stroke", "rgba(15,61,62,0.1)");
                 path.setAttribute("stroke-width", "1");
                 path.setAttribute("fill", "none");
                 svg.appendChild(path);
            }
        });
    }
    window.addEventListener('resize', placeBubbles);
    window.addEventListener('load', placeBubbles);
    setTimeout(placeBubbles, 500);

    // 6. Modal Logic
    const modal = document.getElementById('productPreviewModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalGallery = document.querySelector('.modal-gallery');
    const cards = document.querySelectorAll('.product-card, .product-card-lookbook');
    
    if (modal && cards.length) {
        let currentImgs = [];
        let imgIdx = 0;

        cards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.getAttribute('data-title');
                const key = card.getAttribute('data-key');
                const descElem = card.querySelector('.product-desc-content');
                const desc = card.getAttribute('data-description') || "Premium comfort pillow.";
                const rawImgs = card.getAttribute('data-images');
                
                modalTitle.textContent = title;
                
                if (key && window.productData && window.productData[key]) {
                    modalDesc.innerHTML = window.productData[key];
                } else if (descElem) {
                    modalDesc.innerHTML = descElem.innerHTML;
                } else {
                    modalDesc.textContent = desc;
                }
                
                // Images
                modalGallery.innerHTML = '';
                currentImgs = [];
                if (rawImgs) {
                    currentImgs = rawImgs.split(',').map(s => s.trim());
                } else {
                    const img = card.querySelector('img');
                    if(img) currentImgs.push(img.src);
                }

                currentImgs.forEach((src, i) => {
                    const img = document.createElement('img');
                    img.src = src;
                    if(i === 0) img.classList.add('active');
                    modalGallery.appendChild(img);
                });
                imgIdx = 0;
                
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                document.body.style.overflow = 'hidden';
            });
        });

        // Close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                document.body.style.overflow = '';
            }
        });

        // Gallery Controls
        document.querySelector('.modal-next').addEventListener('click', () => {
            if(currentImgs.length < 2) return;
            const imgs = modalGallery.querySelectorAll('img');
            imgs[imgIdx].classList.remove('active');
            imgIdx = (imgIdx + 1) % currentImgs.length;
            imgs[imgIdx].classList.add('active');
        });
        document.querySelector('.modal-prev').addEventListener('click', () => {
            if(currentImgs.length < 2) return;
            const imgs = modalGallery.querySelectorAll('img');
            imgs[imgIdx].classList.remove('active');
            imgIdx = (imgIdx - 1 + currentImgs.length) % currentImgs.length;
            imgs[imgIdx].classList.add('active');
        });
    }

    // 7. Animations (Brand Reveal)
    const brandSection = document.getElementById('brand-creative');
    if (brandSection) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    brandSection.classList.add('in-view');
                }
            });
        }, { threshold: 0.2 });
        observer.observe(brandSection);
    }
    
    // 8. Multi-Tab Navigation Structure & Fast Routing
    const tabMapping = {
      'home': ['home', 'pillow-features', 'brand-creative', 'features-section'],
      'about': ['about', 'core-values'],
      'collections': ['collections'],
      'contact': ['contact']
    };

    function showTab(tabId) {
      // Hide all main sections
      document.querySelectorAll('main > section').forEach(sec => {
        sec.style.display = 'none';
      });

      // Show sections for the selected tab
      if (tabMapping[tabId]) {
        const sectionsToShow = tabMapping[tabId].map(id => document.getElementById(id)).filter(Boolean);
        sectionsToShow.forEach(el => {
          el.style.display = 'block';
        });
        
        // Enhance GSAP Animation on Enter
        if (window.gsap) {
          gsap.fromTo(sectionsToShow,
             { opacity: 0, y: 20 },
             { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', clearProps: 'all' }
          );
        }
      }

      // Update Nav Link Classes
      document.querySelectorAll('#desktopNav a, #mobileMenu a, header a').forEach(a => {
        const href = a.getAttribute('href');
        if (href && href.startsWith('#')) {
           const linkTab = href.replace('#', '');
           // Special case for logo leading to home
           if (linkTab === tabId && tabMapping[linkTab]) {
             a.classList.add('text-[var(--teal)]', 'font-bold');
             a.classList.remove('text-[var(--muted)]', 'font-medium');
           } else {
             a.classList.remove('text-[var(--teal)]', 'font-bold');
             a.classList.add('text-[var(--muted)]');
           }
        }
      });

      window.scrollTo({ top: 0, behavior: 'instant' });
      
      // Refresh ScrollTrigger so pinning/animations position correctly after layout change
      if (window.ScrollTrigger) {
        setTimeout(() => ScrollTrigger.refresh(), 100);
      }
    }

    // Intercept clicks on deep links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const target = a.getAttribute('href').replace('#', '');
        if (tabMapping[target]) {
          e.preventDefault();
          showTab(target);
          history.pushState(null, null, '#' + target);
          
          // Close mobile menu if open
          const mobileMenu = document.getElementById('mobileMenu');
          if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
             const toggleBtn = document.getElementById('mobileToggle');
             if(toggleBtn) toggleBtn.click();
          }
        }
      });
    });

    // On Load check URL hash or determine by page
    const hash = window.location.hash.replace('#', '');
    const isContactPage = window.location.pathname.includes('contact.html');
    
    if (tabMapping[hash]) {
      showTab(hash);
    } else if (isContactPage) {
      showTab('contact');
    } else {
      showTab('home');
    }
    
    // 9. 3D Card Hover Effects (VanillaTilt)
    if (typeof VanillaTilt !== 'undefined') {
        const productCards = document.querySelectorAll('.product-card, .feature-card, .core-card, .product-card-lookbook');
        productCards.forEach(card => {
            // Apply 3D rotate settings ensuring premium looks
            VanillaTilt.init(card, {
                max: 8,
                speed: 400,
                glare: true,
                "max-glare": 0.2,
                scale: 1.02,
                transition: true,
                easing: "cubic-bezier(.03,.98,.52,.99)"
            });
            card.style.transformStyle = "preserve-3d";
        });
        
        // Fix for modal content images rendering flat 
        document.querySelectorAll('.product-media img').forEach(img => {
            img.style.transform = "translateZ(30px)"; // Pop out element
        });
    }
    
    // 10. GSAP Premium Animations
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Hero Load Animation (Paused initially, played by preloader)
        if (document.querySelector('.hero-title')) {
            window.tlHero = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
            window.tlHero.to('.hero-title', { opacity: 1, y: 0, duration: 1.2, delay: 0.2 })
                  .to('.hero-subtitle', { opacity: 1, y: 0, duration: 1 }, "-=0.8")
                  .to('.hero-actions', { opacity: 1, y: 0, duration: 0.8 }, "-=0.6")
                  .to('.hero-scroll-indicator', { opacity: 1, duration: 1 }, "-=0.4");
        }

        // Stagger Reveals
        gsap.utils.toArray('.gsap-reveal').forEach(elem => {
            gsap.fromTo(elem, 
              { opacity: 0, y: 40 },
              {
                opacity: 1, 
                y: 0,
                duration: 1.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: elem,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
              }
            );
        });

        // Parallax scroll on images
        gsap.utils.toArray('.gsap-parallax').forEach(img => {
            const speed = img.getAttribute('data-speed') || 1.2;
            gsap.to(img, {
                yPercent: (speed - 1) * 20, // Move down inside container
                ease: "none",
                scrollTrigger: {
                    trigger: img.parentElement, // Wrapper with hidden overflow
                    start: "top bottom", 
                    end: "bottom top",
                    scrub: 1 // smooth scrubbing
                }
            });
        });
        
        // Refresh ScrollTrigger after any DOM changes or tab switches
        ScrollTrigger.refresh();
    }

  });
(function positionBubbles(){
  const container = document.querySelector('.features-composition');
  if (!container) return;
  const center = container.getBoundingClientRect();
  const cx = center.width/2;
  const cy = center.height/2;
  const radius = Math.min(center.width, center.height)/2 - 90; // tweak offset

  container.querySelectorAll('.feature-bubble').forEach((b, i) => {
    const angleAttr = b.dataset.angle;
    const angle = angleAttr ? parseFloat(angleAttr) * (Math.PI/180) : (i*(2*Math.PI/5));
    const x = cx + Math.cos(angle)*radius - b.offsetWidth/2;
    const y = cy + Math.sin(angle)*radius - b.offsetHeight/2;
    b.style.left = `${x}px`;
    b.style.top = `${y}px`;
    b.style.position = 'absolute';
  });
});
window.addEventListener('resize', function(){ setTimeout(positionBubbles, 80); });
// Add this inside your modal logic in app.js
const closeBtn = document.getElementById('closeModalBtn');
if(closeBtn) {
    closeBtn.addEventListener('click', () => {
        const productModal = document.getElementById('productPreviewModal');
        if (productModal) {
            productModal.classList.add('hidden');
            productModal.classList.remove('flex');
        }
        document.body.style.overflow = '';
    });
}