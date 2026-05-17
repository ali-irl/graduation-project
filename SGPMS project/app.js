/* ════════════════════════════════════════
   SGPMS – app.js  |  All dashboard logic
   ════════════════════════════════════════ */

/* ─── State ─── */
let currentRole = null;

/* ─── Data ─── */
const supervisors = [
  { id: 1, name: 'Dr. Deya Al-Zoubi', initials: 'DA', area: 'AI & Machine Learning', groups: 3, max: 5 },
  { id: 2, name: 'Dr. Rami Hassan', initials: 'RH', area: 'Software Engineering', groups: 4, max: 5 },
  { id: 3, name: 'Dr. Sara Khalil', initials: 'SK', area: 'Data Science & Analytics', groups: 2, max: 4 },
  { id: 4, name: 'Dr. Omar Nasser', initials: 'ON', area: 'Cybersecurity & Networks', groups: 5, max: 5 },
  { id: 5, name: 'Dr. Lina Al-Faouri', initials: 'LF', area: 'Web & Mobile Development', groups: 1, max: 4 },
  { id: 6, name: 'Dr. Khaled Mansour', initials: 'KM', area: 'Database Systems', groups: 3, max: 5 },
];

const requests = [
  { id: 1, group: 'Team Alpha', project: 'Smart Library System', supervisor: 'Dr. Deya Al-Zoubi', date: '2025-10-20', status: 'approved' },
  { id: 2, group: 'Team Beta', project: 'AI Health Monitor', supervisor: 'Dr. Sara Khalil', date: '2025-10-22', status: 'pending' },
  { id: 3, group: 'Team Gamma', project: 'Campus Navigation App', supervisor: 'Dr. Rami Hassan', date: '2025-10-25', status: 'rejected' },
  { id: 4, group: 'Team Delta', project: 'E-Learning Platform', supervisor: 'Dr. Lina Al-Faouri', date: '2025-11-01', status: 'pending' },
  { id: 5, group: 'Team Epsilon', project: 'Blockchain Voting System', supervisor: 'Dr. Omar Nasser', date: '2025-11-05', status: 'approved' },
];

/* ─── Data ─── */
const meetings = [
  { id: 1, title: 'Weekly Progress Check', date: '2025-12-08', time: '10:00 AM', link: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_MTk3...', group: 'Team Alpha' },
  { id: 2, title: 'Midpoint Review', date: '2025-12-15', time: '11:30 AM', link: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_N2Ew...', group: 'Team Alpha' },
  { id: 3, title: 'Final Presentation Prep', date: '2025-12-22', time: '02:00 PM', link: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_ZWFl...', group: 'Team Alpha' },
];

const myProgress = {
  percent: 68, phase: 'System Design', milestones: [
    { label: 'Project Registration', done: true, date: 'Oct 20' },
    { label: 'Literature Review', done: true, date: 'Nov 04' },
    { label: 'Requirement Analysis', done: true, date: 'Nov 18' },
    { label: 'System Design', done: false, date: 'Dec 10' },
    { label: 'Implementation', done: false, date: 'Jan 15' },
    { label: 'Testing & Deployment', done: false, date: 'Feb 05' },
  ]
};

const doctorGroups = [
  { id: 1, name: 'Team Alpha', project: 'Smart Library System', members: ['Ali Ahmed', 'Hamza Al-Omari', 'Abdullah Al-Swalmha'], progress: 68, status: 'ongoing' },
  { id: 2, name: 'Team Epsilon', project: 'Blockchain Voting System', members: ['Omar Nour', 'Sara Qasim'], progress: 42, status: 'ongoing' },
  { id: 3, name: 'Team Zeta', project: 'AI Crop Disease Detection', members: ['Khalid Ali', 'Nour Hasan', 'Rana Younis'], progress: 90, status: 'ongoing' },
];

const aiSuggestMap = {
  'ai': ['Smart Graduation Project Management System', 'AI-powered Adaptive Learning Platform', 'Automated Skin Disease Detection via Deep Learning'],
  'web': ['Real-time Collaborative Code Editor', 'University Event Management Portal', 'Smart Campus Navigation Web App'],
  'security': ['Blockchain-Based Digital Identity Verification', 'Intrusion Detection System Using ML', 'Zero-Trust Network Monitoring Dashboard'],
  'data': ['Predictive Analytics for Student Performance', 'Business Intelligence Dashboard for SMEs', 'NLP-Based Arabic Sentiment Analysis Tool'],
  'mobile': ['AR Campus Guide Mobile App', 'Smart Parking Finder App', 'University Mental Health Support App'],
};

const aiProjects = [
  'Smart Campus Navigation',
  'Online Exam Proctoring System',
  'Arabic NLP Chatbot',
  'Blockchain Academic Records'
];

const myFilesData = {
  storageUsed: '5.14 MB',
  storageTotal: '100 MB',
  storagePercent: 5,
  uploadedFiles: [
    { name: 'Project_Proposal.pdf', type: 'PDF', size: '1.2 MB', date: 'Oct 20' },
    { name: 'Requirements_SRS.docx', type: 'DOCX', size: '840 KB', date: 'Nov 10' },
    { name: 'System_Design.pptx', type: 'PPTX', size: '3.1 MB', date: 'Dec 01' }
  ],
  requiredDocs: [
    { label: 'Project Proposal', done: true },
    { label: 'SRS Document', done: true },
    { label: 'Design Document', done: false },
    { label: 'Final Report', done: false },
    { label: 'Presentation Slides', done: false }
  ]
};

const dashboardStats = {
  projectName: 'Smart Graduation PM',
  supervisorName: 'Dr. Deya Al-Zoubi',
  progressPercent: 68,
  nextMeetingDate: 'Dec 8, 10:00 AM'
};

const doctorDashboardData = {
  stats: { groups: 3, students: 11, meetings: 2, notifications: 4 },
  notifications: [
    { msg: 'Team Alpha submitted weekly progress report', time: '2h ago' },
    { msg: 'New group Team Theta assigned to you', time: '5h ago' },
    { msg: 'Team Epsilon uploaded project files', time: 'Yesterday' },
    { msg: 'Department Head approved Team Zeta', time: '2 days ago' },
  ]
};

const doctorFeedbackHistory = [
  { g: 'Team Alpha', d: 'Dec 02', fb: 'Finalize ER diagram before next meeting.', ph: 'System Design' },
  { g: 'Team Alpha', d: 'Nov 18', fb: 'Literature review is solid. Good references cited.', ph: 'Literature Review' },
  { g: 'Team Epsilon', d: 'Nov 30', fb: 'Blockchain architecture needs more detail.', ph: 'Requirement Analysis' },
  { g: 'Team Zeta', d: 'Dec 01', fb: 'AI model training results look promising.', ph: 'Implementation' },
];

const adminStudentsList = [
  { id: '202310001', n: 'Ali Ahmed', m: 'CIS', g: 'Team Alpha', s: 'Dr. Deya Al-Zoubi', st: 'approved' },
  { id: '202310002', n: 'Hamza Al-Omari', m: 'CIS', g: 'Team Alpha', s: 'Dr. Deya Al-Zoubi', st: 'approved' },
  { id: '202310003', n: 'Abdullah Al-Swalmha', m: 'CIS', g: 'Team Alpha', s: 'Dr. Deya Al-Zoubi', st: 'approved' },
  { id: '202310004', n: 'Obada Al-Krnaz', m: 'CIS', g: 'Team Alpha', s: 'Dr. Deya Al-Zoubi', st: 'approved' },
  { id: '202310005', n: 'Mohammad Alsouliman', m: 'CIS', g: 'Team Alpha', s: 'Dr. Deya Al-Zoubi', st: 'approved' },
  { id: '202310006', n: 'Sara Qasim', m: 'CS', g: 'Team Epsilon', s: 'Dr. Omar Nasser', st: 'approved' },
  { id: '202310007', n: 'Khalid Ali', m: 'SE', g: 'Team Zeta', s: 'Dr. Deya Al-Zoubi', st: 'approved' },
  { id: '202310008', n: 'Nour Hassan', m: 'IT', g: 'Team Beta', s: 'Dr. Sara Khalil', st: 'pending' },
];

window.addEventListener('DOMContentLoaded', () => {
  const savedRole = sessionStorage.getItem('currentUserRole');

  if (savedRole) {
    currentRole = savedRole;
    updateSidebarUI(); // تحديث الاسم من الجلسة المحفوظة

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    const pageElement = document.getElementById('page-' + currentRole);
    if (pageElement) pageElement.classList.add('active');

    if (currentRole === 'student') renderStudentDashboard();
    if (currentRole === 'doctor') renderDoctorDashboard();
    if (currentRole === 'admin') renderAdminDashboard();
  }
});

// هذا الرابط رح نغيره بس الشباب يعطونا الرابط الحقيقي تبع APEX

const API_BASE_URL = 'http://127.0.0.1:5000/api/';
/**
 * دالة مركزية للتخاطب مع قاعدة البيانات
 * @param {string} endpoint - اسم الرابط الفرعي (مثلاً: 'students' أو 'requests')
 * @param {string} method - نوع الطلب (GET لجلب الداتا, POST لإرسال داتا)
 * @param {object} body - البيانات اللي بدنا نبعثها (في حالة الـ POST)
 */
async function apiCall(endpoint, method = 'GET', body = null) {
  const url = API_BASE_URL + endpoint;

  // تجهيز إعدادات الطلب
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json'
      // لاحقاً رح نضيف هون الـ Token تبع تسجيل الدخول للحماية
      // 'Authorization': 'Bearer ' + sessionStorage.getItem('token') 
    }
  };

  // إذا كنا بنبعث بيانات (زي فورم إضافة طالب)، بنحولها لـ JSON
  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    // إذا السيرفر رجع خطأ (مثلاً 404 أو 500)
    if (!response.ok) {
      throw new Error(`Server Error: ${response.status}`);
    }

    const data = await response.json();

    // أوراكل APEX دائماً بيرجع البيانات جوا مصفوفة اسمها items، فبنسحبها مباشرة
    return data;

  } catch (error) {
    console.error(`🚨 API Error [${endpoint}]:`, error);
    // إشهار رسالة خطأ للمستخدم بدون ما يعلق الموقع
    showToast('danger', 'Connection Failed', 'Unable to reach the server.');
    throw error;
  }
}

