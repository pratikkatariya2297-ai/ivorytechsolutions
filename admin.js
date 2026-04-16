// ═══════════════════════════════════════════════════════
//   IVORY TECH SOLUTIONS — ADMIN PORTAL LOGIC
// ═══════════════════════════════════════════════════════

import { dbListenSessions, dbListenLeads, dbListenActivities } from './firebase-service.js';

// Global Cloud Cache
let cloudSessions = [];
let cloudLeads = [];
let cloudActivities = [];


document.addEventListener('DOMContentLoaded', () => {

  // ── 1. AUTHENTICATION ─────────────────────────────
  const authOverlay = document.getElementById('auth-overlay');
  const appContainer = document.getElementById('admin-app');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');

  if (sessionStorage.getItem('admin_logged_in') === 'true') {
    authOverlay.classList.add('hidden');
    appContainer.classList.remove('hidden');
    initCloudListeners();
    try { initCharts(); } catch(e) {}
  }


  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    if (user === 'admin' && pass === 'inafa2026') {
      sessionStorage.setItem('admin_logged_in', 'true');
      authOverlay.classList.add('hidden');
      appContainer.classList.remove('hidden');
      initCloudListeners();
      try { initCharts(); } catch(e) {}
    } else { loginError.textContent = 'Invalid credentials. Access denied.'; }

  });

  logoutBtn.addEventListener('click', () => { sessionStorage.removeItem('admin_logged_in'); window.location.reload(); });

  // ── 2. SPA ROUTING ────────────────────────────────
  const navBtns = document.querySelectorAll('.sidebar-nav .nav-btn');
  const tabs = document.querySelectorAll('.spa-tab');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      tabs.forEach(t => t.classList.add('hidden'));
      btn.classList.add('active');
      document.getElementById(btn.getAttribute('data-tab')).classList.remove('hidden');
      if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
    });
  });
  const mobileToggle = document.getElementById('mobile-sidebar-toggle');
  if (mobileToggle) mobileToggle.addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));

  // ── 3. CLOUD LISTENERS ────────────────────────────
  function initCloudListeners() {
    dbListenSessions((data) => {
      cloudSessions = data;
      console.log('☁️ Real-time Sessions Sync:', data.length);
      updateDashboardMetrics();
      renderTrafficChart();
      renderSessionsList(data);
    });

    dbListenLeads((data) => {
      cloudLeads = data;
      console.log('☁️ Real-time Leads Sync:', data.length);
      updateDashboardMetrics();
      renderLeadsTable(data);
    });

    dbListenActivities((data) => {
      cloudActivities = data;
      updateEngagementLog(data);
    });
  }

  // ── 4. CHARTS & ANALYTICS ────────────────────────────────

  let trafficChartInstance = null;
  
  function renderTrafficChart(range = 7) {
    console.log("Entering renderTrafficChart with range:", range);
    if (typeof Chart === 'undefined') {
        console.error("Chart.js is totally undefined! network blocked it?");
        return;
    }
    const canvas = document.getElementById('trafficChart');
    if (!canvas) {
        console.error("trafficChart canvas NOT Found in DOM!");
        return;
    }
    const ctx = canvas.getContext('2d');
    
    if (trafficChartInstance) {
        trafficChartInstance.destroy();
    }
    
    const gradient = ctx.createLinearGradient(0,0,0,300);
    gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(1, 'rgba(255,255,255,0.1)');
    
    const sessions = cloudSessions.length > 0 ? cloudSessions : JSON.parse(localStorage.getItem('ivory_sessions')||'[]');
    const activities = cloudActivities.length > 0 ? cloudActivities : JSON.parse(localStorage.getItem('ivory_session_activity')||'[]');

    
    const now = new Date();
    const days = []; const counts = []; const uniqueCounts = []; const actionCounts = [];
    
    let loopStart = new Date();
    let loops = 7;
    
    if (typeof range === 'number') {
       loops = range;
       if (loops > 90) loops = 90; 
    } else if (range && range.start && range.end) {
       const startD = new Date(range.start);
       const endD = new Date(range.end);
       const diffTime = Math.abs(endD - startD);
       loops = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
       if (loops > 90) loops = 90; 
       loopStart = endD; 
    }

    for(let i=loops-1; i>=0; i--) {
      const d = new Date(loopStart); d.setDate(d.getDate()-i);
      const str = d.toLocaleDateString();
      days.push(d.toLocaleDateString("en-US", {month: "short", day: "numeric"})); // Cleaner readability
      
      const daySessions = sessions.filter(s => new Date(s.lastActive).toLocaleDateString() === str);
      counts.push(daySessions.length);
      
      const uniqueIps = new Set(daySessions.map(s => s.ip || s.id));
      uniqueCounts.push(uniqueIps.size);
      
      // Sync logic: Only count meaningful interactions (cart/interest) for the 'Interactions' line
      const dayActivities = activities.filter(a => (a.type === 'cart_add' || a.type === 'service_interest') && new Date(a.timestamp).toLocaleDateString() === str);
      actionCounts.push(dayActivities.length);
    }


    trafficChartInstance = new Chart(ctx, {
      type:'bar', 
      data:{ 
        labels:days,
        datasets:[
            {label:'Page Views', data:counts, backgroundColor:gradient, borderRadius:4, borderWidth:0},
            {label:'Unique Visitors', data:uniqueCounts, backgroundColor:'rgba(136, 136, 136, 0.4)', borderRadius:4, borderWidth:0},
            {label:'Interactions', data:actionCounts, backgroundColor:'rgba(46, 213, 115, 0.6)', borderRadius:4, borderWidth:0}
        ]
      },
      options:{
        responsive:true,
        maintainAspectRatio:false,
        plugins:{
            legend:{display:true, labels: {color: '#ccc', font: {family: 'Inter'}}},
            tooltip:{mode: 'index', intersect: false}
        },
        scales:{
            y:{
                beginAtZero:true,
                grid:{color:'rgba(255,255,255,0.05)'},
                ticks:{color:'#888'},
                display: true // Ensure visibility even with low data
            },
            x:{
                grid:{display:false},
                display:true,
                ticks:{color:'#888', maxRotation: 45, minRotation: 0}
            }
        }
      }
    });
    console.log("Chart successfully rendered!");
  }

  function initCharts() {
    console.log("initCharts() triggered!");
    renderTrafficChart(7);
    
    document.getElementById('global-date-filter').addEventListener('change', (e) => {
       updateDashboardMetrics();
    });

    const analyticsFilter = document.getElementById('analytics-date-filter');
    const customInputs = document.getElementById('custom-date-inputs');
    console.log("analyticsFilter element:", analyticsFilter);
    console.log("customInputs element:", customInputs);
    
    if (analyticsFilter) {
      analyticsFilter.addEventListener('change', (e) => {
        let val = e.target.value;
        console.log("analyticsFilter changed to:", val);
        if(customInputs) {
          customInputs.classList.add('hidden');
          customInputs.style.display = 'none';
        }
        
        if (val === 'today') renderTrafficChart(1);
        else if (val === '7') renderTrafficChart(7);
        else if (val === '30') renderTrafficChart(30);
        else if (val === '365') renderTrafficChart(365);
        else if (val === 'all') renderTrafficChart(365);
        else if (val === 'custom') {
           if(customInputs) {
             customInputs.classList.remove('hidden');
             customInputs.style.display = 'flex';
           }
        }
      });
    }
    
    const applyCustom = document.getElementById('apply-custom-date');
    if (applyCustom) {
      applyCustom.addEventListener('click', () => {
         const start = document.getElementById('custom-date-start').value;
         const end = document.getElementById('custom-date-end').value;
         if(start && end) {
            renderTrafficChart({start: start, end: end});
         } else {
            alert('Please select both Start and End dates.');
         }
      });
    }
  }


  function updateDashboardMetrics() {
    const sessions = cloudSessions.length > 0 ? cloudSessions : JSON.parse(localStorage.getItem('ivory_sessions')||'[]');
    const activities = cloudActivities.length > 0 ? cloudActivities : JSON.parse(localStorage.getItem('ivory_session_activity')||'[]');

    
    // View today vs lifetime
    const todayStr = new Date().toLocaleDateString();
    const viewsToday = sessions.filter(s => new Date(s.lastActive).toLocaleDateString() === todayStr).length;
    document.getElementById('views-today').textContent = viewsToday;
    document.getElementById('lifetime-traffic').textContent = sessions.length;
    
    // Active
    const nowTime = Date.now();
    const active = sessions.filter(s => (nowTime - new Date(s.lastActive).getTime()) < 30000).length;
    document.getElementById('dash-active-sessions').textContent = active;
    
    // Cart Adds / Interactions Mapping (High-intent only)
    const trueAdds = activities.filter(a => a.type === 'cart_add' || a.type === 'service_interest').length;
    document.getElementById('total-cart-adds').textContent = trueAdds;


    
    // Top Service (Random actual service logic based on views)
    const services = JSON.parse(localStorage.getItem('ivory_services')||'[]');
    if(services.length > 0) {
      document.getElementById('top-service').textContent = services[0].title;
    } else {
      document.getElementById('top-service').textContent = 'No Services Configured';
    }
    
    const leads = cloudLeads.length > 0 ? cloudLeads : JSON.parse(localStorage.getItem('ivory_leads')||'[]');
    if(leads.length > 0) {
      document.getElementById('top-lead').textContent = leads[0].name || leads[0].email || 'Anonymous';
    } else {
      document.getElementById('top-lead').textContent = 'Waiting for leads...';
    }

    
    updateAnalyticsUI(sessions, leads, trueAdds);
  }
  
  function updateAnalyticsUI(sessions, leads, trueAdds) {
    if(!document.getElementById('devices-referrers-list')) return;
    const m = sessions.filter(s => s.device === 'Mobile').length;
    const d = sessions.filter(s => s.device === 'Desktop').length;
    const total = sessions.length || 1;
    let mP = Math.round((m/total)*100); let dP = Math.round((d/total)*100);
    if(m===0 && d===0) { mP = 50; dP = 50; }
    
    const rfList = document.getElementById('devices-referrers-list');
    rfList.innerHTML = `<li><span>📱 Mobile Users</span><span>${mP}%</span></li><li><span>💻 Desktop Users</span><span>${dP}%</span></li><li><span>🌐 Tracked Sessions</span><span>${sessions.length}</span></li>`;
    
    const funnel = document.getElementById('funnel-viz-container');
    if(funnel) {
        funnel.innerHTML = `<div class="funnel-step f1">Page Views (${sessions.length})</div><div class="funnel-step f2">Adds to Cart (${trueAdds})</div><div class="funnel-step f3">Leads Captured (${leads.length})</div>`;
    }
  }


  // ── 4. SERVICES CRUD ──────────────────────────────
  if (!localStorage.getItem('ivory_services')) localStorage.setItem('ivory_services', JSON.stringify([]));
  if (!localStorage.getItem('ivory_archive')) localStorage.setItem('ivory_archive', JSON.stringify([]));

  function renderServices() {
    const tbody = document.getElementById('services-list-body');
    const services = JSON.parse(localStorage.getItem('ivory_services')||'[]');
    tbody.innerHTML = '';
    services.forEach(svc => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><strong>${svc.title}</strong></td><td>${svc.tags.split(',').map(t=>`<span class="badge badge-lead" style="margin-right:4px">${t.trim()}</span>`).join('')}</td><td><span class="badge badge-active">${svc.status}</span></td><td><button class="small-btn edit-svc-btn" data-id="${svc.id}">Edit</button> <button class="small-btn archive-svc-btn" style="color:var(--danger);border-color:var(--danger)" data-id="${svc.id}">Delete</button></td>`;
      tbody.appendChild(tr);
    });
    attachServiceEvents();
  }

  function renderArchive() {
    const tbody = document.getElementById('archive-list-body');
    const archive = JSON.parse(localStorage.getItem('ivory_archive')||'[]');
    tbody.innerHTML = '';
    archive.forEach(svc => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><strong style="color:var(--text-muted)">${svc.title}</strong></td><td>${svc.deletedAt||'Recently'}</td><td><button class="small-btn republish-svc-btn" style="color:var(--success);border-color:var(--success)" data-id="${svc.id}">Republish</button></td>`;
      tbody.appendChild(tr);
    });
    document.querySelectorAll('.republish-svc-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id=e.target.getAttribute('data-id');
        let archive=JSON.parse(localStorage.getItem('ivory_archive')),active=JSON.parse(localStorage.getItem('ivory_services'));
        const idx=archive.findIndex(i=>i.id===id);
        if(idx>-1){const item=archive.splice(idx,1)[0];item.status='Active';active.push(item);localStorage.setItem('ivory_archive',JSON.stringify(archive));localStorage.setItem('ivory_services',JSON.stringify(active));renderServices();renderArchive();alert('Republished!');}
      });
    });
  }

  const formContainer = document.getElementById('service-form');
  document.getElementById('add-service-btn').addEventListener('click', () => { document.getElementById('edit-service-form').reset(); document.getElementById('service-id').value=''; document.getElementById('image-preview-container').innerHTML=''; formContainer.classList.remove('hidden'); });
  document.querySelector('.cancel-btn').addEventListener('click', () => formContainer.classList.add('hidden'));

  const imageUploader = document.getElementById('service-images');
  let currentBase64Images = [];
  imageUploader.addEventListener('change', (e) => {
    const files = Array.from(e.target.files).slice(0,4);
    currentBase64Images = [];
    document.getElementById('image-preview-container').innerHTML = '';
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const c=document.createElement('canvas');const s=800/img.width;c.width=800;c.height=img.height*s;
          c.getContext('2d').drawImage(img,0,0,c.width,c.height);
          const b64=c.toDataURL('image/jpeg',0.7);
          currentBase64Images.push(b64);
          const prev=document.createElement('img');prev.src=b64;prev.className='preview-thmb';
          document.getElementById('image-preview-container').appendChild(prev);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  });

  document.getElementById('edit-service-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id=document.getElementById('service-id').value||Date.now().toString();
    const title=document.getElementById('service-title').value,tags=document.getElementById('service-category').value,desc=document.getElementById('service-desc').value;
    let services=JSON.parse(localStorage.getItem('ivory_services'));
    const idx=services.findIndex(s=>s.id===id);
    if(idx>-1) services[idx]={id,title,tags,desc,status:'Active',imgs:currentBase64Images.length?currentBase64Images:services[idx].imgs};
    else services.push({id,title,tags,desc,status:'Active',imgs:currentBase64Images});
    localStorage.setItem('ivory_services',JSON.stringify(services));
    formContainer.classList.add('hidden'); renderServices(); alert('Saved & synced!');
  });

  function attachServiceEvents() {
    document.querySelectorAll('.edit-svc-btn').forEach(btn => btn.addEventListener('click', (e) => {
      const svc=JSON.parse(localStorage.getItem('ivory_services')).find(s=>s.id===e.target.getAttribute('data-id'));
      if(svc){document.getElementById('service-id').value=svc.id;document.getElementById('service-title').value=svc.title;document.getElementById('service-category').value=svc.tags;document.getElementById('service-desc').value=svc.desc;currentBase64Images=svc.imgs||[];document.getElementById('image-preview-container').innerHTML='';currentBase64Images.forEach(src=>{const p=document.createElement('img');p.src=src;p.className='preview-thmb';document.getElementById('image-preview-container').appendChild(p);});formContainer.classList.remove('hidden');}
    }));
    document.querySelectorAll('.archive-svc-btn').forEach(btn => btn.addEventListener('click', (e) => {
      if(confirm('Delete this service?')){
        const id=e.target.getAttribute('data-id');let services=JSON.parse(localStorage.getItem('ivory_services')),archive=JSON.parse(localStorage.getItem('ivory_archive'));
        const idx=services.findIndex(i=>i.id===id);
        if(idx>-1){const item=services.splice(idx,1)[0];item.status='Archived';item.deletedAt=new Date().toLocaleDateString();archive.push(item);localStorage.setItem('ivory_services',JSON.stringify(services));localStorage.setItem('ivory_archive',JSON.stringify(archive));renderServices();renderArchive();}
      }
    }));
  }

  
  function handleImageUpload(inputEl, previewContainerId, hiddenInputId) {
    if(!inputEl) return;
    inputEl.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) {
        document.getElementById(previewContainerId).innerHTML = '';
        document.getElementById(hiddenInputId).value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement('canvas'); const s = 800/img.width; c.width = 800; c.height = img.height*s;
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          const b64 = c.toDataURL('image/jpeg', 0.7);
          document.getElementById(previewContainerId).innerHTML = `<img src="${b64}" class="preview-thmb">`;
          document.getElementById(hiddenInputId).value = b64;
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  handleImageUpload(document.getElementById('portfolio-img-file'), 'portfolio-image-preview', 'portfolio-img-data');
  handleImageUpload(document.getElementById('website-img-file'), 'website-image-preview', 'website-img-data');

// ── 5. PORTFOLIO CRUD ─────────────────────────────
  const portfolioForm = document.getElementById('portfolio-form');
  document.getElementById('add-portfolio-btn').addEventListener('click', () => { document.getElementById('edit-portfolio-form').reset(); document.getElementById('portfolio-id').value=''; document.getElementById('portfolio-image-preview').innerHTML=''; document.getElementById('portfolio-img-data').value=''; portfolioForm.classList.remove('hidden'); });
  document.querySelector('.cancel-portfolio-btn').addEventListener('click', () => portfolioForm.classList.add('hidden'));

  function renderPortfolio() {
    const tbody = document.getElementById('portfolio-list-body');
    const items = JSON.parse(localStorage.getItem('ivory_portfolio')||'[]');
    tbody.innerHTML = '';
    items.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><img src="${item.img}" style="width:60px;height:40px;object-fit:cover;border:1px solid var(--border-color)"></td><td><strong>${item.title}</strong></td><td>${item.category}</td><td><button class="small-btn edit-port-btn" data-id="${item.id}">Edit</button> <button class="small-btn del-port-btn" style="color:var(--danger);border-color:var(--danger)" data-id="${item.id}">Delete</button></td>`;
      tbody.appendChild(tr);
    });
    document.querySelectorAll('.edit-port-btn').forEach(btn => btn.addEventListener('click', (e) => {
      const item=JSON.parse(localStorage.getItem('ivory_portfolio')).find(i=>i.id===e.target.getAttribute('data-id'));
      if(item){document.getElementById('portfolio-id').value=item.id;document.getElementById('portfolio-title').value=item.title;document.getElementById('portfolio-category').value=item.category;document.getElementById('portfolio-img-data').value=item.img;document.getElementById('portfolio-image-preview').innerHTML=item.img?`<img src="${item.img}" class="preview-thmb">`:'';document.getElementById('portfolio-link').value=item.link||'';portfolioForm.classList.remove('hidden');}
    }));
    document.querySelectorAll('.del-port-btn').forEach(btn => btn.addEventListener('click', (e) => {
      if(confirm('Remove this portfolio item?')){let items=JSON.parse(localStorage.getItem('ivory_portfolio'));items=items.filter(i=>i.id!==e.target.getAttribute('data-id'));localStorage.setItem('ivory_portfolio',JSON.stringify(items));renderPortfolio();alert('Removed!');}
    }));
  }

  document.getElementById('edit-portfolio-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id=document.getElementById('portfolio-id').value||'p'+Date.now();
    const title=document.getElementById('portfolio-title').value,category=document.getElementById('portfolio-category').value;
    const img=document.getElementById('portfolio-img-data').value,link=document.getElementById('portfolio-link').value||'#';
    let items=JSON.parse(localStorage.getItem('ivory_portfolio')||'[]');
    const idx=items.findIndex(i=>i.id===id);
    if(idx>-1) items[idx]={id,title,category,img,link};
    else items.push({id,title,category,img,link});
    localStorage.setItem('ivory_portfolio',JSON.stringify(items));
    portfolioForm.classList.add('hidden'); renderPortfolio(); alert('Portfolio saved!');
  });

  // ── 6. WEBSITE SHOWCASE CRUD ──────────────────────
  const websiteForm = document.getElementById('website-form');
  document.getElementById('add-website-btn').addEventListener('click', () => { document.getElementById('edit-website-form').reset(); document.getElementById('website-id').value=''; document.getElementById('website-image-preview').innerHTML=''; document.getElementById('website-img-data').value=''; websiteForm.classList.remove('hidden'); });
  document.querySelector('.cancel-website-btn').addEventListener('click', () => websiteForm.classList.add('hidden'));

  function renderWebsites() {
    const tbody = document.getElementById('websites-list-body');
    const sites = JSON.parse(localStorage.getItem('ivory_websites')||'[]');
    tbody.innerHTML = '';
    sites.forEach(site => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><img src="${site.img}" style="width:60px;height:40px;object-fit:cover;border:1px solid var(--border-color)"></td><td><strong>${site.title}</strong></td><td><a href="${site.url}" target="_blank" style="color:var(--text-muted)">${site.url}</a></td><td><button class="small-btn edit-web-btn" data-id="${site.id}">Edit</button> <button class="small-btn del-web-btn" style="color:var(--danger);border-color:var(--danger)" data-id="${site.id}">Delete</button></td>`;
      tbody.appendChild(tr);
    });
    document.querySelectorAll('.edit-web-btn').forEach(btn => btn.addEventListener('click', (e) => {
      const site=JSON.parse(localStorage.getItem('ivory_websites')).find(s=>s.id===e.target.getAttribute('data-id'));
      if(site){document.getElementById('website-id').value=site.id;document.getElementById('website-title').value=site.title;document.getElementById('website-url').value=site.url;document.getElementById('website-desc').value=site.desc;document.getElementById('website-img-data').value=site.img;document.getElementById('website-image-preview').innerHTML=site.img?`<img src="${site.img}" class="preview-thmb">`:'';websiteForm.classList.remove('hidden');}
    }));
    document.querySelectorAll('.del-web-btn').forEach(btn => btn.addEventListener('click', (e) => {
      if(confirm('Remove this website?')){let sites=JSON.parse(localStorage.getItem('ivory_websites'));sites=sites.filter(s=>s.id!==e.target.getAttribute('data-id'));localStorage.setItem('ivory_websites',JSON.stringify(sites));renderWebsites();alert('Removed!');}
    }));
  }

  document.getElementById('edit-website-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id=document.getElementById('website-id').value||'w'+Date.now();
    const title=document.getElementById('website-title').value,url=document.getElementById('website-url').value;
    const desc=document.getElementById('website-desc').value,img=document.getElementById('website-img-data').value;
    let sites=JSON.parse(localStorage.getItem('ivory_websites')||'[]');
    const idx=sites.findIndex(s=>s.id===id);
    if(idx>-1) sites[idx]={id,title,url,desc,img};
    else sites.push({id,title,url,desc,img});
    localStorage.setItem('ivory_websites',JSON.stringify(sites));
    websiteForm.classList.add('hidden'); renderWebsites(); alert('Website saved!');
  });

  // ── 7. LEADS ──────────────────────────────────────
  function renderLeads() {
    const tbody = document.getElementById('leads-list-body');
    const leads = JSON.parse(localStorage.getItem('ivory_leads')||'[]');
    if(leads.length===0) return;
    tbody.innerHTML = '';
    leads.forEach(lead => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><strong>${lead.name||'Anonymous'}</strong></td><td><span class="badge ${lead.type==='B2B Vendor'?'badge-vendor':'badge-lead'}">${lead.type||'Lead'}</span></td><td>${lead.email||'No Email'}</td><td>${lead.device||'Unknown'}</td><td>${lead.date}</td><td>${lead.source||'Contact Form'}</td>`;
      tbody.appendChild(tr);
    });
  }

  
  // ── 7.5 STUDENT LEADS ───────────────────────────────
  function renderStudentLeads() {
    const tbody = document.getElementById('student-leads-list-body');
    if(!tbody) return;
    const leads = JSON.parse(localStorage.getItem('ivory_student_leads')||'[]');
    tbody.innerHTML = '';
    if(leads.length===0){
      tbody.innerHTML='<tr><td colspan="4" style="text-align:center;color:#666">No student enrollments yet.</td></tr>';
      return;
    }
    leads.forEach(lead => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><strong>${lead.name||'Anonymous'}</strong></td><td>${lead.email||'No Email'}</td><td>${lead.phone||'N/A'}</td><td>${lead.date}</td>`;
      tbody.appendChild(tr);
    });
  }

  // ── 8. ENGAGEMENT BLAST ───────────────────────────
  document.getElementById('send-blast-btn').addEventListener('click', () => {
    const msg=document.getElementById('blast-msg').value;
    if(!msg.trim()) return alert('Message cannot be empty.');
    const activeSessions = JSON.parse(localStorage.getItem('ivory_sessions')||'[]').filter(s => s.isActive);
    const btn=document.getElementById('send-blast-btn');
    btn.textContent='Sending...';
    setTimeout(()=>{btn.textContent='✅ Blast Sent to '+activeSessions.length+' Users';setTimeout(()=>btn.textContent='🚀 Send Blast Now',3000);document.getElementById('blast-msg').value='';},1500);
  });

  // ── 9. LIVE SESSIONS & TRACKING ─────────────────────
  function formatDuration(seconds) {
    if (!seconds || seconds < 0) return '0s';
    if (seconds < 60) return seconds + 's';
    if (seconds < 3600) return Math.floor(seconds/60) + 'm ' + (seconds%60) + 's';
    return Math.floor(seconds/3600) + 'h ' + Math.floor((seconds%3600)/60) + 'm';
  }

  function renderSessions() {
    const sessions = JSON.parse(localStorage.getItem('ivory_sessions')||'[]');
    const tbody = document.getElementById('sessions-list-body');
    if (!tbody) return;

    const now = Date.now();
    sessions.forEach(s => {
      const lastActive = new Date(s.lastActive).getTime();
      s._isLive = (now - lastActive) < 30000;
    });

    sessions.sort((a, b) => {
      if (a._isLive && !b._isLive) return -1;
      if (!a._isLive && b._isLive) return 1;
      return new Date(b.lastActive) - new Date(a.lastActive);
    });

    const activeSessions = sessions.filter(s => s._isLive);

    // Metrics
    const el = (id) => document.getElementById(id);
    if (el('active-session-count')) el('active-session-count').textContent = activeSessions.length;
    if (el('total-session-count')) el('total-session-count').textContent = sessions.length;
    if (el('avg-time-on-site') && sessions.length > 0) {
      const avgTime = Math.round(sessions.reduce((sum, s) => sum + (s.timeOnSite||0), 0) / sessions.length);
      el('avg-time-on-site').textContent = formatDuration(avgTime);
    }
    if (el('avg-scroll-depth') && sessions.length > 0) {
      const avgScroll = Math.round(sessions.reduce((sum, s) => sum + (s.scrollDepth||0), 0) / sessions.length);
      el('avg-scroll-depth').textContent = avgScroll + '%';
    }

    // Table
    tbody.innerHTML = '';
    sessions.forEach(s => {
      const tr = document.createElement('tr');
      const statusBadge = s._isLive
        ? '<span class="badge badge-success">● Live</span>'
        : '<span class="badge" style="color:#666;border-color:#333">○ Ended</span>';
      const lastActiveStr = new Date(s.lastActive).toLocaleTimeString();
      tr.innerHTML =
        '<td>'+statusBadge+'</td>'+
        '<td><strong>'+( s.ip||'N/A')+'</strong><br><small style="color:#888">'+(s.city||'')+', '+(s.country||'')+'</small></td>'+
        '<td>'+(s.device||'N/A')+' / '+(s.browser||'N/A')+' '+(s.browserVersion||'')+'</td>'+
        '<td>'+(s.os||'N/A')+'</td>'+
        '<td><small>'+(s.screenRes||'N/A')+'</small></td>'+
        '<td><small>'+(s.referrer||'Direct')+'</small></td>'+
        '<td>'+(s.scrollDepth||0)+'%</td>'+
        '<td>'+(s.clickCount||0)+'</td>'+
        '<td>'+formatDuration(s.timeOnSite||0)+'</td>'+
        '<td><small>'+lastActiveStr+'</small></td>';
      tbody.appendChild(tr);
    });

    // Live visitors list (engagement tab)
    const liveList = document.getElementById('live-visitors-list');
    if (liveList) {
      liveList.innerHTML = '';
      if (activeSessions.length === 0) {
        liveList.innerHTML = '<li style="color:#666">No active visitors right now</li>';
      } else {
        activeSessions.forEach(s => {
          const li = document.createElement('li');
          li.innerHTML = '<span>'+(s.ip||'Unknown')+' ('+(s.device)+') — '+(s.city||'Unknown')+', '+(s.country||'')+' — '+(s.browser)+'</span>';
          liveList.appendChild(li);
        });
      }
    }
  }

  function renderActivityLog() {
    const container = document.getElementById('activity-log-container');
    if (!container) return;
    const activities = JSON.parse(localStorage.getItem('ivory_session_activity')||'[]');
    const recent = activities.slice(-100).reverse();
    if (recent.length === 0) {
      container.innerHTML = '<p style="color:#666">No activity recorded yet. Visit the main site to generate data.</p>';
      return;
    }
    let html = '<table class="data-table" style="font-size:12px"><thead><tr><th>Event</th><th>Details</th><th>Time</th></tr></thead><tbody>';
    recent.forEach(a => {
      const details = a.data ? Object.entries(a.data).map(function(pair){return '<span style="color:#888">'+pair[0]+':</span> '+(pair[1]||'-')}).join(' | ') : '-';
      const time = new Date(a.timestampstamp).toLocaleTimeString();
      html += '<tr><td><strong>'+a.type+'</strong></td><td><small>'+details+'</small></td><td><small>'+time+'</small></td></tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  }

  // Refresh button
  const refreshBtn = document.getElementById('refresh-sessions-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      renderSessions();
      renderActivityLog();
      refreshBtn.textContent = '✅ Refreshed';
      setTimeout(() => refreshBtn.textContent = '🔄 Refresh', 1500);
    });
  }

  // Auto-refresh sessions every 5 seconds
  setInterval(() => {
    renderSessions();
    renderActivityLog();
  }, 5000);

  // ── INITIAL RENDERS ───────────────────────────────
  renderServices();
  renderArchive();
  renderLeads();
  renderStudentLeads();

  renderPortfolio();
  renderWebsites();
  renderSessions();
  renderActivityLog();
try{ updateDashboardMetrics(); }catch(e){}
});


