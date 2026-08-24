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
}));

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
  const show = groupActive && select.value === 'other';
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
  return select.value === 'other' ? (input?.value.trim() || (document.documentElement.lang === 'en' ? 'Other' : 'أخرى')) : (select.selectedOptions[0]?.textContent || select.value);
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

// Complete Arabic / English language system
const AR_TO_EN = {
  'تخطي إلى المحتوى':'Skip to content',
  'مجمع نهج الشفاء الطبي العام':'Nahj Al-Shifaa General Medical Complex',
  'رعايتكم أولويتنا':'Your care is our priority',
  'الرئيسية':'Home','عن المجمع':'About Us','الخدمات الطبية':'Medical Services','الرعاية المنزلية':'Home Care','التأمين':'Insurance','خدمات الشركات':'Corporate Services','الفروع':'Branches','تواصل معنا':'Contact Us','الطلبات':'Requests','حجز موعد':'Book Appointment','طلب تعاقد':'Corporate Request','شكوى أو اقتراح':'Complaint or Suggestion',
  'رعاية طبية يومية للأفراد والعائلات والشركات':'Everyday healthcare for individuals, families and businesses',
  'صحتكم تستحق رعاية':'Your health deserves care that is','أقرب، أسرع، أوضح.':'Closer, faster and clearer.',
  'في نهج الشفاء نجمع العيادات والخدمات التشخيصية وإجراءات التأمين وفحوصات الشركات في تجربة واحدة مصممة لتوفير وقتكم وتسهيل رحلتكم الصحية.':'At Nahj Al-Shifaa, clinics, diagnostic services, insurance support and corporate medical examinations come together in one convenient experience designed to save time and simplify your healthcare journey.',
  'ابدأ بحجز موعد':'Book an appointment','اعثر على أقرب فرع':'Find the nearest branch',
  'رعاية متكاملة':'Integrated care','من الكشف إلى التشخيص':'From consultation to diagnosis','إجراءات ميسرة':'Simplified procedures','تجربة أبسط للمراجع':'A smoother patient experience',
  'هدفنا رعايتكم':'Our goal is your care','أكثر من 24 تخصص':'More than 24 specialties','خدمتنا أكثر من 5000 خدمة':'More than 5,000 services delivered','أكثر من 13 شريك تأمين':'More than 13 insurance partners','خدمنا أكثر من 1,000 شركة':'Served more than 1,000 companies','خدمنا أكثر من 100,000 عميل':'Served more than 100,000 clients',
  'رعاية أقرب لمجتمعنا':'Care closer to our community','نهج الشفاء في سطور':'Nahj Al-Shifaa at a glance','منظومة طبية عملية تجعل الوصول للخدمة أسهل':'Practical healthcare designed for easier access',
  'نخدم المراجعين من خلال فرعين في صفوى والخبر، مع باقة من العيادات الأساسية والتخصصية والخدمات المساندة. هدفنا أن يجد المراجع احتياجه الطبي في مكان واحد، بإجراءات منظمة وتواصل واضح من لحظة الاستقبال وحتى إتمام الخدمة.':'We serve patients through two branches in Safwa and Al Khobar, offering essential and specialized clinics along with supporting medical services. Our goal is to make the care you need available in one place, with organized procedures and clear communication from arrival through completion of service.',
  'فريق طبي مؤهل':'Qualified medical team','كوادر بخبرة عملية واهتمام بالتواصل مع المراجع.':'Experienced professionals focused on clear, respectful patient communication.','تنظيم أسرع':'Faster coordination','إجراءات ميسرة لخدمات العيادات والتأمين والفحوصات.':'Streamlined procedures for clinics, insurance and medical examinations.','خدمات متكاملة':'Integrated services','عيادات، مختبر، أشعة، طوارئ وخدمات شركات في وجهة واحدة.':'Clinics, laboratory, radiology, emergency and corporate services in one destination.',
  'التخصصات والخدمات':'Specialties & Services','اختر الخدمة التي تناسب احتياجك':'Choose the service that fits your needs','قسّمنا الخدمات إلى مجموعات واضحة لتصل إلى العيادة أو القسم المطلوب بسرعة، ويمكنك حجز الموعد مباشرة من بطاقة الخدمة.':'Browse services by category to quickly find the clinic or department you need, then book directly from the service card.','الكل':'All','العيادات':'Clinics','التشخيص والفحوصات':'Diagnostics & Examinations','الخدمات المساندة':'Support Services',
  'عيادة الطب العام':'General Medicine Clinic','الرعاية الأولية، تقييم الحالات اليومية والمتابعة العامة.':'Primary care, assessment of common conditions and general follow-up.','عيادة الطب الباطني':'Internal Medicine Clinic','متابعة الأمراض الباطنية والمزمنة وخطط العلاج.':'Assessment and follow-up of internal and chronic conditions and treatment plans.','عيادة النساء والولادة':'Obstetrics & Gynecology Clinic','رعاية صحية للمرأة ومتابعة الحمل والخدمات النسائية.':'Women’s healthcare, pregnancy follow-up and gynecology services.','عيادة الأطفال':'Pediatrics Clinic','متابعة صحة الأطفال والنمو والحالات الشائعة.':'Child health, growth monitoring and care for common pediatric conditions.','عيادة طب الأسنان':'Dental Clinic','فحص وعلاج الأسنان والعناية الوقائية بصحة الفم.':'Dental examinations, treatment and preventive oral care.','عيادة الطوارئ':'Emergency Clinic','تقييم ورعاية الحالات التي تحتاج إلى تدخل عاجل.':'Assessment and care for cases requiring urgent medical attention.','خدمات الإسعاف':'Ambulance Services','دعم نقل الحالات وتنسيق خدمات الإسعاف حسب التوفر والحاجة.':'Patient transport support and ambulance coordination based on availability and medical need.','تواصل لخدمة الإسعاف':'Contact Ambulance Service','قسم المختبر':'Laboratory','تحاليل وفحوصات مخبرية لدعم التشخيص والمتابعة.':'Laboratory tests and investigations supporting diagnosis and follow-up.','طلب الخدمة':'Request Service','قسم الأشعة':'Radiology','خدمات تصوير تشخيصية مساندة لخطة الطبيب.':'Diagnostic imaging services supporting your physician’s care plan.','فحص العمالة والإقامة والرخص':'Employment, Residency & License Medical Exams','فحوصات منظمة وفق المتطلبات والإجراءات المعتمدة.':'Medical examinations organized according to applicable requirements and procedures.','ابدأ الطلب':'Start Request','خدمات صحية مختارة في المنزل لراحة المريض واستمرارية المتابعة.':'Selected healthcare services delivered at home for comfort and continuity of care.','اعرف المزيد':'Learn More','قسم التأمين':'Insurance Department','مساندة المراجعين في إجراءات التأمين والتحقق من التغطية.':'Support with insurance procedures and eligibility verification.','شركاء التأمين':'Insurance Partners','الشركات والتعاقدات المباشرة':'Corporate & Direct Contracts','حلول طبية مرنة للمنشآت والموظفين حسب الاحتياج.':'Flexible healthcare solutions for organizations and employees based on their needs.',

  'عيادة طب العيون':'Ophthalmology Clinic','فحص ومتابعة مشكلات الإبصار وصحة العين وتقييم الحالات الشائعة.':'Eye health, vision assessment and follow-up of common eye conditions.',
  'عيادة الجلدية والتجميل والليزر':'Dermatology, Aesthetics & Laser Clinic','تشخيص وعلاج أمراض الجلد مع خدمات التجميل والليزر وفق تقييم الطبيب.':'Diagnosis and treatment of skin conditions with aesthetic and laser services based on medical assessment.',
  'عيادة الأنف والأذن والحنجرة':'ENT Clinic','تقييم وعلاج مشكلات الأنف والأذن والحنجرة واضطرابات السمع والتنفس.':'Assessment and treatment of ear, nose and throat conditions, including hearing and breathing concerns.',
  'عيادة طب العظام':'Orthopedic Clinic','تشخيص ومتابعة إصابات وآلام العظام والمفاصل والحركة.':'Diagnosis and follow-up of bone, joint and mobility injuries and pain.',
  'عيادة المسالك البولية':'Urology Clinic','تقييم ومتابعة أمراض المسالك البولية وصحة الجهاز البولي.':'Assessment and follow-up of urinary tract and urological conditions.',
  'عيادة طب القلب':'Cardiology Clinic','تقييم ومتابعة صحة القلب وعوامل الخطورة والحالات المزمنة المرتبطة به.':'Heart health assessment, risk-factor management and follow-up of related chronic conditions.',
  'عيادة التغذية':'Nutrition Clinic','تقييم الحالة الغذائية ووضع خطط تغذية مناسبة للأهداف والحالة الصحية.':'Nutritional assessment and personalized nutrition plans based on health needs and goals.',
  'عيادة الجراحة العامة':'General Surgery Clinic','تقييم الحالات الجراحية الشائعة والمتابعة قبل وبعد الإجراءات الجراحية.':'Assessment of common surgical conditions and pre- and post-procedure follow-up.',
  'عيادة طب الأسرة':'Family Medicine Clinic','رعاية شاملة ومستمرة لجميع أفراد الأسرة والوقاية ومتابعة الحالات المزمنة.':'Comprehensive ongoing care for the whole family, including prevention and chronic-condition follow-up.',
  'قسم العيادات المتنقلة':'Mobile Clinics Department','خدمات طبية متنقلة للوصول إلى المنشآت والمواقع حسب نطاق الخدمة والتنسيق المسبق.':'Mobile medical services for organizations and sites, subject to service coverage and prior coordination.',
  'قسم العلاج الطبيعي':'Physiotherapy Department','برامج علاج وتأهيل لتحسين الحركة والوظائف وتقليل الألم وفق تقييم الحالة.':'Therapy and rehabilitation programs to improve movement and function and reduce pain based on assessment.',
  'نكستكير هيلث NEXTCARE':'NEXTCARE Health','مجموعة الخليج للتأمين GIG':'Gulf Insurance Group (GIG)','غلوب مد':'GlobeMed','مدنت العربية السعودية':'MedNet Saudi Arabia','التعاونية للتأمين':'Tawuniya','الاتحاد للتأمين التعاوني':'Al-Etihad Cooperative Insurance','تكافل العربية':'Takaful Al Arabia',
  'رعاية صحية تصل إليكم في المنزل':'Healthcare delivered to your home','نوفر خدمات رعاية منزلية مختارة لتسهيل المتابعة الصحية على المرضى وكبار السن ومن يصعب عليهم زيارة المجمع، مع تنسيق مسبق للخدمة والموعد حسب التوفر ونطاق التغطية.':'We provide selected home healthcare services to make follow-up easier for patients, seniors and those who may find it difficult to visit the medical complex. Services are arranged in advance based on availability and coverage area.','✓ متابعة صحية وتمريضية حسب الحاجة':'✓ Health and nursing follow-up as needed','✓ سحب عينات وفحوصات منزلية عند توفر الخدمة':'✓ Home sample collection and tests when available','✓ تنسيق مواعيد واضح مع الفرع المناسب':'✓ Clear appointment coordination with the appropriate branch','اطلب الرعاية المنزلية':'Request Home Care',
  'لماذا نهج الشفاء؟':'Why Nahj Al-Shifaa?','نركز على التفاصيل التي تصنع فرقاً في يوم المراجع':'We focus on the details that make a real difference','الرعاية الجيدة ليست الكشف فقط. هي وضوح الإجراء، سهولة الوصول، سرعة الخدمة، وفريق يعرف كيف يجعل كل خطوة أبسط.':'Good healthcare is more than a consultation. It means clear procedures, easy access, timely service and a team that makes every step simpler.','كوادر طبية مؤهلة':'Qualified medical professionals','خبرة ومهارة في تقديم الرعاية.':'Experience and skill in delivering care.','إدارة مدربة':'Trained administrative team','تنظيم وتواصل أفضل مع المراجعين.':'Better organization and communication with patients.','سرعة في الخدمة':'Efficient service','تقليل الخطوات وتسهيل الإجراءات.':'Fewer steps and easier procedures.','جودة مستمرة':'Consistent quality','اهتمام بالتجربة وسلامة الخدمة.':'Focus on patient experience and service safety.',
  'نتعامل مع مجموعة من شركات التأمين':'We work with a range of insurance providers','يساعد فريق التأمين في تسهيل إجراءات المراجعة والتحقق من التغطية وفق وثيقة العميل وموافقة شركة التأمين عند الحاجة.':'Our insurance team helps facilitate approvals and verify coverage according to the client’s policy and insurer requirements.','بوبا العربية':'Bupa Arabia','ولاء للتأمين':'Walaa Insurance','ملاذ للتأمين':'Malath Insurance','العناية الشاملة السعودية':'Total Care Saudi (TCS)','اتحاد الخليج':'Gulf Union','الراجحي تكافل':'Al Rajhi Takaful','* تعتمد التغطية الطبية على وثيقة التأمين وفئتها وموافقة شركة التأمين عند الحاجة.':'* Medical coverage depends on the insurance policy, category and insurer approval when required.',
  'حلول للشركات والمنشآت':'Solutions for companies & organizations','شريك طبي يسهّل خدمة موظفيكم':'A medical partner that makes employee care easier','نوفر خيارات للتعاقدات المباشرة وفحوصات الموظفين والعمالة، مع نقطة تواصل واضحة وإجراءات يمكن تنسيقها وفق احتياج المنشأة.':'We offer direct healthcare contracts and employee medical examinations, with a clear point of contact and procedures tailored to your organization’s needs.','اطلب التواصل مع قسم الشركات':'Contact Corporate Services','تعاقدات طبية مباشرة':'Direct medical contracts','فحوصات موظفين وعمالة':'Employee & workforce medical exams','تنسيق احتياجات المنشأة':'Organization needs coordination','تواصل إداري مخصص':'Dedicated administrative contact',
  'فرعان لخدمتكم':'Two branches to serve you','اختر الفرع الأقرب إليك':'Choose your nearest branch','موقعان في المنطقة الشرقية لتسهيل الوصول إلى خدمات نهج الشفاء.':'Two locations in the Eastern Province for easier access to Nahj Al-Shifaa services.','صفوى':'Safwa','فرع الحزم - صفوى':'Al Hazm Branch - Safwa','614، الحزم، صفوى 32714':'614, Al Hazm, Safwa 32714','فتح Google Maps':'Open Google Maps','احجز في هذا الفرع':'Book at this branch','الخبر':'Al Khobar','فرع الجسر - الخبر':'Al Jisr Branch - Al Khobar',
  'نحن أقرب مما تتخيل':'We are closer than you think','للاستفسارات الطبية، التأمين أو خدمات الشركات، تواصل معنا وسنوجهك إلى القسم المناسب.':'For medical inquiries, insurance or corporate services, contact us and we will direct you to the right department.','الهاتف':'Phone','واتساب الحزم':'Al Hazm WhatsApp','واتساب الخبر':'Al Khobar WhatsApp','البريد الإلكتروني':'Email',
  'خدمات طبية وتشخيصية وتأمينية في فرعي صفوى والخبر، مع اهتمام أكبر بسهولة الوصول وجودة التجربة.':'Medical, diagnostic and insurance services at our Safwa and Al Khobar branches, with a strong focus on accessibility and service quality.','نهج الشفاء... رعايتكم صحتنا':'Nahj Al-Shifaa... Your health is our care',
  'خدمة أسرع عبر واتساب':'Faster service via WhatsApp','اختر طلبك، واترك الباقي علينا':'Choose your request, we’ll handle the rest','اختر نوع الطلب وأدخل البيانات الأساسية. سنجهز رسالة واتساب للفرع المختار لتراجعها قبل الإرسال.':'Choose the request type and enter the essential details. We will prepare a WhatsApp message for your selected branch so you can review it before sending.','الاسم':'Name','رقم الجوال':'Mobile Number','الفرع':'Branch','الحزم - صفوى':'Al Hazm - Safwa','الجسر - الخبر':'Al Jisr - Al Khobar','القسم أو العيادة':'Department or Clinic','أخرى':'Other','اكتب القسم أو العيادة':'Enter department or clinic','التاريخ المفضل':'Preferred Date','اسم الشركة':'Company Name','الخدمة المطلوبة':'Required Service','رعاية منزلية للموظفين':'Employee Home Care','اكتب الخدمة المطلوبة':'Enter required service','نوع الرسالة':'Message Type','شكوى':'Complaint','اقتراح':'Suggestion','استفسار':'Inquiry','اكتب نوع الرسالة':'Enter message type','تفاصيل إضافية':'Additional Details','إرسال الطلب عبر واتساب':'Send Request via WhatsApp','سيتم إرسال الطلب إلى رقم واتساب الفرع الذي اخترته.':'The request will be sent to the WhatsApp number of your selected branch.','اختر الفرع للتحدث عبر واتساب':'Choose a branch to chat on WhatsApp','الحزم ·':'Al Hazm ·','الجسر ·':'Al Jisr ·','تحدث معنا الآن':'Chat with us now'
};
const EN_TO_AR = Object.fromEntries(Object.entries(AR_TO_EN).map(([ar,en]) => [en,ar]));
const ATTR_AR_TO_EN = {
  'مجمع نهج الشفاء الطبي العام':'Nahj Al-Shifaa General Medical Complex','شعار مجمع نهج الشفاء الطبي العام':'Nahj Al-Shifaa General Medical Complex logo','القائمة الرئيسية':'Main navigation','فتح القائمة':'Open menu','واجهة مجمع نهج الشفاء الطبي العام':'Nahj Al-Shifaa General Medical Complex building','إحصائيات المجمع':'Medical complex statistics','تصفية التخصصات والخدمات':'Filter specialties and services','شركات التأمين':'Insurance providers','فرع نهج الشفاء في صفوى':'Nahj Al-Shifaa Safwa branch','فرع نهج الشفاء في الخبر':'Nahj Al-Shifaa Al Khobar branch','شعار نهج الشفاء':'Nahj Al-Shifaa logo','روابط سريعة':'Quick links','إغلاق':'Close','اكتب الاسم':'Enter your name','اكتب القسم أو العيادة المطلوبة':'Enter the required department or clinic','اسم الشركة أو المؤسسة':'Company or organization name','اكتب الخدمة المطلوبة':'Enter the required service','اكتب نوع الرسالة':'Enter message type','اكتب أي تفاصيل تساعدنا في خدمتك':'Add any details that will help us serve you','التحدث عبر واتساب':'Chat on WhatsApp','العودة للأعلى':'Back to top'
};
const ATTR_EN_TO_AR = Object.fromEntries(Object.entries(ATTR_AR_TO_EN).map(([ar,en]) => [en,ar]));
const AR_TITLE = 'مجمع نهج الشفاء الطبي العام | رعايتكم أولويتنا';
const EN_TITLE = 'Nahj Al-Shifaa General Medical Complex | Your Care Is Our Priority';
const AR_DESC = 'مجمع نهج الشفاء الطبي العام في صفوى والخبر. عيادات طبية، مختبر، أشعة، طوارئ، فحوصات العمالة والإقامة، خدمات التأمين والشركات.';
const EN_DESC = 'Nahj Al-Shifaa General Medical Complex in Safwa and Al Khobar. Medical clinics, laboratory, radiology, emergency care, workforce medical exams, insurance and corporate services.';

