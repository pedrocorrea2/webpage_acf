// Hero background rotation
class HeroPro {
  constructor(section) {
    this.section = section;
    this.images = JSON.parse(section.getAttribute('data-images'));
    this.bgs = section.querySelectorAll('.hero__bg');
    this.idx = 0;
    this.update();
    setInterval(()=>this.next(),7000);
  }
  update(){
    this.bgs.forEach((bg,i)=>{
      bg.style.backgroundImage=`url(${this.images[(this.idx+i)%this.images.length]})`;
      bg.classList.toggle('is-active',i===0);
    });
  }
  next(){ this.idx=(this.idx+1)%this.images.length; this.update(); }
}
document.addEventListener('DOMContentLoaded',()=>{
  const hero=document.querySelector('.hero--pro');
  if(hero) new HeroPro(hero);
});

// Nav mobile
const navToggle=document.getElementById('navToggle');
const nav=document.getElementById('nav');
if(navToggle){navToggle.addEventListener('click',()=>nav.classList.toggle('open'));}

// Reveal on scroll
const reveals=document.querySelectorAll('.reveal');
const revealObs=new IntersectionObserver((entries)=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible'); revealObs.unobserve(e.target);}}),{threshold:.1});
reveals.forEach(r=>revealObs.observe(r));

// Modal login
const loginToggle=document.getElementById('loginToggle');
const loginModal=document.getElementById('loginModal');
const loginClose=document.getElementById('loginClose');
if(loginToggle){loginToggle.addEventListener('click',()=>{loginModal.hidden=false; document.body.classList.add('no-scroll');});}
if(loginClose){loginClose.addEventListener('click',()=>closeModal());}
if(loginModal){loginModal.addEventListener('click',(e)=>{if(e.target.classList.contains('modal__backdrop')) closeModal();});}
document.addEventListener('keydown',(e)=>{if(e.key==="Escape"&&!loginModal.hidden) closeModal();});
function closeModal(){ loginModal.hidden=true; document.body.classList.remove('no-scroll'); }

// Contact form validation
const contactForm=document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit',(e)=>{
    if(!contactForm.checkValidity()){
      e.preventDefault();
      alert("Por favor completa todos los campos correctamente.");
    }
  });
}