// Load Founder Social settings
function loadSettings() {
    const socials = JSON.parse(localStorage.getItem('ivory_founder_socials') || '{}');
    const inputs = ['pranav-fb', 'pranav-insta', 'pranav-linkedin', 'pratik-fb', 'pratik-insta', 'pratik-linkedin'];
    inputs.forEach(id => {
        const el = document.getElementById('setting-' + id);
        if (el && socials[id]) {
            el.value = (socials[id] !== '#') ? socials[id] : '';
        }
    });
}

function initSettings() {
    loadSettings();
    const saveBtn = document.getElementById('save-social-links-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const inputs = ['pranav-fb', 'pranav-insta', 'pranav-linkedin', 'pratik-fb', 'pratik-insta', 'pratik-linkedin'];
            const socials = {};
            inputs.forEach(id => {
                const el = document.getElementById('setting-' + id);
                socials[id] = (el && el.value.trim()) ? el.value.trim() : '#';
            });
            localStorage.setItem('ivory_founder_socials', JSON.stringify(socials));
            
            // UI Feedback
            const originalText = saveBtn.innerText;
            saveBtn.innerText = 'Saved Successfully!';
            saveBtn.style.background = '#00c853';
            saveBtn.style.color = '#000';
            setTimeout(() => {
                saveBtn.innerText = originalText;
                saveBtn.style.background = '';
                saveBtn.style.color = '';
            }, 2000);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Other initializations...
    setTimeout(initSettings, 500); // Initialize settings bindings
});



