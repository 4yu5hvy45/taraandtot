(function(){
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var intro = document.getElementById('intro');
  if (!window.gsap || !window.ScrollTrigger) { if (intro) intro.remove(); root.classList.add('no-js'); document.getElementById('together').classList.add('static-together'); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* smooth scroll */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.25, smoothWheel: true, easing: function(t){ return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function(t){ lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href'); var el = id === '#top' ? document.body : document.querySelector(id);
      if (!el) return; e.preventDefault();
      if (lenis) lenis.scrollTo(id === '#top' ? 0 : el, { offset: -10, duration: 1.6 }); else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* nav: solid after hero, hide on scroll down */
  var nav = document.getElementById('nav'), lastY = 0;
  function onScroll(y){
    nav.classList.toggle('solid', y > 40);
    nav.classList.toggle('hide', y > 500 && y > lastY + 2);
    if (y < lastY - 2) nav.classList.remove('hide');
    lastY = y;
  }
  if (lenis) lenis.on('scroll', function(e){ onScroll(e.scroll); }); else window.addEventListener('scroll', function(){ onScroll(window.scrollY); }, { passive: true });

  /* hero entrance (runs after intro) */
  function heroIn(){
    var tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
    tl.from('.hero h1 .ln > span', { yPercent: 110, duration: 1.4, stagger: .12 })
      .fromTo('#heroArch', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
      .from('#heroImg', { scale: 1.35, duration: 2.6, ease: 'expo.out' }, .1)
      .from('[data-fade]', { y: 18, opacity: 0, duration: 1.1, stagger: .08 }, .45)
      .from('.badge', { scale: 0, rotate: -40, duration: 1.2, ease: 'back.out(1.6)' }, .9)
      .from('.nav', { yPercent: -100, opacity: 0, duration: 1 }, .6);
    return tl;
  }

  /* intro */
  var heroTl = reduce ? null : heroIn();
  if (intro && !reduce) {
    if (lenis) lenis.stop();
    root.style.overflow = 'hidden';
    var countEl = document.getElementById('count'), c = { v: 0 };
    var it = gsap.timeline({ defaults: { ease: 'expo.out' } });
    gsap.set('.intro .heart', { scale: 0, transformOrigin: '50% 50%' });
    it.to(c, { v: 100, duration: 2.4, ease: 'power2.inOut', onUpdate: function(){ countEl.textContent = String(Math.round(c.v)).padStart(3, '0'); } }, 0)
      .from('.intro .logo-icon', { y: 24, opacity: 0, scale: .92, duration: 1.3 }, .1)
      .to('.intro .heart', { scale: 1, duration: .9, ease: 'back.out(3)' }, .7)
      .from('.intro .logo-word .ltr', { y: 160, opacity: 0, duration: 1.1, stagger: .055 }, .55)
      .from('.intro .logo-word .spark', { scale: 0, rotation: -180, transformOrigin: '50% 50%', duration: 1.1, ease: 'back.out(2)' }, 1.25)
      .from('.intro .tagline', { y: 12, opacity: 0, duration: 1 }, 1.35)
      .to('.intro-inner', { y: -30, opacity: 0, duration: .8, ease: 'power3.in' }, 2.65)
      .to(intro, { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'expo.inOut' }, 2.9)
      .add(function(){ heroTl.play(); }, 3.0)
      .add(function(){ intro.remove(); root.style.overflow = ''; if (lenis) lenis.start(); ScrollTrigger.refresh(); }, 4.1);
  } else {
    if (intro) intro.remove();
    if (heroTl) heroTl.play();
  }

  if (reduce) { document.getElementById('together').classList.add('static-together'); return; }

  /* hero image drift */
  gsap.to('#heroImg', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* manifesto word scrub */
  var m = document.getElementById('manifesto');
  (function split(node){
    Array.from(node.childNodes).forEach(function(n){
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function(part){
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else { var s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s); }
        });
        node.replaceChild(frag, n);
      } else if (n.nodeType === 1) split(n);
    });
  })(m);
  gsap.fromTo('#manifesto .w', { opacity: .16 }, { opacity: 1, stagger: .05, ease: 'none',
    scrollTrigger: { trigger: m, start: 'top 78%', end: 'bottom 42%', scrub: true } });
  gsap.utils.toArray('[data-speed]').forEach(function(el){
    var s = parseFloat(el.dataset.speed);
    gsap.to(el, { yPercent: s * -100, ease: 'none', scrollTrigger: { trigger: '.manifesto', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.from('.manifesto .sign', { y: 30, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.manifesto .sign', start: 'top 90%' } });

  var mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', function(){
    /* lookbook: pinned horizontal travel */
    var rail = document.getElementById('rail');
    var dist = function(){ return Math.max(0, rail.scrollWidth - window.innerWidth); };
    var tween = gsap.to(rail, { x: function(){ return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: '#edit', start: 'top top', end: function(){ return '+=' + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true,
        onUpdate: function(self){ gsap.set('#prog', { scaleX: self.progress }); } } });
    gsap.utils.toArray('.look .arch img').forEach(function(img){
      gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: img.closest('.look'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
    });

    /* sibling frame opens to full screen */
    var tl = gsap.timeline({ scrollTrigger: { trigger: '#stage', start: 'top top', end: '+=140%', pin: true, scrub: 1 } });
    tl.fromTo('#frame', { clipPath: 'inset(8% 33% 14% 33% round 2000px 2000px 18px 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0px 0px)', ease: 'power2.inOut', duration: 1 }, 0)
      .fromTo('#frame img', { scale: 1.12 }, { scale: 1, ease: 'power2.inOut', duration: 1 }, 0)
      .to('#frame', { '--shade': 1, duration: .5 }, .55)
      .fromTo('#togetherCopy > *', { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: .08, duration: .45, ease: 'power3.out' }, .6)
      .to('.together .side-l, .together .side-r', { opacity: 0, duration: .3 }, 0);
  });
  mm.add('(max-width: 900px)', function(){
    gsap.from('#togetherCopy > *', { y: 40, opacity: 0, stagger: .1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '#stage', start: 'top 70%' } });
  });

  /* gentle reveals */
  gsap.utils.toArray('[data-reveal]').forEach(function(el, i){
    gsap.from(el, { y: 50, opacity: 0, duration: 1.2, ease: 'expo.out', delay: (i % 3) * .08, scrollTrigger: { trigger: el, start: 'top 92%' } });
  });
  gsap.utils.toArray('.details-head h2, .promise h2, .ig-head h2, .foot h2, .edit-head h2').forEach(function(h){
    gsap.from(h, { y: 40, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 90%' } });
  });
  gsap.from('.foot .big .ltr', { y: 160, opacity: 0, duration: 1.2, stagger: .05, ease: 'expo.out', scrollTrigger: { trigger: '.foot .big', start: 'top 95%' } });

  /* cursor */
  var cur = document.getElementById('cursor');
  if (cur && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var xTo = gsap.quickTo(cur, 'x', { duration: .45, ease: 'power3' }), yTo = gsap.quickTo(cur, 'y', { duration: .45, ease: 'power3' });
    window.addEventListener('pointermove', function(e){ cur.style.opacity = 1; xTo(e.clientX); yTo(e.clientY); });
    document.querySelectorAll('.arch, .dcard .ph, .iggrid a').forEach(function(el){
      el.addEventListener('pointerenter', function(){ cur.classList.add('big'); });
      el.addEventListener('pointerleave', function(){ cur.classList.remove('big'); });
    });
  }
  window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
})();