/* ─────────────────────────────────────── */
/*  LANDING / LOGIN                        */
/* ─────────────────────────────────────── */
function showLogin(role) {
  currentRole = role;
  const modal = document.getElementById('login-modal');
  const icon = document.getElementById('login-icon');
  const title = document.getElementById('login-title');
  const sub = document.getElementById('login-subtitle');
  const iconMap = { student: 'bi-person-graduation', doctor: 'bi-person-badge', admin: 'bi-shield-check' };
  const bgMap = { student: 'var(--primary)', doctor: 'var(--doc-accent)', admin: 'var(--admin-accent)' };
  const titleMap = { student: 'Student Portal', doctor: 'Supervisor Portal', admin: 'Admin Portal' };
  const subMap = {
    student: 'Sign in with your university credentials',
    doctor: 'Sign in to manage your project groups',
    admin: 'Sign in for administrative access',
  };
  icon.innerHTML = `<i class="bi ${iconMap[role]}"></i>`;
  icon.style.background = bgMap[role];
  title.textContent = titleMap[role];
  sub.textContent = subMap[role];
  modal.style.display = 'flex';
}

function closeLogin() {
  document.getElementById('login-modal').style.display = 'none';
}

// خلينا الدالة async عشان تقدر تستنى الرد من السيرفر
async function doLogin() {
  const userId = document.getElementById('login-id').value;
  const userPass = document.getElementById('login-pass').value;

  // 1. فحص إذا الحقول فاضية
  if (userId.trim() === '' || userPass.trim() === '') {
    showToast('warning', 'Missing Fields', 'Please enter both your University ID and password.');
    return;
  }

  // 2. فحص جديد: التأكد إن كلمة السر عبارة عن 6 أرقام فقط
  const passRegex = /^\d{6}$/;
  if (!passRegex.test(userPass)) {
    showToast('warning', 'Invalid Password', 'Password must be exactly 6 digits (e.g. 165555).');
    return;
  }

  // 3. إظهار رسالة جاري التحميل
  showToast('info', 'Authenticating...', 'Checking credentials...');

  try {
    // 4. إرسال بيانات الدخول لسيرفر البايثون
    const response = await apiCall('login', 'POST', {
      id: userId,
      password: userPass,
      role: currentRole // نبعث الصلاحية اللي اختارها (طالب، دكتور، أدمن)
    });

    // 5. إذا السيرفر رد بنجاح (الرقم السري صح)
    if (response.status === 'success') {
      const user = response.user;

      // حفظ بيانات المستخدم في المتصفح عشان ما تضيع لو عمل ريفرش
      sessionStorage.setItem('currentUserRole', currentRole);
      sessionStorage.setItem('currentUserName', user.name);
      sessionStorage.setItem('currentUserInitials', user.initials);

      // تحديث القائمة الجانبية (Sidebar) بالاسم الحقيقي!
      updateSidebarUI();

      // الدخول وتغيير الشاشات
      closeLogin();
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById('page-' + currentRole).classList.add('active');

      if (currentRole === 'student') renderStudentDashboard();
      if (currentRole === 'doctor') renderDoctorDashboard();
      if (currentRole === 'admin') renderAdminDashboard();

      // تنظيف الحقول
      document.getElementById('login-id').value = '';
      document.getElementById('login-pass').value = '';

      showToast('success', 'Welcome back!', `Logged in as ${user.name}`);
    } else {
      // إذا الباسورد غلط
      showToast('danger', 'Login Failed', response.message);
    }
  } catch (error) {
    // إذا السيرفر طافي أو في مشكلة بالاتصال
    showToast('danger', 'Connection Error', 'Could not connect to the authentication server.');
  }
}
// دالة صغيرة بتحدث الاسم والصورة في القائمة الجانبية بناءً على اللي دخل
function updateSidebarUI() {
  const role = sessionStorage.getItem('currentUserRole');
  const name = sessionStorage.getItem('currentUserName');
  const initials = sessionStorage.getItem('currentUserInitials');

  if (!role || !name) return;

  if (role === 'student') {
    document.getElementById('student-name-display').textContent = name;
    document.getElementById('student-avatar-display').textContent = initials;
  } else if (role === 'doctor') {
    document.getElementById('doc-name-display').textContent = name;
    document.getElementById('doc-avatar-display').textContent = initials;
  } else if (role === 'admin') {
    document.getElementById('admin-name-display').textContent = name;
    document.getElementById('admin-avatar-display').textContent = initials;
  }
}

async function logout() {
  // 1. نطلع رسالة للمستخدم إنه جاري تسجيل الخروج
  showToast('info', 'Logging out...', 'Securely closing your session.');

  // 2. محاكاة وقت الاتصال بالسيرفر لإغلاق الجلسة (مثلاً 800 جزء من الثانية)
  await new Promise(resolve => setTimeout(resolve, 800));

  // مسح الجلسة (الختم) من ذاكرة المتصفح
  sessionStorage.removeItem('currentUserRole');

  // 3. الكود الأصلي تبعك لإخفاء الشاشات والرجوع لشاشة البداية
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-landing').classList.add('active');
  currentRole = null;

  // 4. رسالة توديع لطيفة بعد ما يرجع للصفحة الرئيسية
  showToast('success', 'Signed out', 'See you next time!');
}

/* ─────────────────────────────────────── */
/*  STUDENT SECTIONS                       */
/* ─────────────────────────────────────── */
function showStudentSection(section, el) {
  document.querySelectorAll('#student-sidebar .nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  const fn = {
    dashboard: studentDashboard,
    supervisors: studentSupervisors,
    register: studentRegister,
    progress: studentProgress,
    meetings: studentMeetings,
    ai: studentAI,
    files: studentFiles,
  };
  document.getElementById('student-content').innerHTML = fn[section]?.() || '';
  initSection(section);
}

function renderStudentDashboard() {
  const dashboardTab = document.querySelector('#student-sidebar .nav-item');
  showStudentSection('dashboard', dashboardTab);
}

