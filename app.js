// ========= Utilidades =========
const CL = (v) => console.log(v);
const formatCurrency = (amount) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
const formatNumber = (v) => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const parseNumber  = (v) => parseInt(String(v).replace(/\./g, ''), 10) || 0;

// Valida RUT chileno (Módulo 11)
function validaRUT(rutStr) {
  const clean = String(rutStr).replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1), dv = clean.slice(-1);
  let sum = 0, mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul;
    mul = (mul === 7) ? 2 : mul + 1;
  }
  const res = 11 - (sum % 11);
  const dvCalc = res === 11 ? '0' : res === 10 ? 'K' : String(res);
  return dv === dvCalc;
}
const formatRUT = (rut) => {
  const cleaned = String(rut || '').replace(/[^0-9kK]/g, '').toUpperCase();
  if (cleaned.length <= 1) return cleaned;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedBody}-${dv}`;
};

// ========= HERO PRO – Fondo rotatorio sin tapar texto =========
class HeroPro {
  constructor({ fadeMs = 1200, holdMs = 7000 } = {}) {
    this.section = document.querySelector('.hero--pro');
    if (!this.section) return;
    try {
      this.images = JSON.parse(this.section.getAttribute('data-images') || '[]');
    } catch { this.images = []; }
    this.fadeMs = fadeMs;
    this.holdMs = holdMs;
    this.bgA = this.section.querySelectorAll('.hero__bg')[0];
    this.bgB = this.section.querySelectorAll('.hero__bg')[1];
    if (!this.bgA || !this.bgB) return;
    this.i = 0;
    if (this.images.length) {
      this.setBg(this.bgA, this.images[0]);
      this.setBg(this.bgB, this.images[1 % this.images.length]);
      this.bgA.classList.add('is-active');
      this.scheduleNext();
    }
    // Fallback inicial para el primer pintado
    ((section) => {
      if (!this.images[0]) return;
      section.style.setProperty('--hero-fallback', `url("${this.images[0]}")`);
    })(this.section);
  }
  setBg(el, url){ el.style.backgroundImage = `linear-gradient(180deg, rgba(6,12,20,.45), rgba(6,12,20,.6)), url('${url}')`; }
  scheduleNext(){ clearTimeout(this.timer); this.timer = setTimeout(() => this.next(), this.holdMs); }
  async preload(src){
    try { const img = new Image(); img.src = src; await (img.decode?.() || new Promise(res => img.onload = res)); }
    catch {}
  }
  async next(){
    if (!this.images.length) return;
    const nextIndex = (this.i + 1) % this.images.length;
    const nextUrl = this.images[nextIndex];
    await this.preload(nextUrl);
    const top = this.bgA.classList.contains('is-active') ? this.bgA : this.bgB;
    const back = top === this.bgA ? this.bgB : this.bgA;
    this.setBg(back, nextUrl);
    requestAnimationFrame(() => {
      top.classList.remove('is-active');
      back.classList.add('is-active');
    });
    this.i = nextIndex;
    this.scheduleNext();
  }
}

// ========= Calculadora (v2) =========
class CalculatorV2 {
  constructor(){
    this.$ = {
      amount: document.getElementById('cv2Amount'),
      presets: document.querySelectorAll('.cv2-chip'),
      termGroup: document.getElementById('cv2TermGroup'),
      rateSlider: document.getElementById('cv2Rate'),
      rateInput: document.getElementById('cv2RateInput'),
      rateDisplay: document.getElementById('cv2RateDisplay'),
      feeGroup: document.getElementById('cv2FeeGroup'),
      amountOut: document.getElementById('cv2AmountOut'),
      amountOut2: document.getElementById('cv2AmountOut2'),
      days: document.getElementById('cv2Days'),
      rateOut: document.getElementById('cv2RateOut'),
      discount: document.getElementById('cv2Discount'),
      discount2: document.getElementById('cv2Discount2'),
      fee: document.getElementById('cv2Fee'),
      fee2: document.getElementById('cv2Fee2'),
      net: document.getElementById('cv2Net'),
      financed: document.getElementById('cv2Financed'),
      toggleDetail: document.getElementById('cv2ToggleDetail'),
      detail: document.getElementById('cv2Detail'),
      cta: document.getElementById('cv2CTA'),
    };
    this.state = { days: 30, fee: 15000 };
    if (!this.$.amount) return;
    this.bind();
    this.calculate();
  }
  bind(){
    // Monto
    this.$.amount.addEventListener('input', (e)=>{
      const pos = e.target.selectionStart;
      const raw = e.target.value.replace(/\D/g,'');
      e.target.value = formatNumber(raw);
      try{ e.target.setSelectionRange(pos, pos); }catch{}
      this.calculate();
    });
    this.$.presets.forEach(btn => btn.addEventListener('click', ()=>{
      const v = btn.getAttribute('data-value') || '0';
      this.$.amount.value = formatNumber(v);
      this.calculate();
    }));
    // Plazo
    this.$.termGroup?.addEventListener('click', (e)=>{
      const btn = e.target.closest('.cv2-segbtn');
      if(!btn) return;
      this.$.termGroup.querySelectorAll('.cv2-segbtn').forEach(b=>{ b.classList.remove('is-active'); b.setAttribute('aria-pressed','false'); });
      btn.classList.add('is-active'); btn.setAttribute('aria-pressed','true');
      this.state.days = parseInt(btn.getAttribute('data-days') || '30', 10);
      this.calculate();
    });
    // Tasa
    const syncRate = (val)=>{
      const r = Math.min(4.5, Math.max(1, parseFloat(val || '1') || 1));
      this.$.rateSlider.value = String(r);
      this.$.rateInput.value = String(r);
      this.$.rateDisplay.textContent = `${r.toFixed(1).replace('.', ',')}%`;
      this.calculate();
    };
    this.$.rateSlider.addEventListener('input', (e)=> syncRate(e.target.value));
    this.$.rateInput.addEventListener('input',  (e)=> syncRate(e.target.value));

    // Gastos
    this.$.feeGroup?.addEventListener('click', (e)=>{
      const btn = e.target.closest('.cv2-segbtn');
      if(!btn) return;
      this.$.feeGroup.querySelectorAll('.cv2-segbtn').forEach(b=>{ b.classList.remove('is-active'); b.setAttribute('aria-pressed','false'); });
      btn.classList.add('is-active'); btn.setAttribute('aria-pressed','true');
      this.state.fee = parseNumber(btn.getAttribute('data-fee') || '15000');
      this.calculate();
    });

    // Detalle
    this.$.toggleDetail?.addEventListener('click', ()=>{
      const expanded = this.$.toggleDetail.getAttribute('aria-expanded') === 'true';
      this.$.toggleDetail.setAttribute('aria-expanded', String(!expanded));
      this.$.detail.toggleAttribute('hidden');
      this.$.toggleDetail.querySelector('i').className = expanded ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
      this.$.toggleDetail.firstChild.textContent = expanded ? 'Ver detalle' : 'Ocultar detalle';
    });

    // CTA
    this.$.cta?.addEventListener('click', (e)=>{
      e.preventDefault();
      document.querySelector('#contacto')?.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  }
  calculate(){
    const amount = parseNumber(this.$.amount.value);
    const r = parseFloat(this.$.rateSlider.value) || 1;
    const discount = amount * (r / 100) * (this.state.days / 30);
    const net = Math.max(0, amount - discount - this.state.fee);
    // Salidas
    this.$.amountOut.textContent = formatCurrency(amount);
    this.$.amountOut2.textContent = formatCurrency(amount);
    this.$.days.textContent = `${this.state.days} días`;
    this.$.rateOut.textContent = `${r.toFixed(1).replace('.', ',')}%`;
    this.$.discount.textContent = formatCurrency(discount);
    this.$.discount2.textContent = formatCurrency(discount);
    this.$.fee.textContent = formatCurrency(this.state.fee);
    this.$.fee2.textContent = formatCurrency(this.state.fee);
    this.$.net.textContent = formatCurrency(net);
    this.$.financed.textContent = formatCurrency(amount);
  }
}

// ========= Menú móvil =========
class NavMobile {
  constructor(){
    this.toggle = document.getElementById('navToggle');
    this.nav = document.getElementById('nav');
    this.init();
  }
  init(){
    if(!this.toggle || !this.nav) return;
    this.toggle.addEventListener('click', () => this.toggleNav());
    this.nav.addEventListener('click', (e) => { if (e.target.tagName === 'A') this.closeNav(); });
    document.addEventListener('keydown', (e) => { if(e.key === 'Escape') this.closeNav(); });
  }
  toggleNav(){ this.nav.classList.toggle('open'); this.toggle.setAttribute('aria-expanded', this.nav.classList.contains('open')); }
  closeNav(){ this.nav.classList.remove('open'); this.toggle.setAttribute('aria-expanded','false'); }
}

// ========= Modal de Login =========
class ModalController {
  constructor(){
    this.modal = document.getElementById('loginModal');
    this.openBtn = document.getElementById('loginToggle');
    this.closeBtn = document.getElementById('loginClose');
    this.form = document.getElementById('loginForm');
    this.rutInput = document.getElementById('loginUser');
    this.err = document.getElementById('rutError');
    this.boundEsc = (e)=>{ if(e.key==='Escape') this.close(); };
    this.init();
  }
  init(){
    if(!this.modal) return;
    this.openBtn?.addEventListener('click', () => this.open());
    this.closeBtn?.addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e)=>{ if(e.target.dataset.dismiss==='modal' || e.target === this.modal) this.close(); });
    this.rutInput?.addEventListener('input', (e)=>{ e.target.value = formatRUT(e.target.value); });
    this.form?.addEventListener('submit', (e)=> this.handleSubmit(e));
  }
  open(){
    this.modal.removeAttribute('hidden');
    document.body.classList.add('no-scroll');
    document.addEventListener('keydown', this.boundEsc);
    setTimeout(()=> this.modal.querySelector('input,button,select,textarea')?.focus(), 60);
  }
  close(){
    this.modal.setAttribute('hidden','');
    document.body.classList.remove('no-scroll');
    document.removeEventListener('keydown', this.boundEsc);
  }
  handleSubmit(e){
    e.preventDefault();
    const rutOk = validaRUT(this.rutInput?.value || '');
    if(!rutOk){
      this.err.textContent = 'RUT inválido. Ej: 12.345.678-5';
      this.err.classList.remove('sr-only');
      this.rutInput?.focus();
      return;
    }
    this.err.textContent = '';
    this.err.classList.add('sr-only');
    showToast('Autenticando…');
    setTimeout(()=>{ showToast('Sesión iniciada (demo)'); this.close(); }, 800);
  }
}

// ========= Reveal on scroll =========
class Reveal {
  constructor(){ this.els = document.querySelectorAll('.reveal'); this.observe(); }
  observe(){
    const io = new IntersectionObserver((entries, ob)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); ob.unobserve(e.target); } });
    }, { threshold: .1, rootMargin: '0px 0px -50px 0px' });
    this.els.forEach(el=> io.observe(el));
  }
}

// ========= Smooth anchors (con compensación de header) =========
function enableSmoothAnchors(){
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const headerH = document.querySelector('.header')?.offsetHeight || 66;
    const y = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
}

// ========= Contacto: validación básica =========
(function(){
  const form = document.getElementById('contactForm');
  if(!form) return;
  const name = document.getElementById('contactName');
  const rut  = document.getElementById('contactRut');
  const email= document.getElementById('contactEmail');
  const phone= document.getElementById('contactPhone');
  const msg  = document.getElementById('contactMessage');
  const consent = document.getElementById('contactConsent');
  const status = document.getElementById('formStatus');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    status.textContent = '';
    // Reglas mínimas
    if(!name.value.trim() || name.value.trim().length < 3){ status.textContent='Ingresa tu nombre.'; name.focus(); return; }
    if(!validaRUT(rut.value)){ status.textContent='RUT inválido.'; rut.focus(); return; }
    if(!emailRe.test(email.value)){ status.textContent='Email inválido.'; email.focus(); return; }
    if(String(phone.value).replace(/\D/g,'').length < 8){ status.textContent='Teléfono inválido.'; phone.focus(); return; }
    if(!consent.checked){ status.textContent='Debes aceptar ser contactad@.'; return; }

    showToast('Enviando…');
    // Simulación de envío
    setTimeout(()=>{
      status.textContent='Gracias. Te contactaremos a la brevedad.';
      form.reset();
    }, 900);
  });
})();

// ========= Toast helper =========
function showToast(msg){
  const el = document.getElementById('toast');
  if(!el) return;
  el.textContent = msg;
  el.removeAttribute('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=> el.setAttribute('hidden',''), 1400);
}

// ========= Bootstrap =========
document.addEventListener('DOMContentLoaded', () => {
  new HeroPro({ fadeMs: 1200, holdMs: 7000 });
  new CalculatorV2();
  new NavMobile();
  new ModalController();
  new Reveal();
  enableSmoothAnchors();
});
