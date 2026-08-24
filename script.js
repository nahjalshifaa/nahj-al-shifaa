const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const BRANCHES = {
  safwa: { ar:'الحزم - صفوى', en:'Al Hazm - Safwa', whatsapp:'966590931883' },
  khobar:{ ar:'الجسر - الخبر', en:'Al Jisr - Al Khobar', whatsapp:'966545056692' }
};

const menuBtn = $('#menuBtn');
const mainNav = $('#mainNav');
const langBtn = $('#langBtn');
const toTop = $('#toTop');
const header = $('.site-header');

menuBtn?.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
$$('#mainNav a').forEach(a => a.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuBtn?.setAttribute('aria-expanded', 'false');
}));
window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 12);
  toTop?.classList.toggle('show', window.scrollY > 550);
}, {passive:true});
toTop?.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
$('#year').textContent = new Date().getFullYear();


// Compact request dropdown in the main navigation
const requestDropdown = $('.request-dropdown');
const requestDropdownToggle = $('#requestDropdownToggle');
const requestDropdownMenu = $('#requestDropdownMenu');
requestDropdownToggle?.addEventListener('click', e => {
  e.stopPropagation();
  const willOpen = requestDropdownMenu.hidden;
  requestDropdownMenu.hidden = !willOpen;
  requestDropdown?.classList.toggle('open', willOpen);
  requestDropdownToggle.setAttribute('aria-expanded', String(willOpen));
});
document.addEventListener('click', e => {
  if (requestDropdown && !requestDropdown.contains(e.target)) {
    requestDropdownMenu.hidden = true;
    requestDropdown.classList.remove('open');
    requestDropdownToggle?.setAttribute('aria-expanded','false');
  }
});
requestDropdownMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  requestDropdownMenu.hidden = true;
  requestDropdown?.classList.remove('open');
  requestDropdownToggle?.setAttribute('aria-expanded','false');
}));

// Service directory starts fully closed. Choosing All or any group opens it.
const serviceFilters = $$('.service-filter');
const servicesGrid = $('#servicesGrid');
const serviceCards = $$('#servicesGrid .service-card');

const closeServicesDirectory = () => {
  if (!servicesGrid) return;
  servicesGrid.classList.remove('is-open');
  servicesGrid.setAttribute('aria-hidden', 'true');
  serviceFilters.forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-expanded', 'false');
  });
};

closeServicesDirectory();

serviceFilters.forEach(btn => btn.addEventListener('click', () => {
  if (!servicesGrid) return;
  const filter = btn.dataset.serviceFilter || 'all';
  const sameOpenFilter = btn.classList.contains('active') && servicesGrid.classList.contains('is-open');

  if (sameOpenFilter) {
    closeServicesDirectory();
    return;
  }

  serviceFilters.forEach(b => {
    const active = b === btn;
    b.classList.toggle('active', active);
    b.setAttribute('aria-expanded', active ? 'true' : 'false');
  });

  serviceCards.forEach(card => {
    card.hidden = filter !== 'all' && card.dataset.serviceCategory !== filter;
  });

  servicesGrid.classList.add('is-open');
  servicesGrid.setAttribute('aria-hidden', 'false');
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold:.1});
$$('.reveal').forEach(el => revealObserver.observe(el));

// Counters
let countersStarted = false;
const stats = $('.stats-wrap');
const formatNumber = n => new Intl.NumberFormat(document.documentElement.lang === 'en' ? 'en-US' : 'en-US').format(n);
if (stats) {
  const statObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || countersStarted) return;
    countersStarted = true;
    $$('.counter').forEach(el => {
      const target = Number(el.dataset.count || 0);
      const start = performance.now();
      const duration = target >= 100000 ? 1450 : target >= 1000 ? 1200 : 850;
      const step = now => {
        const p = Math.min((now - start) / duration, 1);
        const value = Math.floor(target * (1 - Math.pow(1 - p, 3)));
        el.textContent = formatNumber(value);
        if (p < 1) requestAnimationFrame(step); else el.textContent = formatNumber(target);
      };
      requestAnimationFrame(step);
    });
    statObserver.disconnect();
  }, {threshold:.35});
  statObserver.observe(stats);
}