// ═══════════════════════════════════════════════════════
//  STUDENT CMS (PHOTOS & SYLLABUS)
// ═══════════════════════════════════════════════════════

function saveStudentData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function getStudentData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function loadStudentCMS() {
  const photos = getStudentData('ivory_student_photos');
  const tbodyPhotos = document.getElementById('cms-photos-list-body');
  if(tbodyPhotos) {
    if(photos.length === 0) {
      tbodyPhotos.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:1rem; color:var(--text-dim);">No photos added yet. Default images will be shown on the live site.</td></tr>';
    } else {
      tbodyPhotos.innerHTML = photos.map((p, i) => `
        <tr>
          <td><img src="${p}" alt="Photo" style="width:100px; height:60px; object-fit:cover; border-radius:4px;"></td>
          <td>${Math.round(p.length / 1024)} KB</td>
          <td><button onclick="deleteStudentPhoto(${i})" class="nav-btn danger">Delete</button></td>
        </tr>
      `).join('');
    }
  }

  const syllabus = getStudentData('ivory_student_syllabus');
  const tbodySyllabus = document.getElementById('cms-syllabus-list-body');
  if(tbodySyllabus) {
    if(syllabus.length === 0) {
      tbodySyllabus.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:1rem; color:var(--text-dim);">No modules added. Default syllabus will be shown on the live site.</td></tr>';
    } else {
      tbodySyllabus.innerHTML = syllabus.map((s, i) => `
        <tr>
          <td>${s.num}</td>
          <td>${s.title}</td>
          <td><button onclick="deleteSyllabusModule(${i})" class="nav-btn danger">Delete</button></td>
        </tr>
      `).join('');
    }
  }
}

