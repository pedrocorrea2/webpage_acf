// Hero background rotation
class HeroPro {
  constructor(section) {
    this.section = section;
    this.images = JSON.parse(section.getAttribute('data-images'));
    this.bgs = section.querySelectorAll('.hero__bg');
    this.idx = 0;
    this.cycle();
    setInterval(()=>this.cycle(),5000);
  }
  cycle() {
    this.idx = (this.idx+1)%this.images.length;
    this.bgs.forEach((bg,i)=>{
      bg.style.backgroundImage=`url(${this.images[(this.idx+i)%this.images.length]})`;
    });
    this.bgs.forEach((bg,i)=>bg.classList.toggle('is-active',i===0));
    this.section.append(...this.bgs);
  }
}
document.addEventListener('DOMContentLoaded',()=>{
  const hero=document.querySelector('.hero--pro');
  if(hero) new HeroPro(hero);
});

// Nav mobile
const navToggle=document.getElementById('navToggle');
const nav=document.getElementById('nav');
if(navToggle){navToggle.addEventListener('click',()=>{nav.classList.toggle('open');});}

// Reveal on scroll
const reveals=document.querySelectorAll('.reveal');
const revealObs=new IntersectionObserver((entries)=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');}));
reveals.forEach(r=>revealObs.observe(r));

// Modal login
const loginToggle=document.getElementById('loginToggle');
const loginModal=document.getElementById('loginModal');
const loginClose=document.getElementById('loginClose');
if(loginToggle){loginToggle.addEventListener('click',()=>{loginModal.hidden=false; document.body.classList.add('no-scroll');});}
if(loginClose){loginClose.addEventListener('click',()=>{loginModal.hidden=true; document.body.classList.remove('no-scroll');});}
loginModal?.addEventListener('click',(e)=>{if(e.target.classList.contains('modal__backdrop')){loginModal.hidden=true; document.body.classList.remove('no-scroll');}});

// FAQ toggle
document.querySelectorAll('.faq-q').forEach(btn=>{
  btn.addEventListener('click',()=>{
    btn.parentElement.classList.toggle('active');
  });
});