function translateTextNodes(root, toEnglish) {
  const map = toEnglish ? AR_TO_EN : EN_TO_AR;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const raw = node.nodeValue;
    const trimmed = raw.trim();
    if (!trimmed || !map[trimmed]) continue;
    node.nodeValue = raw.replace(trimmed, map[trimmed]);
  }
}
function translateAttributes(toEnglish) {
  const map = toEnglish ? ATTR_AR_TO_EN : ATTR_EN_TO_AR;
  $$('[placeholder],[aria-label],[alt]').forEach(el => {
    ['placeholder','aria-label','alt'].forEach(attr => {
      const current = el.getAttribute(attr);
      if (current && map[current]) el.setAttribute(attr, map[current]);
    });
  });
}
function applyLanguage(lang) {
  const en = lang === 'en';
  document.documentElement.lang = en ? 'en' : 'ar';
  document.documentElement.dir = en ? 'ltr' : 'rtl';
  document.body.classList.toggle('lang-en', en);
  langBtn.textContent = en ? 'AR' : 'EN';
  langBtn.setAttribute('aria-label', en ? 'العربية' : 'English');
  translateTextNodes(document.body, en);
  translateAttributes(en);
  document.title = en ? EN_TITLE : AR_TITLE;
  const meta = $('meta[name="description"]');
  if (meta) meta.setAttribute('content', en ? EN_DESC : AR_DESC);
  localStorage.setItem('nahj-lang', lang);
  otherSelectors.forEach(args => syncOtherField(...args));
}
langBtn?.addEventListener('click', () => applyLanguage(document.documentElement.lang === 'ar' ? 'en' : 'ar'));
applyLanguage(localStorage.getItem('nahj-lang') === 'en' ? 'en' : 'ar');