async function uploadStudentPhoto() {
  const fileInput = document.getElementById('cms-photo-upload');
  if (!fileInput.files.length) {
    alert("Please select an image file first.");
    return;
  }
  const file = fileInput.files[0];
  try {
    const base64 = await resizeAndCompressImage(file, 1200, 0.8);
    let photos = getStudentData('ivory_student_photos');
    photos.push(base64);
    saveStudentData('ivory_student_photos', photos);
    fileInput.value = '';
    loadStudentCMS();
  } catch (err) {
    console.error(err);
    alert("Failed to process image.");
  }
}

function deleteStudentPhoto(i) {
  if (confirm("Remove this photo from the Student gallery?")) {
    let photos = getStudentData('ivory_student_photos');
    photos.splice(i, 1);
    saveStudentData('ivory_student_photos', photos);
    loadStudentCMS();
  }
}

function addSyllabusModule() {
  const num = document.getElementById('cms-syllabus-num').value.trim();
  const title = document.getElementById('cms-syllabus-title').value.trim();
  const desc = document.getElementById('cms-syllabus-desc').value.trim();
  
  if(!num || !title || !desc) {
    alert("Please fill in all syllabus fields.");
    return;
  }
  
  let syllabus = getStudentData('ivory_student_syllabus');
  syllabus.push({ num, title, desc });
  saveStudentData('ivory_student_syllabus', syllabus);
  
  document.getElementById('cms-syllabus-num').value = '';
  document.getElementById('cms-syllabus-title').value = '';
  document.getElementById('cms-syllabus-desc').value = '';
  loadStudentCMS();
}

function deleteSyllabusModule(i) {
  if (confirm("Remove this syllabus module?")) {
    let syllabus = getStudentData('ivory_student_syllabus');
    syllabus.splice(i, 1);
    saveStudentData('ivory_student_syllabus', syllabus);
    loadStudentCMS();
  }
}
function renderStudentLeads() {
    const tbody = document.getElementById('student-leads-list-body');
    if (!tbody) return;
    const leads = JSON.parse(localStorage.getItem('ivory_student_leads') || '[]');
    tbody.innerHTML = '';
    if (leads.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#666">No application data yet.</td></tr>';
      return;
    }
    leads.forEach(lead => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><strong>${lead.name||'Anonymous'}</strong></td><td>${lead.email||'No Email'}</td><td>${lead.phone||'N/A'}</td><td>${lead.date||'N/A'}</td>`;
      tbody.appendChild(tr);
    });
  }