// Request modal and tabs
const requestModal = $('#requestModal');
const closeRequest = $('#closeRequest');
const requestType = $('#requestType');
const tabButtons = $$('.request-tab');
function setRequestTab(type) {
  const safe = ['appointment','company','feedback'].includes(type) ? type : 'appointment';
  requestType.value = safe;
  tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === safe));
  $$('.appointment-field').forEach(el => el.classList.toggle('hidden', safe !== 'appointment'));
  $$('.company-field').forEach(el => el.classList.toggle('hidden', safe !== 'company'));
  $$('.feedback-field').forEach(el => el.classList.toggle('hidden', safe !== 'feedback'));
  if (typeof syncOtherField === 'function') {
    syncOtherField('#department', '#departmentOtherWrap', '#departmentOther');
    syncOtherField('#companyService', '#companyServiceOtherWrap', '#companyServiceOther');
    syncOtherField('#feedbackType', '#feedbackTypeOtherWrap', '#feedbackTypeOther');
  }
}
function openRequest(type='appointment', trigger=null) {
  setRequestTab(type);
  if (trigger?.dataset.branch && $('#branch')) $('#branch').value = trigger.dataset.branch;
  if (trigger?.dataset.department && $('#department')) $('#department').value = trigger.dataset.department;
  requestModal.hidden = false;
  document.body.classList.add('modal-open');
  setTimeout(() => $('#name')?.focus(), 50);
}
function hideRequest() {
  requestModal.hidden = true;
  document.body.classList.remove('modal-open');
}
$$('[data-open-request]').forEach(el => el.addEventListener('click', e => {
  e.preventDefault();
  openRequest(el.dataset.openRequest, el);
}));
tabButtons.forEach(btn => btn.addEventListener('click', () => setRequestTab(btn.dataset.tab)));
closeRequest?.addEventListener('click', hideRequest);
requestModal?.addEventListener('click', e => { if (e.target === requestModal) hideRequest(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && requestModal && !requestModal.hidden) hideRequest(); });

// "Other" options reveal a free-text field only when needed.
const otherSelectors = [
  ['#department', '#departmentOtherWrap', '#departmentOther'],
  ['#companyService', '#companyServiceOtherWrap', '#companyServiceOther'],
  ['#feedbackType', '#feedbackTypeOtherWrap', '#feedbackTypeOther']
];
function syncOtherField(selectSel, wrapSel, inputSel) {
  const select = $(selectSel), wrap = $(wrapSel), input = $(inputSel);
  if (!select || !wrap || !input) return;
  const type = requestType?.value || 'appointment';
  const groupActive = wrap.classList.contains('appointment-field') ? type === 'appointment'
    : wrap.classList.contains('company-field') ? type === 'company'
    : wrap.classList.contains('feedback-field') ? type === 'feedback' : true;
  const show = groupActive && (select.value === 'أخرى' || select.value === 'Other');
  wrap.classList.toggle('hidden', !show);
  input.required = show;
  if (!show) input.value = '';
}
otherSelectors.forEach(args => {
  const select = $(args[0]);
  select?.addEventListener('change', () => syncOtherField(...args));
  syncOtherField(...args);
});
function selectedOrOther(selectSel, inputSel) {
  const select = $(selectSel), input = $(inputSel);
  if (!select) return '';
  return (select.value === 'أخرى' || select.value === 'Other') ? (input?.value.trim() || select.value) : select.value;
}