// 1. الدالة الأولى: رسم العنوان ودائرة التحميل فوراً
function studentDashboard() {
  loadDashboardData(); // استدعاء جلب البيانات

  return `
  <div class="page-header">
    <div class="page-title">Welcome back, Ali 👋</div>
    <div class="page-sub mt-1">Computer Information Systems · Jordan University of Science and Technology</div>
  </div>
  
  <!-- حاوية دائرة التحميل -->
  <div id="dashboard-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

// 2. الدالة الثانية: جلب البيانات (مجمعة) ورسم الداش بورد
async function loadDashboardData() {
  try {
    const data = await fetchMockData({
      stats: dashboardStats,
      prog: myProgress,
      meets: meetings
    });

    const contentHtml = `
      <div class="row g-4 mb-4">
        ${statCard('bi-file-earmark-check-fill', 'My Project', data.stats.projectName, 'blue')}
        ${statCard('bi-person-badge-fill', 'Supervisor', data.stats.supervisorName, 'gold')}
        ${statCard('bi-bar-chart-fill', 'Progress', data.stats.progressPercent + '% Complete', 'green')}
        ${statCard('bi-calendar-check-fill', 'Next Meeting', data.stats.nextMeetingDate, 'purple')}
      </div>
      <div class="row g-4">
        <div class="col-lg-7">
          <div class="card-sgpms p-4">
            <div class="section-header mb-3">
              <div class="fw-bold" style="font-size:1rem">Project Progress</div>
              <span class="badge-status badge-ongoing">Ongoing</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted small">Current Phase: <strong>${data.prog.phase}</strong></span>
              <span class="fw-bold" style="color:var(--primary)">${data.prog.percent}%</span>
            </div>
            <div class="progress-sgpms mb-4"><div class="bar" style="width:${data.prog.percent}%"></div></div>
            <div class="fw-semibold mb-3" style="font-size:0.9rem;color:var(--muted);letter-spacing:0.5px;text-transform:uppercase">Milestones</div>
            ${data.prog.milestones.map((m, i) => `
              <div class="timeline-item">
                <div class="timeline-dot" style="${m.done ? 'background:var(--success)' : 'background:var(--border)'}"></div>
                <div class="flex-1">
                  <div class="d-flex justify-content-between">
                    <span class="fw-${m.done ? '600' : '500'}" style="color:${m.done ? 'var(--text)' : 'var(--muted)'}">${m.label}</span>
                    <span class="text-xs text-muted">${m.date}</span>
                  </div>
                  ${m.done ? '<div class="text-xs" style="color:var(--success)"><i class="bi bi-check-circle-fill me-1"></i>Completed</div>' : ''}
                </div>
              </div>`).join('')}
          </div>
        </div>
        <div class="col-lg-5">
          <div class="card-sgpms p-4 mb-4">
            <div class="fw-bold mb-3">Upcoming Meetings</div>
            <div class="d-flex flex-column gap-3">
              ${data.meets.map(m => `
                <div class="d-flex align-items-center gap-3 p-2 rounded-3" style="background:var(--bg)">
                  <div style="width:44px;height:44px;border-radius:10px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;flex-shrink:0;line-height:1.2;text-align:center">${m.date.slice(5, 7)}/${m.date.slice(8)}</div>
                  <div>
                    <div class="fw-600" style="font-size:0.88rem">${m.title}</div>
                    <div class="text-muted text-xs">${m.time}</div>
                  </div>
                  <a href="${m.link}" target="_blank" class="ms-auto btn-sm-icon text-decoration-none">
                    <i class="bi bi-microsoft-teams" style="color: #5558af;"></i>
                  </a>
                </div>`).join('')}
            </div>
          </div>
          <div class="card-sgpms p-4">
            <div class="fw-bold mb-3">Quick Actions</div>
            <div class="d-flex flex-column gap-2">
              <button class="btn btn-sm text-start d-flex align-items-center gap-2" style="background:var(--bg);border-radius:10px;padding:12px 14px" onclick="showStudentSection('ai',null)">
                <i class="bi bi-robot" style="color:var(--accent)"></i><span>Generate Project Ideas with AI</span>
              </button>
              <button class="btn btn-sm text-start d-flex align-items-center gap-2" style="background:var(--bg);border-radius:10px;padding:12px 14px" onclick="showStudentSection('files',null)">
                <i class="bi bi-upload" style="color:var(--primary)"></i><span>Upload Project Files</span>
              </button>
              <button class="btn btn-sm text-start d-flex align-items-center gap-2" style="background:var(--bg);border-radius:10px;padding:12px 14px" onclick="showStudentSection('supervisors',null)">
                <i class="bi bi-people" style="color:var(--doc-accent)"></i><span>View Supervisors</span>
              </button>
            </div>
          </div>
        </div>
      </div>`;

    const container = document.getElementById('dashboard-container');
    if (container) {
      container.className = '';
      container.innerHTML = contentHtml;
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
  }
}
// 1. الدالة اللي بترسم الشاشة ودائرة التحميل للطالب
function studentSupervisors() {
  loadSupervisorsData(); // استدعاء جلب البيانات

  return `
  <div class="page-header">
    <div class="page-title">Available Supervisors</div>
    <div class="page-sub mt-1">Browse and select your graduation project supervisor</div>
  </div>
  <!-- دائرة التحميل اللي بتعتمد على الـ CSS اللي ضفته إنت -->
  <div id="supervisors-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

// 2. دالة جلب البيانات اللي بتستخدم (الدالة العامة للمحاكاة)
async function loadSupervisorsData() {
  try {
    // التعديل السحري هون: صرنا نستخدم الدالة العامة وبعثنالها مصفوفة الدكاترة
    const data = await apiCall('supervisors');

    // تجهيز كروت الدكاترة
    const cardsHtml = data.map(s => {
      const pct = Math.round(s.groups / s.max * 100);
      const fillClass = pct >= 100 ? 'fill-high' : pct >= 60 ? 'fill-mid' : 'fill-low';
      const available = s.groups < s.max;
      return `
      <div class="col-md-6 col-lg-4">
        <div class="sup-card">
          <div class="d-flex align-items-center gap-3">
            <div class="sup-avatar">${s.initials}</div>
            <div>
              <div class="sup-name">${s.name}</div>
              <div class="sup-area">${s.area}</div>
            </div>
          </div>
          <div>
            <div class="d-flex justify-content-between mb-1">
              <span class="text-xs text-muted">Groups Assigned</span>
              <span class="text-xs fw-semibold">${s.groups}/${s.max}</span>
            </div>
            <div class="sup-cap-bar"><div class="fill ${fillClass}" style="width:${pct}%"></div></div>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-1">
            <span class="chip"><i class="bi bi-circle-fill me-1" style="font-size:0.5rem;color:${available ? 'var(--success)' : 'var(--danger)'}"></i>${available ? 'Available' : 'Full'}</span>
            <button class="btn-primary-sgpms btn-sm ${!available ? 'disabled' : ''}" onclick="showStudentSection('register',null)" ${!available ? 'disabled' : ''}>
              Select <i class="bi bi-arrow-right ms-1"></i>
            </button>
          </div>
        </div>
      </div>`;
    }).join('');

    // إخفاء التحميل وعرض الكروت
    const container = document.getElementById('supervisors-container');
    if (container) {
      container.className = 'row g-4';
      container.innerHTML = cardsHtml;
      initSection('supervisors');
    }
  } catch (error) {
    const container = document.getElementById('supervisors-container');
    if (container) {
      container.innerHTML = '<div class="alert alert-danger w-100">Failed to load supervisors.</div>';
    }
  }
}

// 1. الدالة الأولى: رسم العنوان ودائرة التحميل
function studentRegister() {
  loadRegistrationData(); // استدعاء جلب البيانات

  return `
  <div class="page-header">
    <div class="page-title">Project Registration</div>
    <div class="page-sub mt-1">Submit your graduation project request to the department</div>
  </div>
  
  <!-- حاوية دائرة التحميل -->
  <div id="register-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

// 2. الدالة الثانية: جلب البيانات (الدكاترة من قاعدة البيانات + الطلبات) ورسم الشاشة
async function loadRegistrationData() {
  try {
    // 1. جلب قائمة المشرفين من قاعدة البيانات الحقيقية باستخدام الـ API
    const dbSupervisors = await apiCall('supervisors');

    // 2. جلب حالة الطلبات السابقة (خليناها Mock حالياً لحين ربطها بالـ API لاحقاً)
    const reqs = await fetchMockData(requests);

    // 3. بناء كود الـ HTML واستخدام dbSupervisors للقائمة المنسدلة، و reqs لحالة الطلبات
    const contentHtml = `
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card-sgpms p-4">
            <h6 class="fw-bold mb-4" style="color:var(--primary)"><i class="bi bi-file-earmark-plus me-2"></i>New Project Registration Form</h6>
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Project Title</label>
                <input id="reg-title" class="form-control" placeholder="e.g. Smart Graduation Project Management System" />
              </div>
              <div class="col-12">
                <label class="form-label">Project Description</label>
                <textarea id="reg-desc" class="form-control" rows="4" placeholder="Describe your project idea, objectives, and expected outcomes..."></textarea>
              </div>
              <div class="col-md-6">
                <label class="form-label">Select Supervisor</label>
                <select id="reg-supervisor" class="form-select">
                  <option value="">-- Choose a Doctor --</option>
                  ${dbSupervisors.map(s => `<option value="${s.id}">${s.name} (${s.area})</option>`).join('')}
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Academic Year</label>
                <select class="form-select"><option>2024/2025 – Semester 1</option><option>2024/2025 – Semester 2</option></select>
              </div>
              <div class="col-12">
                <label class="form-label">Team Members (University IDs, comma-separated)</label>
                <input class="form-control" placeholder="e.g. 202310001, 202310002, 202310003" />
              </div>

              <div class="col-12">
                <label class="form-label">Technical Stack / Tools Planned</label>
                <input class="form-control" placeholder="e.g. React, Node.js, SQL Server, Python" />
              </div>
              <div class="col-12 mt-2">
                <button class="btn-primary-sgpms" onclick="submitRegistration()">
                  <i class="bi bi-send me-2"></i>Submit Registration Request
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card-sgpms p-4 mb-4" style="border-left:4px solid var(--accent)">
            <h6 class="fw-bold mb-3"><i class="bi bi-info-circle me-2" style="color:var(--accent)"></i>Submission Guidelines</h6>
            <ul class="list-unstyled d-flex flex-column gap-2" style="font-size:0.88rem;color:var(--muted)">
              <li><i class="bi bi-check2 me-2" style="color:var(--success)"></i>Each group may have 2–5 members</li>
              <li><i class="bi bi-check2 me-2" style="color:var(--success)"></i>Choose a supervisor with available capacity</li>
              <li><i class="bi bi-check2 me-2" style="color:var(--success)"></i>Project must be original and academic</li>
              <li><i class="bi bi-check2 me-2" style="color:var(--success)"></i>Provide a clear and detailed description</li>
              <li><i class="bi bi-exclamation-triangle me-2" style="color:var(--warning)"></i>Department Head will review within 5 days</li>
            </ul>
          </div>
          <div class="card-sgpms p-4">
            <h6 class="fw-bold mb-3">My Submission Status</h6>
            <div class="d-flex flex-column gap-3">
              ${reqs.slice(0, 2).map(r => `
                <div class="p-3 rounded-3" style="background:var(--bg)">
                  <div class="fw-semibold" style="font-size:0.88rem">${r.project}</div>
                  <div class="text-xs text-muted mb-2">${r.date}</div>
                  <span class="badge-status badge-${r.status}">${r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>`;

    // استبدال دائرة التحميل بالنموذج
    const container = document.getElementById('register-container');
    if (container) {
      container.className = '';
      container.innerHTML = contentHtml;
    }
  } catch (error) {
    console.error("Error loading registration data:", error);
    const container = document.getElementById('register-container');
    if (container) {
      container.innerHTML = '<div class="alert alert-danger w-100">Failed to load registration form.</div>';
    }
  }
}

// 1. الدالة الأولى: رسم العنوان ودائرة التحميل فقط
function studentProgress() {
  loadProgressData(); // استدعاء جلب البيانات

  return `
  <div class="page-header">
    <div class="page-title">My Project Progress</div>
    <div class="page-sub mt-1">Track your milestones and supervisor feedback</div>
  </div>
  
  <!-- حاوية دائرة التحميل -->
  <div id="progress-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

// 2. الدالة الثانية: جلب البيانات ورسم تصميمك الأصلي الرائع
async function loadProgressData() {
  try {
    // جلب البيانات من مصفوفتك
    const data = await fetchMockData(myProgress);

    // بناء كود الـ HTML (نفس كودك الأصلي 100% بس استخدمنا متغير data)
    const contentHtml = `
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card-sgpms p-4 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="fw-bold">Overall Progress</div>
              <span class="fw-bold fs-5" style="color:var(--primary)">${data.percent}%</span>
            </div>
            <div class="progress-sgpms mb-4" style="height:14px"><div class="bar" style="width:${data.percent}%"></div></div>
            <div class="fw-semibold mb-4" style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px">Timeline</div>
            ${data.milestones.map((m, i) => `
              <div class="timeline-item">
                <div class="timeline-dot" style="${m.done ? 'background:var(--success);box-shadow:0 0 0 3px rgba(40,167,69,0.2)' : ''}"></div>
                <div class="flex-1 pb-1">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-${m.done ? '600' : '400'}" style="color:${m.done ? 'var(--text)' : 'var(--muted)'}">${m.label}</span>
                    <span class="text-xs text-muted">${m.date}</span>
                  </div>
                  ${m.done
        ? '<div class="text-xs mt-1" style="color:var(--success)"><i class="bi bi-check-circle-fill me-1"></i>Completed</div>'
        : `<div class="text-xs mt-1" style="color:var(--muted)"><i class="bi bi-hourglass-split me-1"></i>${i === 3 ? 'In Progress' : 'Upcoming'}</div>`}
                </div>
              </div>`).join('')}
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card-sgpms p-4 mb-4">
            <div class="fw-bold mb-3"><i class="bi bi-chat-quote me-2" style="color:var(--accent)"></i>Supervisor Feedback</div>
            <div class="d-flex flex-column gap-3">
              ${[
        { msg: 'Great progress on the requirement analysis. Make sure to finalize the ER diagram before the next meeting.', date: 'Nov 18', from: 'Dr. Deya' },
        { msg: 'The use case diagrams look good. Focus on the system design phase this week.', date: 'Dec 02', from: 'Dr. Deya' },
      ].map(f => `
                <div class="p-3 rounded-3" style="background:var(--bg);border-left:3px solid var(--accent)">
                  <div style="font-size:0.88rem;line-height:1.6">${f.msg}</div>
                  <div class="d-flex justify-content-between mt-2">
                    <span class="text-xs fw-semibold" style="color:var(--primary)">${f.from}</span>
                    <span class="text-xs text-muted">${f.date}</span>
                  </div>
                </div>`).join('')}
            </div>
          </div>
          <div class="card-sgpms p-4">
            <div class="fw-bold mb-3">Project Info</div>
            ${[['Title', 'Smart Graduation PM System'], ['Supervisor', 'Dr. Deya Al-Zoubi'], ['Phase', data.phase], ['Team Members', '5 Students'], ['Start Date', 'Oct 20, 2025'], ['Expected End', 'Feb 05, 2026']].map(([k, v]) => `
              <div class="d-flex justify-content-between py-2" style="border-bottom:1px solid var(--border)">
                <span class="text-muted small">${k}</span>
                <span class="fw-semibold small">${v}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
    // استبدال دائرة التحميل بالمحتوى
    const container = document.getElementById('progress-container');
    if (container) {
      container.className = '';
      container.innerHTML = contentHtml;
    }
  } catch (error) {
    console.error("Error loading progress:", error);
    const container = document.getElementById('progress-container');
    if (container) {
      container.innerHTML = '<div class="alert alert-danger w-100">Failed to load progress data.</div>';
    }
  }
}

// 1. الدالة الأولى: رسم العنوان ودائرة التحميل
function studentMeetings() {
  loadMeetingsData(); // استدعاء جلب البيانات

  return `
  <div class="page-header">
    <div class="page-title">Meeting Schedule</div>
    <div class="page-sub mt-1">Your upcoming meetings with Dr. Deya Al-Zoubi</div>
  </div>
  
  <!-- حاوية دائرة التحميل -->
  <div id="meetings-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

// 2. الدالة الثانية: جلب البيانات ورسم تصميمك الأصلي
async function loadMeetingsData() {
  try {
    const data = await fetchMockData(meetings);

    const contentHtml = `
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="d-flex flex-column gap-3">
            ${data.map(m => `
              <div class="meeting-card">
                <div style="width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;font-size:0.82rem;font-weight:700">
                  <span>${new Date(m.date).toLocaleString('en', { month: 'short' })}</span>
                  <span style="font-size:1.2rem;line-height:1">${m.date.slice(8)}</span>
                </div>
                <div class="flex-1">
                  <div class="meeting-title">${m.title}</div>
                  <div class="meeting-time"><i class="bi bi-clock me-1"></i>${m.time}</div>
                </div>
                <a href="${m.link}" target="_blank" class="btn-primary-sgpms text-decoration-none text-white" style="border-radius:10px;padding:10px 18px;font-size:0.85rem; background-color: #5558af; border-color: #5558af;">
                  <i class="bi bi-microsoft-teams me-2"></i>Join Teams
                </a>
              </div>`).join('')}
          </div>
        </div>
        <div class="col-lg-4">
          ...
        </div>
      </div>`;

    const container = document.getElementById('meetings-container');
    if (container) {
      container.className = '';
      container.innerHTML = contentHtml;
    }
  } catch (error) {
    console.error("Error loading meetings:", error);
  }
}

// 1. دالة تهيئة الشاشة (العنوان ودائرة التحميل)
function studentFiles() {
  loadFilesData(); // استدعاء جلب البيانات

  return `
  <div class="page-header">
    <div class="page-title">My Files</div>
    <div class="page-sub mt-1">Upload and manage your project documents</div>
  </div>
  
  <!-- حاوية دائرة التحميل -->
  <div id="files-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

// 2. دالة جلب البيانات ورسم واجهة الملفات
async function loadFilesData() {
  try {
    // جلب البيانات من الكائن تبعنا
    const data = await fetchMockData(myFilesData);

    const contentHtml = `
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card-sgpms p-4 mb-4">
            <div class="file-drop" onclick="showToast('info','Upload','File upload requires backend integration.')">
              <i class="bi bi-cloud-arrow-up"></i>
              <div class="fw-semibold mb-1">Drag & drop files here</div>
              <div class="text-muted small">Supports PDF, DOCX, PPTX · Max 50MB per file</div>
              <button class="btn-primary-sgpms mt-3" style="display:inline-block">Browse Files</button>
            </div>
          </div>
          <div class="card-sgpms p-4">
            <div class="fw-bold mb-3">Uploaded Files</div>
            <table class="table table-sgpms">
              <thead><tr><th>File Name</th><th>Type</th><th>Size</th><th>Uploaded</th><th>Actions</th></tr></thead>
              <tbody>
                ${data.uploadedFiles.map(f => `
                  <tr>
                    <td><i class="bi bi-file-earmark-fill me-2" style="color:var(--accent)"></i>${f.name}</td>
                    <td><span class="chip">${f.type}</span></td>
                    <td>${f.size}</td>
                    <td>${f.date}</td>
                    <td>
                      <button class="btn-sm-icon me-1" title="Download"><i class="bi bi-download"></i></button>
                      <button class="btn-sm-icon" title="Delete" onclick="showToast('danger','Deleted','File removed.')"><i class="bi bi-trash"></i></button>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card-sgpms p-4">
            <div class="fw-bold mb-3">Storage Usage</div>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted small">Used</span>
              <span class="fw-semibold small">${data.storageUsed} / ${data.storageTotal}</span>
            </div>
            <div class="progress-sgpms mb-4"><div class="bar" style="width:${data.storagePercent}%"></div></div>
            <div class="fw-bold mb-3">Required Documents</div>
            ${data.requiredDocs.map(r => `
              <div class="d-flex align-items-center gap-2 mb-2">
                <i class="bi ${r.done ? 'bi-check-circle-fill' : 'bi-circle'}" style="color:${r.done ? 'var(--success)' : 'var(--border)'}"></i>
                <span style="font-size:0.88rem;color:${r.done ? 'var(--text)' : 'var(--muted)'}">${r.label}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>`;

    // حقن الكود مكان دائرة التحميل
    const container = document.getElementById('files-container');
    if (container) {
      container.className = '';
      container.innerHTML = contentHtml;
    }
  } catch (error) {
    console.error("Error loading files:", error);
    const container = document.getElementById('files-container');
    if (container) {
      container.innerHTML = '<div class="alert alert-danger w-100">Failed to load files data.</div>';
    }
  }
}

/* ─────────────────────────────────────── */
/*  DOCTOR SECTIONS                        */
/* ─────────────────────────────────────── */
function renderDoctorDashboard() {
  const dashboardTab = document.querySelector('#doctor-sidebar .nav-item');
  showDoctorSection('dashboard', dashboardTab);
}
function showDoctorSection(section, el) {
  document.querySelectorAll('#doctor-sidebar .nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  const fn = { dashboard: doctorDashboard, groups: doctorGroups_fn, meetings: doctorMeetings, progress: doctorProgress, feedback: doctorFeedback };
  document.getElementById('doctor-content').innerHTML = fn[section]?.() || '';
}

// 1. الدالة الأولى: العنوان ودائرة التحميل
function doctorDashboard() {
  loadDoctorDashboardData(); // جلب البيانات بالخلفية

  return `
  <div class="page-header" style="background:linear-gradient(120deg,#0f2a25,#1a3530)">
    <div class="page-title">Welcome, Dr. Deya Al-Zoubi 👨‍🏫</div>
    <div class="page-sub mt-1">AI & Machine Learning · Supervisor Portal</div>
  </div>
  
  <div id="doctor-dashboard-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}
// 2. الدالة الثانية: جلب البيانات ورسم المحتوى
async function loadDoctorDashboardData() {
  try {
    // جلب البيانات (المجموعات + الإحصائيات)
    const data = await fetchMockData({
      groups: doctorGroups,
      meta: doctorDashboardData
    });

    const contentHtml = `
      <div class="row g-4 mb-4">
        ${statCard2('bi-people-fill', 'Active Groups', data.meta.stats.groups, 'teal')}
        ${statCard2('bi-person-fill', 'Total Students', data.meta.stats.students, 'blue')}
        ${statCard2('bi-calendar-check-fill', 'Meetings This Week', data.meta.stats.meetings, 'gold')}
        ${statCard2('bi-bell-fill', 'Pending Notifications', data.meta.stats.notifications, 'purple')}
      </div>
      <div class="row g-4">
        <div class="col-lg-7">
          <div class="card-sgpms p-4">
            <div class="fw-bold mb-4">Groups Overview</div>
            ${data.groups.map(g => `
              <div class="p-3 rounded-3 mb-3" style="background:var(--bg)">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <div class="fw-bold">${g.name}</div>
                    <div class="text-muted text-xs">${g.project}</div>
                  </div>
                  <span class="badge-status badge-ongoing">${g.status}</span>
                </div>
                <div class="d-flex justify-content-between mb-1"><span class="text-xs text-muted">Progress</span><span class="text-xs fw-bold">${g.progress}%</span></div>
                <div class="progress-sgpms"><div class="bar" style="width:${g.progress}%"></div></div>
              </div>`).join('')}
          </div>
        </div>
        <div class="col-lg-5">
          <div class="card-sgpms p-4 mb-4">
            <div class="fw-bold mb-3"><i class="bi bi-bell me-2" style="color:var(--accent)"></i>Recent Notifications</div>
            ${data.meta.notifications.map(n => `
              <div class="d-flex gap-3 mb-3 pb-3" style="border-bottom:1px solid var(--border)">
                <div class="notif-dot mt-2"></div>
                <div><div style="font-size:0.88rem">${n.msg}</div><div class="text-xs text-muted">${n.time}</div></div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;

    const container = document.getElementById('doctor-dashboard-container');
    if (container) {
      container.className = '';
      container.innerHTML = contentHtml;
    }
  } catch (error) {
    console.error("Doctor dashboard error:", error);
    const container = document.getElementById('doctor-dashboard-container');
    if (container) container.innerHTML = '<div class="alert alert-danger w-100">Failed to load supervisor dashboard.</div>';
  }
}

// 1. الدالة الأولى: رسم العنوان وحاوية التحميل (Spinner)
function doctorGroups_fn() {
  loadDoctorGroupsData(); // بدء عملية جلب البيانات فوراً

  return `
  <div class="page-header" style="background:linear-gradient(120deg,#0f2a25,#1a3530)">
    <div class="page-title">My Groups</div>
    <div class="page-sub mt-1">All project groups assigned to you</div>
  </div>
  
  <!-- حاوية دائرة التحميل الخاصة بالمجموعات -->
  <div id="groups-list-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

// 2. الدالة الثانية: جلب البيانات (مجمعة) ورسم الداش بورد
async function loadDashboardData() {
  try {
    // نجلب بيانات البطاقات، والإنجازات، والاجتماعات مع بعض
    const data = await fetchMockData({
      stats: dashboardStats,
      prog: myProgress,
      meets: meetings
    });

    const contentHtml = `
      <div class="row g-4 mb-4">
        ${statCard('bi-file-earmark-check-fill', 'My Project', data.stats.projectName, 'blue')}
        ${statCard('bi-person-badge-fill', 'Supervisor', data.stats.supervisorName, 'gold')}
        ${statCard('bi-bar-chart-fill', 'Progress', data.stats.progressPercent + '% Complete', 'green')}
        ${statCard('bi-calendar-check-fill', 'Next Meeting', data.stats.nextMeetingDate, 'purple')}
      </div>
      <div class="row g-4">
        <div class="col-lg-7">
          <div class="card-sgpms p-4">
            <div class="section-header mb-3">
              <div class="fw-bold" style="font-size:1rem">Project Progress</div>
              <span class="badge-status badge-ongoing">Ongoing</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted small">Current Phase: <strong>${data.prog.phase}</strong></span>
              <span class="fw-bold" style="color:var(--primary)">${data.prog.percent}%</span>
            </div>
            <div class="progress-sgpms mb-4"><div class="bar" style="width:${data.prog.percent}%"></div></div>
            <div class="fw-semibold mb-3" style="font-size:0.9rem;color:var(--muted);letter-spacing:0.5px;text-transform:uppercase">Milestones</div>
            ${data.prog.milestones.map((m, i) => `
              <div class="timeline-item">
                <div class="timeline-dot" style="${m.done ? 'background:var(--success)' : 'background:var(--border)'}"></div>
                <div class="flex-1">
                  <div class="d-flex justify-content-between">
                    <span class="fw-${m.done ? '600' : '500'}" style="color:${m.done ? 'var(--text)' : 'var(--muted)'}">${m.label}</span>
                    <span class="text-xs text-muted">${m.date}</span>
                  </div>
                  ${m.done ? '<div class="text-xs" style="color:var(--success)"><i class="bi bi-check-circle-fill me-1"></i>Completed</div>' : ''}
                </div>
              </div>`).join('')}
          </div>
        </div>
        <div class="col-lg-5">
          <div class="card-sgpms p-4 mb-4">
            <div class="fw-bold mb-3">Upcoming Meetings</div>
            <div class="d-flex flex-column gap-3">
              ${data.meets.map(m => `
                <div class="d-flex align-items-center gap-3 p-2 rounded-3" style="background:var(--bg)">
                  <div style="width:44px;height:44px;border-radius:10px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;flex-shrink:0;line-height:1.2;text-align:center">${m.date.slice(5, 7)}/${m.date.slice(8)}</div>
                  <div>
                    <div class="fw-600" style="font-size:0.88rem">${m.title}</div>
                    <div class="text-muted text-xs">${m.time}</div>
                  </div>
                  <a href="${m.link}" target="_blank" class="ms-auto btn-sm-icon text-decoration-none" style="display:flex; align-items:center; justify-content:center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#5558af" viewBox="0 0 16 16">
                      <path d="M7.186 1.625c-.059-.22-.38-.22-.44 0-.178.65-.63 1.15-1.15 1.15-.52 0-.972-.5-1.15-1.15-.06-.22-.381-.22-.44 0C3.828 2.275 2.5 3.395 2.5 4.75c0 1.355 1.328 2.475 1.506 3.125.059.22.38.22.44 0 .178-.65.63-1.15 1.15-1.15.52 0 .972.5 1.15 1.15.06.22.381.22.44 0C7.172 7.225 8.5 6.105 8.5 4.75c0-1.355-1.328-2.475-1.506-3.125z"/>
                      <path d="M11.5 5.5c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2m-8.5 4c0-1.105.895-2 2-2s2 .895 2 2-.895 2-2 2-2-.895-2-2m6.262 3.65A1.5 1.5 0 0 0 10.5 12h2.5A1.5 1.5 0 0 0 14.5 10.5v-1A1.5 1.5 0 0 0 13 8h-2.5a1.5 1.5 0 0 0-1.238.65l-.946 1.42a1 1 0 0 1-1.632 0l-.946-1.42A1.5 1.5 0 0 0 4.5 8H2a1.5 1.5 0 0 0-1.5 1.5v1A1.5 1.5 0 0 0 2 12h2.5a1.5 1.5 0 0 0 1.238-.65L6.684 9.93a.5.5 0 0 1 .816 0z"/>
                    </svg>
                  </a>
                </div>`).join('')}
            </div>
          </div>
          <div class="card-sgpms p-4">
            <div class="fw-bold mb-3">Quick Actions</div>
            <div class="d-flex flex-column gap-2">
              <button class="btn btn-sm text-start d-flex align-items-center gap-2" style="background:var(--bg);border-radius:10px;padding:12px 14px" onclick="showStudentSection('ai',null)">
                <i class="bi bi-robot" style="color:var(--accent)"></i><span>Generate Project Ideas with AI</span>
              </button>
              <button class="btn btn-sm text-start d-flex align-items-center gap-2" style="background:var(--bg);border-radius:10px;padding:12px 14px" onclick="showStudentSection('files',null)">
                <i class="bi bi-upload" style="color:var(--primary)"></i><span>Upload Project Files</span>
              </button>
              <button class="btn btn-sm text-start d-flex align-items-center gap-2" style="background:var(--bg);border-radius:10px;padding:12px 14px" onclick="showStudentSection('supervisors',null)">
                <i class="bi bi-people" style="color:var(--doc-accent)"></i><span>View Supervisors</span>
              </button>
            </div>
          </div>
        </div>
      </div>`;

    const container = document.getElementById('dashboard-container');
    if (container) {
      container.className = '';
      container.innerHTML = contentHtml;
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
    const container = document.getElementById('dashboard-container');
    if (container) {
      container.innerHTML = '<div class="alert alert-danger w-100">Failed to load dashboard data.</div>';
    }
  }
}

// 1. الدالة الأولى: رسم الهيكل ودائرة التحميل
function doctorProgress() {
  loadDocProgressData(); // جلب بيانات المجموعات بالخلفية

  return `
  <div class="page-header" style="background:linear-gradient(120deg,#0f2a25,#1a3530)">
    <div class="page-title">Update Project Progress</div>
    <div class="page-sub mt-1">Log feedback and set progress for your groups</div>
  </div>
  
  <div id="doc-progress-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

// 2. الدالة الثانية: جلب البيانات ورسم بطاقات التحكم لكل مجموعة
async function loadDocProgressData() {
  try {
    // جلب بيانات المجموعات
    const groups = await fetchMockData(doctorGroups);

    const contentHtml = `
      <div class="d-flex flex-column gap-4">
        ${groups.map(g => `
          <div class="card-sgpms p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div><h6 class="fw-bold mb-0">${g.name}</h6><div class="text-muted text-xs">${g.project}</div></div>
              <span class="fw-bold" style="color:var(--doc-accent);font-size:1.2rem">${g.progress}%</span>
            </div>
            <div class="progress-sgpms mb-3"><div class="bar" style="width:${g.progress}%"></div></div>
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label">Update Progress (%)</label>
                <input type="range" class="form-range" min="0" max="100" value="${g.progress}" 
                  oninput="this.nextElementSibling.textContent=this.value+'%'"/>
                <small class="text-muted">${g.progress}%</small>
              </div>
              <div class="col-md-4">
                <label class="form-label">Current Phase</label>
                <select class="form-select">
                  <option>Requirement Analysis</option>
                  <option selected>System Design</option>
                  <option>Implementation</option>
                  <option>Testing</option>
                  <option>Deployment</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">Grade (Optional)</label>
                <select class="form-select"><option>--</option><option>A+</option><option>A</option><option>B+</option><option>B</option><option>C+</option><option>C</option></select>
              </div>
              <div class="col-12">
                <label class="form-label">Feedback / Comments</label>
                <textarea class="form-control" rows="2" placeholder="Write your feedback for this group…"></textarea>
              </div>
              <div class="col-12">
                <button class="btn-primary-sgpms" onclick="showToast('success','Saved','Progress updated and students notified.')">
                  <i class="bi bi-floppy me-2"></i>Save Changes
                </button>
              </div>
            </div>
          </div>`).join('')}
      </div>`;

    const container = document.getElementById('doc-progress-container');
    if (container) {
      container.className = '';
      container.innerHTML = contentHtml;
    }
  } catch (error) {
    console.error("Error loading doctor progress:", error);
    const container = document.getElementById('doc-progress-container');
    if (container) {
      container.innerHTML = '<div class="alert alert-danger w-100">Failed to load groups for progress update.</div>';
    }
  }
}

// 1. الدالة الأولى: رسم الهيكل وسينر التحميل
function doctorFeedback() {
  loadDoctorFeedbackData(); // طلب البيانات

  return `
  <div class="page-header" style="background:linear-gradient(120deg,#0f2a25,#1a3530)">
    <div class="page-title">Feedback Center</div>
    <div class="page-sub mt-1">All feedback you've given to student groups</div>
  </div>
  
  <div id="doc-feedback-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

// 2. الدالة الثانية: جلب البيانات ورسم الجدول
async function loadDoctorFeedbackData() {
  try {
    const data = await fetchMockData(doctorFeedbackHistory);

    const contentHtml = `
      <div class="card-sgpms p-4">
        <table class="table table-sgpms">
          <thead><tr><th>Group</th><th>Date</th><th>Feedback</th><th>Phase</th></tr></thead>
          <tbody>
            ${data.map(r => `
              <tr>
                <td><strong>${r.g}</strong></td>
                <td>${r.d}</td>
                <td>${r.fb}</td>
                <td><span class="chip">${r.ph}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    const container = document.getElementById('doc-feedback-container');
    if (container) {
      container.className = '';
      container.innerHTML = contentHtml;
    }
  } catch (error) {
    console.error("Feedback error:", error);
    const container = document.getElementById('doc-feedback-container');
    if (container) {
      container.innerHTML = '<div class="alert alert-danger">Unable to load feedback history.</div>';
    }
  }
}

/* ─────────────────────────────────────── */
/*  ADMIN SECTIONS                         */
/* ─────────────────────────────────────── */
function renderAdminDashboard() {
  const dashboardTab = document.querySelector('#admin-sidebar .nav-item');
  showAdminSection('dashboard', dashboardTab);
}
function showAdminSection(section, el) {
  document.querySelectorAll('#admin-sidebar .nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  const fn = { dashboard: adminDashboard, requests: adminRequests, supervisors: adminSupervisors, students: adminStudents, reports: adminReports };
  document.getElementById('admin-content').innerHTML = fn[section]?.() || '';
}

// 1. الدالة الأولى: رسم العنوان وحاوية التحميل
function adminDashboard() {
  loadAdminDashboardData(); // بدء عملية جلب البيانات بالخلفية

  return `
  <div class="page-header" style="background:linear-gradient(120deg,#160a30,#1e1040)">
    <div class="page-title">Admin Dashboard</div>
    <div class="page-sub mt-1">Department Head · Full System Overview</div>
  </div>
  
  <div id="admin-dashboard-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}
// 2. الدالة الثانية: جلب بيانات الإدارة ورسم الإحصائيات والجداول
async function loadAdminDashboardData() {
  try {
    // تجميع البيانات المطلوبة من المصفوفات الموجودة مسبقاً (طلبات، دكاترة، وإحصائيات)
    const data = await fetchMockData({
      stats: { pending: 2, students: 48, supervisors: 6, approved: 12 },
      recentRequests: requests.slice(0, 4), // نأخذ أول 4 طلبات فقط للداش بورد
      sups: supervisors // قائمة الدكاترة
    });

    const contentHtml = `
      <div class="row g-4 mb-4">
        ${statCard3('bi-inbox-fill', 'Pending Requests', data.stats.pending, 'gold')}
        ${statCard3('bi-people-fill', 'Total Students', data.stats.students, 'blue')}
        ${statCard3('bi-person-badge-fill', 'Active Supervisors', data.stats.supervisors, 'purple')}
        ${statCard3('bi-check2-circle', 'Approved Projects', data.stats.approved, 'green')}
      </div>
      <div class="row g-4">
        <div class="col-lg-7">
          <div class="card-sgpms p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="fw-bold">Recent Requests</div>
              <button class="btn-sm" style="border:1.5px solid var(--border);border-radius:8px;background:transparent;padding:6px 14px;font-size:0.82rem" onclick="showAdminSection('requests',null)">View All</button>
            </div>
            <table class="table table-sgpms mb-0">
              <thead><tr><th>Group</th><th>Project</th><th>Supervisor</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                ${data.recentRequests.map(r => `
                  <tr>
                    <td class="fw-semibold">${r.group}</td>
                    <td class="text-muted" style="font-size:0.85rem">${r.project}</td>
                    <td class="text-muted" style="font-size:0.85rem">${r.supervisor.replace('Dr. ', '')}</td>
                    <td><span class="badge-status badge-${r.status}">${r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span></td>
                    <td>
                      ${r.status === 'pending' ? `
                        <button class="btn-sm-icon me-1" title="Approve" onclick="approveRequest(${r.id})" style="color:var(--success)"><i class="bi bi-check-lg"></i></button>
                        <button class="btn-sm-icon" title="Reject" onclick="rejectRequest(${r.id})" style="color:var(--danger)"><i class="bi bi-x-lg"></i></button>`
        : '<span class="text-muted text-xs">—</span>'}
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
        <div class="col-lg-5">
          <div class="card-sgpms p-4 mb-4">
            <div class="fw-bold mb-3">Supervisor Capacity</div>
            ${data.sups.map(s => {
          const pct = Math.round(s.groups / s.max * 100);
          return `
              <div class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                  <span style="font-size:0.85rem">${s.name}</span>
                  <span class="text-xs fw-semibold">${s.groups}/${s.max}</span>
                </div>
                <div class="sup-cap-bar"><div class="fill ${pct >= 100 ? 'fill-high' : pct >= 60 ? 'fill-mid' : 'fill-low'}" style="width:${pct}%"></div></div>
              </div>`;
        }).join('')}
          </div>
        </div>
      </div>`;

    const container = document.getElementById('admin-dashboard-container');
    if (container) {
      container.className = '';
      container.innerHTML = contentHtml;
    }
  } catch (error) {
    console.error("Admin dashboard error:", error);
    const container = document.getElementById('admin-dashboard-container');
    if (container) container.innerHTML = '<div class="alert alert-danger w-100">Failed to load admin dashboard.</div>';
  }
}

// 1. الدالة الأولى: رسم العنوان ودائرة التحميل
function adminRequests() {
  loadAdminRequestsData(); // طلب البيانات بالخلفية

  return `
  <div class="page-header" style="background:linear-gradient(120deg,#160a30,#1e1040)">
    <div class="page-title">Project Requests</div>
    <div class="page-sub mt-1">Review and approve/reject student registration requests</div>
  </div>
  
  <div id="admin-requests-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

// 2. الدالة الثانية: جلب الطلبات ورسم الجدول مع أزرار الفلترة
async function loadAdminRequestsData() {
  try {
    const data = await fetchMockData(requests);

    const contentHtml = `
      <div class="card-sgpms p-4">
        <div class="d-flex gap-2 mb-4 flex-wrap">
          ${['All', 'Pending', 'Approved', 'Rejected'].map((f, i) => `
            <button class="chip" style="cursor:pointer;border:none;${i === 0 ? 'background:var(--primary);color:#fff' : ''}">${f}</button>
          `).join('')}
        </div>
        <table class="table table-sgpms">
          <thead><tr><th>Group</th><th>Project</th><th>Supervisor</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody id="requests-table">
            ${data.map(r => `
              <tr id="req-row-${r.id}">
                <td class="fw-semibold">${r.group}</td>
                <td>${r.project}</td>
                <td>${r.supervisor}</td>
                <td>${r.date}</td>
                <td><span class="badge-status badge-${r.status}" id="req-badge-${r.id}">${r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span></td>
                <td>
                  ${r.status === 'pending' ? `
                    <button class="btn-sm-icon me-1" title="Approve" onclick="approveRequest(${r.id})" style="color:var(--success)"><i class="bi bi-check-lg"></i></button>
                    <button class="btn-sm-icon" title="Reject"  onclick="rejectRequest(${r.id})" style="color:var(--danger)"><i class="bi bi-x-lg"></i></button>`
        : `<button class="btn-sm-icon" title="View" onclick="showToast('info','Details','Request details view.')"><i class="bi bi-eye"></i></button>`}
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    const container = document.getElementById('admin-requests-container');
    if (container) {
      container.className = '';
      container.innerHTML = contentHtml;
    }
  } catch (error) {
    console.error("Error loading admin requests:", error);
    const container = document.getElementById('admin-requests-container');
    if (container) {
      container.innerHTML = '<div class="alert alert-danger w-100">Failed to load requests. Please try again.</div>';
    }
  }
}

// 1. الدالة الأولى: رسم العنوان ودائرة التحميل
function adminSupervisors() {
  loadAdminSupervisorsData(); // جلب بيانات الدكاترة بالخلفية

  return `
  <div class="page-header" style="background:linear-gradient(120deg,#160a30,#1e1040)">
    <div class="page-title">Supervisors</div>
    <div class="page-sub mt-1">Manage faculty supervisors and their capacities</div>
  </div>
  
  <div id="admin-supervisors-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

// 2. الدالة الثانية: جلب البيانات ورسم بطاقات الدكاترة
async function loadAdminSupervisorsData() {
  try {
    // جلب بيانات مصفوفة الدكاترة
    const data = await fetchMockData(supervisors);

    const contentHtml = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <span class="text-muted small">${data.length} supervisors registered</span>
        <button class="btn-primary-sgpms" onclick="showToast('info','Add','Add supervisor form will open.')"><i class="bi bi-plus me-2"></i>Add Supervisor</button>
      </div>
      <div class="row g-4">
        ${data.map(s => {
      const pct = Math.round(s.groups / s.max * 100);
      return `
          <div class="col-md-6 col-lg-4">
            <div class="sup-card">
              <div class="d-flex align-items-center gap-3">
                <div class="sup-avatar" style="background:linear-gradient(135deg,var(--admin-accent),var(--primary))">${s.initials}</div>
                <div><div class="sup-name">${s.name}</div><div class="sup-area">${s.area}</div></div>
              </div>
              <div>
                <div class="d-flex justify-content-between mb-1"><span class="text-xs text-muted">Load</span><span class="text-xs fw-semibold">${s.groups}/${s.max}</span></div>
                <div class="sup-cap-bar"><div class="fill ${pct >= 100 ? 'fill-high' : pct >= 60 ? 'fill-mid' : 'fill-low'}" style="width:${pct}%"></div></div>
              </div>
              <div class="d-flex gap-2">
                <button class="btn-sm-icon" title="Edit" onclick="showToast('info','Edit','Edit supervisor.')"><i class="bi bi-pencil"></i></button>
                <button class="btn-sm-icon" title="Remove" onclick="showToast('danger','Removed','Supervisor removed.')"><i class="bi bi-trash"></i></button>
                <span class="chip ms-auto">${s.groups < s.max ? 'Available' : 'Full'}</span>
              </div>
            </div>
          </div>`;
    }).join('')}
      </div>`;

    const container = document.getElementById('admin-supervisors-container');
    if (container) {
      container.className = '';
      container.innerHTML = contentHtml;
    }
  } catch (error) {
    console.error("Error loading supervisors:", error);
    const container = document.getElementById('admin-supervisors-container');
    if (container) {
      container.innerHTML = '<div class="alert alert-danger w-100">Failed to load supervisors data.</div>';
    }
  }
}

// 1. الدالة الأولى: رسم العنوان ودائرة التحميل
function adminStudents() {
  loadAdminStudentsData(); // جلب البيانات بالخلفية

  return `
  <div class="page-header" style="background:linear-gradient(120deg,#160a30,#1e1040)">
    <div class="page-title">Students</div>
    <div class="page-sub mt-1">All registered students in the system</div>
  </div>
  
  <div id="admin-students-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

// 2. الدالة الثانية: جلب قائمة الطلاب ورسم الجدول
async function loadAdminStudentsData() {
  try {
    const data = await fetchMockData(adminStudentsList);

    const contentHtml = `
      <div class="card-sgpms p-4">
        <div class="d-flex justify-content-between mb-3 flex-wrap gap-2">
          <input class="form-control" style="max-width:280px" placeholder="Search by name or ID…"/>
          <button class="btn-primary-sgpms" onclick="showToast('info','Add Student','Add student form.')"><i class="bi bi-plus me-2"></i>Add Student</button>
        </div>
        <table class="table table-sgpms">
          <thead><tr><th>ID</th><th>Name</th><th>Major</th><th>Group</th><th>Supervisor</th><th>Status</th></tr></thead>
          <tbody>
            ${data.map(r => `
              <tr>
                <td class="text-muted text-xs">${r.id}</td>
                <td class="fw-semibold">${r.n}</td>
                <td>${r.m}</td>
                <td>${r.g || '—'}</td>
                <td class="text-muted" style="font-size:0.85rem">${r.s || '—'}</td>
                <td><span class="badge-status badge-${r.st}">${r.st.charAt(0).toUpperCase() + r.st.slice(1)}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    const container = document.getElementById('admin-students-container');
    if (container) {
      container.className = '';
      container.innerHTML = contentHtml;
    }
  } catch (error) {
    console.error("Error loading students:", error);
    const container = document.getElementById('admin-students-container');
    if (container) {
      container.innerHTML = '<div class="alert alert-danger w-100">Failed to load students list.</div>';
    }
  }
}

// 1. الدالة الأولى: رسم العنوان ودائرة التحميل
function adminReports() {
  loadAdminReportsData(); // جلب البيانات بالخلفية

  return `
  <div class="page-header" style="background:linear-gradient(120deg,#160a30,#1e1040)">
    <div class="page-title">Reports</div>
    <div class="page-sub mt-1">Generate and export system reports</div>
  </div>
  
  <div id="admin-reports-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

// 2. الدالة الثانية: جلب الإحصائيات ورسم الشاشة
async function loadAdminReportsData() {
  try {
    // تجميع البيانات في كائن لسهولة استبدالها بـ API حقيقي لاحقاً
    const data = await fetchMockData({
      stats: [
        { icon: 'bi-check2-circle', label: 'Approved', val: 12, color: 'success' },
        { icon: 'bi-hourglass-split', label: 'Pending', val: 2, color: 'warning' },
        { icon: 'bi-x-circle', label: 'Rejected', val: 3, color: 'danger' },
        { icon: 'bi-collection', label: 'Total Projects', val: 17, color: 'primary' },
      ],
      chartData: [
        ['var(--success)', 'Approved', '12', '70.6%'],
        ['var(--warning)', 'Pending', '2', '11.8%'],
        ['var(--danger)', 'Rejected', '3', '17.6%']
      ],
      exports: [
        { icon: 'bi-file-earmark-pdf', label: 'All Projects Report', sub: 'PDF format · All project statuses' },
        { icon: 'bi-file-earmark-spreadsheet', label: 'Supervisor Load Report', sub: 'Excel format · Capacity overview' },
        { icon: 'bi-file-earmark-bar-graph', label: 'Progress Summary', sub: 'PDF format · All groups progress' },
        { icon: 'bi-envelope-paper', label: 'Invoice to Supervisors', sub: 'Per university policy' },
      ]
    });

    const contentHtml = `
      <div class="row g-4 mb-4">
        ${data.stats.map(s => `
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon ${s.color === 'primary' ? 'blue' : s.color === 'success' ? 'green' : s.color === 'warning' ? 'gold' : 'purple'}">
                <i class="bi ${s.icon}"></i>
              </div>
              <div><div class="stat-num">${s.val}</div><div class="stat-label">${s.label}</div></div>
            </div>
          </div>`).join('')}
      </div>
      <div class="row g-4">
        <div class="col-lg-6">
          <div class="card-sgpms p-4">
            <div class="fw-bold mb-3">Projects by Status</div>
            <div id="chart-donut" style="display:flex;align-items:center;gap:24px">
              <svg width="130" height="130" viewBox="0 0 42 42">
                <circle r="15.9" cx="21" cy="21" fill="none" stroke="var(--border)" stroke-width="6"/>
                <circle r="15.9" cx="21" cy="21" fill="none" stroke="var(--success)" stroke-width="6" stroke-dasharray="70.6 29.4" stroke-dashoffset="25" transform="rotate(-90 21 21)"/>
                <circle r="15.9" cx="21" cy="21" fill="none" stroke="var(--warning)" stroke-width="6" stroke-dasharray="11.8 88.2" stroke-dashoffset="-45.7" transform="rotate(-90 21 21)"/>
                <circle r="15.9" cx="21" cy="21" fill="none" stroke="var(--danger)" stroke-width="6" stroke-dasharray="17.6 82.4" stroke-dashoffset="-57.5" transform="rotate(-90 21 21)"/>
              </svg>
              <div>
                ${data.chartData.map(([c, l, n, p]) => `
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <div style="width:10px;height:10px;border-radius:3px;background:${c}"></div>
                    <span style="font-size:0.88rem">${l}</span>
                    <span class="fw-bold ms-auto" style="font-size:0.88rem">${n} <span class="text-muted fw-normal">(${p})</span></span>
                  </div>`).join('')}
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="card-sgpms p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="fw-bold">Export Reports</div>
            </div>
            ${data.exports.map(r => `
              <div class="d-flex align-items-center justify-content-between p-3 rounded-3 mb-2" style="background:var(--bg)">
                <div class="d-flex align-items-center gap-3">
                  <i class="bi ${r.icon}" style="font-size:1.3rem;color:var(--admin-accent)"></i>
                  <div><div class="fw-semibold" style="font-size:0.88rem">${r.label}</div><div class="text-xs text-muted">${r.sub}</div></div>
                </div>
                <button class="btn-sm-icon" onclick="showToast('success','Export','Report generated successfully.')"><i class="bi bi-download"></i></button>
              </div>`).join('')}
          </div>
        </div>
      </div>`;

    const container = document.getElementById('admin-reports-container');
    if (container) {
      container.className = '';
      container.innerHTML = contentHtml;
    }
  } catch (error) {
    console.error("Error loading reports:", error);
    const container = document.getElementById('admin-reports-container');
    if (container) {
      container.innerHTML = '<div class="alert alert-danger w-100">Failed to load reports data.</div>';
    }
  }
}

/* ─────────────────────────────────────── */
/*  HELPERS                                */
/* ─────────────────────────────────────── */
function statCard(icon, label, value, colorClass) {
  return `<div class="col-md-6 col-lg-3"><div class="stat-card"><div class="stat-icon ${colorClass}"><i class="bi ${icon}"></i></div><div><div class="stat-num" style="font-size:1rem;font-weight:600">${value}</div><div class="stat-label">${label}</div></div></div></div>`;
}
function statCard2(icon, label, value, colorClass) {
  return `<div class="col-md-6 col-lg-3"><div class="stat-card"><div class="stat-icon ${colorClass}"><i class="bi ${icon}"></i></div><div><div class="stat-num">${value}</div><div class="stat-label">${label}</div></div></div></div>`;
}
function statCard3(icon, label, value, colorClass) {
  return `<div class="col-md-6 col-lg-3"><div class="stat-card"><div class="stat-icon ${colorClass}"><i class="bi ${icon}"></i></div><div><div class="stat-num">${value}</div><div class="stat-label">${label}</div></div></div></div>`;
}

function approveRequest(id) {
  const badge = document.getElementById(`req-badge-${id}`);
  if (badge) { badge.className = 'badge-status badge-approved'; badge.textContent = 'Approved'; }
  const row = document.getElementById(`req-row-${id}`);
  if (row) { const td = row.querySelector('td:last-child'); if (td) td.innerHTML = '<i class="bi bi-check-circle-fill" style="color:var(--success)"></i>'; }
  showToast('success', 'Approved', 'Project approved and supervisor notified.');
}
function rejectRequest(id) {
  const badge = document.getElementById(`req-badge-${id}`);
  if (badge) { badge.className = 'badge-status badge-rejected'; badge.textContent = 'Rejected'; }
  const row = document.getElementById(`req-row-${id}`);
  if (row) { const td = row.querySelector('td:last-child'); if (td) td.innerHTML = '<i class="bi bi-x-circle-fill" style="color:var(--danger)"></i>'; }
  showToast('danger', 'Rejected', 'Project registration rejected.');
}

function submitRegistration() {
  // 1. قراءة القيم من الحقول باستخدام الـ IDs اللي ضفناها
  const title = document.getElementById('reg-title').value;
  const description = document.getElementById('reg-desc').value;
  const supervisor = document.getElementById('reg-supervisor').value;

  // 2. التحقق من المدخلات (Form Validation)
  // التأكد من أن الطالب أدخل عنوان المشروع
  if (title.trim() === '') {
    showToast('warning', 'Missing Title', 'Please enter a title for your project.');
    return; // نوقف التنفيذ عشان ما يرسل بيانات ناقصة
  }

  // التأكد من أن الوصف لا يقل عن 20 حرف (كمثال لحماية جودة البيانات)
  if (description.trim().length < 20) {
    showToast('warning', 'Short Description', 'Please provide a detailed description (minimum 20 characters).');
    return;
  }

  // التأكد من اختيار مشرف من القائمة
  if (supervisor === '') {
    showToast('danger', 'Select Supervisor', 'You must select a supervisor for your project.');
    return;
  }

  // 3. محاكاة الإرسال الناجح (هنا سيتم إضافة كود الـ fetch لاحقاً لإرسال البيانات لـ Oracle APEX)

  // تنظيف الحقول بعد نجاح الإرسال (اختياري بس بيعطي تجربة أفضل)
  document.getElementById('reg-title').value = '';
  document.getElementById('reg-desc').value = '';
  document.getElementById('reg-supervisor').value = '';

  // رسالة النجاح
  showToast('success', 'Submitted Successfully', 'Your project request has been sent to the Department Head for review.');
}

/* ─── AI Chat (REAL PYTHON INTEGRATION) ─── */
let userMajor = "";
let userCategory = "";
const itMajors = ["Computer Science", "Computer Information Systems", "Software Engineering", "Network Engineering & Security", "Cyber Security", "Artificial Intelligence", "Data Science", "Health Information Systems"];
const projectCategories = ["Mobile Dev", "Web Dev", "AI", "Cybersecurity", "AI / Health IT", "Security / IoT", "AI / Analytics"];

// 1. Draws the actual page layout when the user clicks the AI tab
function studentAI() {
  return `
  <div class="page-header" style="background:linear-gradient(120deg,#0f2540,#1a3a5c)">
    <div class="page-title"><i class="bi bi-robot me-3" style="color:var(--accent)"></i>AI Project Assistant</div>
    <div class="page-sub mt-1">Powered by Gemini · Get personalized graduation project ideas</div>
  </div>
  
  <div class="row g-4 mt-2">
    <div class="col-lg-8">
      <div class="ai-chat-wrap">
        <div class="ai-chat-header">
          <div class="ai-avatar"><i class="bi bi-robot"></i></div>
          <div>
            <div class="fw-bold" style="font-size:0.95rem">SGPMS AI Assistant</div>
            <div class="text-xs text-muted"><span style="color:var(--success)">●</span> Online</div>
          </div>
        </div>
        
        <div class="ai-chat-msgs" id="ai-msgs"></div>
        
        <div class="ai-chat-input">
          <input id="ai-input" placeholder="Type your message… e.g. I want to build a drone app" onkeydown="if(event.key==='Enter')sendAIChat()"/>
          <button class="ai-send-btn" onclick="sendAIChat()"><i class="bi bi-send-fill"></i></button>
        </div>
      </div>
    </div>
    
    <div class="col-lg-4">
      <div class="card-sgpms p-4 mb-4">
        <div class="fw-bold mb-3"><i class="bi bi-lightbulb me-2" style="color:var(--accent)"></i>How It Works</div>
        <div class="d-flex gap-3 mb-3">
          <div style="width:28px;height:28px;border-radius:8px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;flex-shrink:0">1</div>
          <div><div class="fw-semibold" style="font-size:0.88rem">Select or Type</div><div class="text-xs text-muted">Use the buttons or type a custom idea</div></div>
        </div>
        <div class="d-flex gap-3 mb-3">
          <div style="width:28px;height:28px;border-radius:8px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;flex-shrink:0">2</div>
          <div><div class="fw-semibold" style="font-size:0.88rem">AI Brainstorming</div><div class="text-xs text-muted">The AI searches its knowledge base</div></div>
        </div>
        <div class="d-flex gap-3 mb-3">
          <div style="width:28px;height:28px;border-radius:8px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;flex-shrink:0">3</div>
          <div><div class="fw-semibold" style="font-size:0.88rem">Get Referrals</div><div class="text-xs text-muted">Find the right JUST supervisor instantly</div></div>
        </div>
      </div>
    </div>
  </div>`;
}

// 2. Helper to add AI text to the screen
function appendBotMessage(text) {
  const container = document.getElementById('ai-msgs');
  if (!container) return;
  const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
  container.insertAdjacentHTML('beforeend', `
    <div class="msg bot">
      <div class="msg-bubble">${formattedText}</div>
      <div class="msg-time">AI Assistant · Now</div>
    </div>`);
  container.scrollTop = container.scrollHeight;
}

// 3. Helper to draw the interactive buttons
function showQuickReplies(options, callback) {
  const container = document.getElementById('ai-msgs');
  if (!container) return;
  const replyDiv = document.createElement('div');
  replyDiv.className = 'd-flex flex-wrap gap-2 mt-2 quick-replies-container'; 

  options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'chip'; 
    btn.style.cssText = 'cursor:pointer; border:1px solid var(--primary); background:var(--surface); transition:0.2s;';
    btn.innerText = option;
    btn.onclick = () => {
      replyDiv.remove(); // Hide buttons after clicking
      container.insertAdjacentHTML('beforeend', `
        <div class="msg user">
          <div class="msg-bubble">${option}</div>
          <div class="msg-time">Now</div>
        </div>`);
      callback(option);
    };
    replyDiv.appendChild(btn);
  });
  container.appendChild(replyDiv);
  container.scrollTop = container.scrollHeight;
}

// 4. Starts the chat flow when the tab opens
function startSGPMSChat() {
  const container = document.getElementById('ai-msgs');
  if (!container) return;
  container.innerHTML = ''; // Clear chat history
  
  userMajor = ""; // Reset selections
  userCategory = "";

  document.getElementById('ai-input').disabled = false; 

  appendBotMessage("Welcome To The SGPMS AI Assistant! Select your major below, or just type what kind of project you want to build:");
  
  showQuickReplies(itMajors, (selectedMajor) => {
    userMajor = selectedMajor;
    setTimeout(() => {
      appendBotMessage("Great! What kind of project category are you interested in?");
      showQuickReplies(projectCategories, (selectedCategory) => {
        userCategory = selectedCategory;
        sendInitialDataToBackend(userMajor, userCategory);
      });
    }, 500);
  });
}

// 5. Connects to PORT 5001 for the First Prompt
async function sendInitialDataToBackend(major, category) {
  appendBotMessage("Analyzing data and matching with supervisors... <i class='bi bi-hourglass-split' style='animation:blink 1s infinite'></i>");
  try {
    // ⚠️ UPDATED TO 5001
    const response = await fetch('http://127.0.0.1:5001/api/init_chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ major: major, interests: category })
    });
    const data = await response.json();
    
    const msgs = document.getElementById('ai-msgs');
    msgs.lastElementChild.remove(); // Remove "Analyzing..." message
    
    appendBotMessage(data.reply);
    document.getElementById('ai-input').disabled = false;
    document.getElementById('ai-input').focus();
  } catch (error) {
    const msgs = document.getElementById('ai-msgs');
    msgs.lastElementChild.remove();
    appendBotMessage("❌ Error connecting to the Python AI. Make sure Ai.py is running on port 5001.");
  }
}

// 6. Handles typing in the chatbox and connects to PORT 5001 for follow-ups
async function sendAIChat() {
  const inputEl = document.getElementById('ai-input');
  const msg = inputEl.value.trim();
  if (!msg) return;
  inputEl.value = '';

  const container = document.getElementById('ai-msgs');
  container.insertAdjacentHTML('beforeend', `
    <div class="msg user">
      <div class="msg-bubble">${msg}</div>
      <div class="msg-time">Now</div>
    </div>`);
  container.scrollTop = container.scrollHeight;

  // New Logic: Check if they typed instead of clicking buttons
  if (userMajor === "" || userCategory === "") {
      userMajor = "IT Student"; 
      userCategory = msg;       
      
      const quickReplies = document.querySelectorAll('.quick-replies-container');
      quickReplies.forEach(el => el.style.display = 'none');
      
      sendInitialDataToBackend(userMajor, userCategory);
      return; 
  }

  const typingId = 'typing-' + Date.now();
  container.insertAdjacentHTML('beforeend', `
    <div class="msg bot" id="${typingId}">
      <div class="msg-bubble"><i class="bi bi-three-dots" style="font-size:1.2rem;letter-spacing:4px;animation:blink 1s infinite"></i></div>
    </div>`);
  container.scrollTop = container.scrollHeight;

  try {
    // ⚠️ UPDATED TO 5001
    const response = await fetch('http://127.0.0.1:5001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    const data = await response.json();
    document.getElementById(typingId).remove();
    appendBotMessage(data.reply);
  } catch (error) {
    document.getElementById(typingId).remove();
    appendBotMessage("❌ Sorry, the AI is offline. Please check your Python server.");
  }
}
/* ─── Toast ─── */
function showToast(type, title, msg) {
  const iconMap = { success: 'bi-check-circle-fill', danger: 'bi-x-circle-fill', info: 'bi-info-circle-fill', warning: 'bi-exclamation-triangle-fill' };
  const colorMap = { success: 'var(--success)', danger: 'var(--danger)', info: 'var(--primary)', warning: 'var(--warning)' };
  const id = 'toast-' + Date.now();
  const container = document.getElementById('toast-container');
  container.insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast-sgpms d-flex align-items-center gap-3 mb-2">
      <i class="bi ${iconMap[type]}" style="color:${colorMap[type]};font-size:1.2rem;flex-shrink:0"></i>
      <div><div class="fw-semibold" style="font-size:0.88rem">${title}</div><div class="text-muted" style="font-size:0.82rem">${msg}</div></div>
    </div>`);
  setTimeout(() => { const el = document.getElementById(id); if (el) el.remove(); }, 3500);
}

/* ─── Section init ─── */
function initSection(section) {
  
  // Animate progress bars
  setTimeout(() => {
    document.querySelectorAll('.progress-sgpms .bar').forEach(b => {
      const w = b.style.width; b.style.width = '0'; setTimeout(() => { b.style.width = w; }, 50);
    });
    document.querySelectorAll('.sup-cap-bar .fill').forEach(f => {
      const w = f.style.width; f.style.width = '0'; setTimeout(() => { f.style.width = w; }, 50);
    });
  }, 80);
  if (section === 'ai') {
    startSGPMSChat();
  }
}

/* ─── Close modal on backdrop click ─── */
document.addEventListener('click', function (e) {
  const modal = document.getElementById('login-modal');
  if (modal && modal.style.display !== 'none' && e.target === modal) closeLogin();
});

/* Add blink keyframe for AI typing */
const style = document.createElement('style');
style.textContent = '@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}';
document.head.appendChild(style);

/* ─── Generic Mock Fetch ─── */
async function fetchMockData(dataArray) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dataArray);
    }, 500);
  });
}