$('#requestForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const type = requestType.value;
  const branchKey = $('#branch').value;
  const branch = BRANCHES[branchKey] || BRANCHES.safwa;
  const ar = document.documentElement.lang === 'ar';
  const name = $('#name').value.trim();
  const mobile = $('#mobile').value.trim();
  const details = $('#details').value.trim();
  const labels = ar ? {
    appointment:'طلب حجز موعد', company:'طلب تعاقد شركات', feedback:'شكوى / اقتراح',
    name:'الاسم', mobile:'رقم الجوال', branch:'الفرع', department:'القسم أو العيادة', date:'التاريخ المفضل',
    companyName:'اسم الشركة', service:'الخدمة المطلوبة', feedbackType:'نوع الرسالة', details:'تفاصيل إضافية'
  } : {
    appointment:'Appointment Request', company:'Corporate Contract Request', feedback:'Complaint / Suggestion',
    name:'Name', mobile:'Mobile', branch:'Branch', department:'Department', date:'Preferred date',
    companyName:'Company', service:'Required service', feedbackType:'Message type', details:'Additional details'
  };
  const lines = [
    `*${labels[type]}*`,
    `${labels.branch}: ${ar ? branch.ar : branch.en}`,
    `${labels.name}: ${name}`,
    `${labels.mobile}: ${mobile}`
  ];
  if (type === 'appointment') {
    lines.push(`${labels.department}: ${selectedOrOther('#department', '#departmentOther')}`);
    if ($('#day').value) lines.push(`${labels.date}: ${$('#day').value}`);
  }
  if (type === 'company') {
    lines.push(`${labels.companyName}: ${$('#companyName').value.trim() || '-'}`);
    lines.push(`${labels.service}: ${selectedOrOther('#companyService', '#companyServiceOther')}`);
  }
  if (type === 'feedback') lines.push(`${labels.feedbackType}: ${selectedOrOther('#feedbackType', '#feedbackTypeOther')}`);
  if (details) lines.push(`${labels.details}: ${details}`);
  window.open(`https://wa.me/${branch.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
});

// WhatsApp floating branch chooser
const waFloat = $('#whatsappFloat');
const waChoice = $('#whatsappChoice');
waFloat?.addEventListener('click', e => {
  e.stopPropagation();
  waChoice.hidden = !waChoice.hidden;
});
document.addEventListener('click', e => {
  if (waChoice && !waChoice.hidden && !$('#whatsappWidget')?.contains(e.target)) waChoice.hidden = true;
});

// Lightweight language toggle for the primary navigation and stats. The full Arabic content remains authoritative.
const i18n = {
  navHome:'Home',navRequests:'Requests',navAbout:'About',navServices:'Medical Services',navHomeCare:'Home Care',navInsurance:'Insurance',navCorporate:'Corporate Services',navBranches:'Branches',navContact:'Contact',navBook:'Book Appointment',navCompanyRequest:'Corporate Request',navFeedback:'Complaint / Suggestion',motto:'Your care is our priority',brand:'Nahj Al-Shifaa General Medical Complex',heroLabel:'Healthcare for individuals, families and companies',heroText:'Nahj Al-Shifaa brings clinics, diagnostics, insurance procedures and corporate medical examinations together in one convenient experience.',bookNow:'Book an appointment',findBranch:'Find the nearest branch',statGoal:'Our goal is your care',statServices:'More than 12 services & specialties',statInsurance:'More than 10 insurance partners',statCompanies:'Served 1,000+ companies',statClients:'Served 100,000+ clients'
};
const arText = new Map();
$$('[data-i18n]').forEach(el => arText.set(el, el.textContent));
function applyLanguage(lang){
  const en = lang === 'en';
  document.documentElement.lang = en ? 'en' : 'ar';
  document.documentElement.dir = en ? 'ltr' : 'rtl';
  langBtn.textContent = en ? 'AR' : 'EN';
  $$('[data-i18n]').forEach(el => { const key=el.dataset.i18n; el.textContent = en ? (i18n[key] || arText.get(el)) : arText.get(el); });
  localStorage.setItem('nahj-lang', lang);
}
langBtn?.addEventListener('click', () => applyLanguage(document.documentElement.lang === 'ar' ? 'en' : 'ar'));
applyLanguage(localStorage.getItem('nahj-lang') === 'en' ? 'en' : 'ar');
