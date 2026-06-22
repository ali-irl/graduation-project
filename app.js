/* ══════════════════════════════════════════════════════════
   SGPMS – app.js  |  Master Frontend Logic & Simulation
   ══════════════════════════════════════════════════════════ */

/* ─── Global State ─── */
let currentRole = null;


/* ══════════════════════════════════════════════════════════
   SIMULATION ENGINE (LocalStorage Initialization)
   ══════════════════════════════════════════════════════════ */
function initSimulationDB() {
  if (!localStorage.getItem('sgpms_project_title')) localStorage.setItem('sgpms_project_title', 'Not Set');
  if (!localStorage.getItem('sgpms_supervisor')) localStorage.setItem('sgpms_supervisor', 'Unassigned');
  if (!localStorage.getItem('sgpms_req_supervisor')) localStorage.setItem('sgpms_req_supervisor', '');
  if (!localStorage.getItem('sgpms_progress_percent')) localStorage.setItem('sgpms_progress_percent', '0');
  if (!localStorage.getItem('sgpms_current_phase')) localStorage.setItem('sgpms_current_phase', 'Not Started');
  if (!localStorage.getItem('sgpms_project_status')) localStorage.setItem('sgpms_project_status', 'none');
  if (!localStorage.getItem('sgpms_meetings')) localStorage.setItem('sgpms_meetings', JSON.stringify([]));
  if (!localStorage.getItem('sgpms_files')) {
    localStorage.setItem('sgpms_files', JSON.stringify([
      { name: 'Project_Proposal.pdf', type: 'PDF', size: '1.2 MB', date: 'Oct 20' }
    ]));
  }

  if (!localStorage.getItem('sgpms_sim_team')) {
    localStorage.setItem('sgpms_sim_team', JSON.stringify([]));
  }
  if (!localStorage.getItem('sgpms_sim_invites')) {
    localStorage.setItem('sgpms_sim_invites', JSON.stringify([]));
  }
}

/* ══════════════════════════════════════════════════════════
   INITIALIZATION & API SETUP
   ══════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  initSimulationDB();

  const savedRole = sessionStorage.getItem('currentUserRole');
  if (savedRole) {
    currentRole = savedRole;
    updateSidebarUI();
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageElement = document.getElementById('page-' + currentRole);
    if (pageElement) pageElement.classList.add('active');

    if (currentRole === 'student') renderStudentDashboard();
    if (currentRole === 'doctor') renderDoctorDashboard();
    if (currentRole === 'admin') renderAdminDashboard();
  }
});

const API_BASE_URL = 'http://127.0.0.1:5000/api/';

async function apiCall(endpoint, method = 'GET', body = null) {
  const url = API_BASE_URL + endpoint;
  const options = {
    method: method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Server Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`🚨 API Error [${endpoint}]:`, error);
    showToast('danger', 'Connection Failed', 'Unable to reach the server.');
    throw error;
  }
}

/* ══════════════════════════════════════════════════════════
   LOGIN & AUTHENTICATION
   ══════════════════════════════════════════════════════════ */
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

async function doLogin() {
  const userId = document.getElementById('login-id').value.trim();
  const userPass = document.getElementById('login-pass').value.trim();

  if (userId === '' || userPass === '') {
    showToast('warning', 'Missing Fields', 'Please enter both your University ID and password.');
    return;
  }

  showToast('info', 'Authenticating...', 'Checking credentials...');

  try {
    const response = await apiCall('login', 'POST', {
      id: userId,
      password: userPass,
      role: currentRole
    });

    if (response.status === 'success') {
      const user = response.user;
      sessionStorage.setItem('currentUserRole', currentRole);
      sessionStorage.setItem('currentUserName', user.name);
      sessionStorage.setItem('currentUserInitials', user.initials);
      sessionStorage.setItem('currentUserId', user.id);

      updateSidebarUI();
      closeLogin();
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById('page-' + currentRole).classList.add('active');

      if (currentRole === 'student') renderStudentDashboard();
      if (currentRole === 'doctor') renderDoctorDashboard();
      if (currentRole === 'admin') renderAdminDashboard();

      document.getElementById('login-id').value = '';
      document.getElementById('login-pass').value = '';
      showToast('success', 'Welcome back!', `Logged in as ${user.name}`);
    } else {

      showToast('danger', 'Login Failed', response.message);
    }
  } catch (error) {
    showToast('danger', 'Connection Error', 'Could not connect to the authentication server.Make sure students have been uploaded or Ensure Python is running.');
  }
}

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
  showToast('info', 'Logging out...', 'Securely closing your session.');
  await new Promise(resolve => setTimeout(resolve, 800));
  sessionStorage.removeItem('currentUserRole');

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-landing').classList.add('active');
  currentRole = null;
  showToast('success', 'Signed out', 'See you next time!');
}

/* ══════════════════════════════════════════════════════════
   STUDENT واجهه ال
   ══════════════════════════════════════════════════════════ */
function showStudentSection(section, el) {
  document.querySelectorAll('#student-sidebar .nav-item').forEach(n => n.classList.remove('active'));

  if (el) {
    el.classList.add('active');
  } else {
    const targetNav = Array.from(document.querySelectorAll('#student-sidebar .nav-item'))
      .find(n => n.getAttribute('onclick') && n.getAttribute('onclick').includes(`'${section}'`));
    if (targetNav) targetNav.classList.add('active');
  }

  const fn = {
    dashboard: studentDashboard,
    supervisors: studentSupervisors,
    register: studentRegister,
    progress: studentProgress,
    meetings: studentMeetings,
    ai: studentAI,
    files: studentFiles,
    network: studentNetwork
  };

  document.getElementById('student-content').innerHTML = fn[section]?.() || '';
  initSection(section);
}

function renderStudentDashboard() {
  const dashboardTab = document.querySelector('#student-sidebar .nav-item');
  showStudentSection('dashboard', dashboardTab);
}

/* --- Student: Dashboard --- */
function studentDashboard() {
  loadStudentDashboardData();
  const fullName = sessionStorage.getItem('currentUserName') || 'Student';
  const firstName = fullName.split(' ')[0]; 

  return `
  <div class="page-header">
    <div class="page-title">Welcome back, ${firstName} </div>
    <div class="page-sub mt-1">Computer Information Systems · Jordan University of Science and Technology</div>
  </div>
  <div id="dashboard-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

/* --- Student: Dashboard --- */
async function loadStudentDashboardData() {
  try {
    const currentUserId = sessionStorage.getItem('currentUserId');
    const noCache = '?t=' + new Date().getTime();

    let myGroupInfo = { has_group: false };
    try {
        const groupRes = await fetch(`http://127.0.0.1:5000/api/my_group/${currentUserId}${noCache}`);
        if (groupRes.ok) myGroupInfo = await groupRes.json();
    } catch(e) {}

    let titleDisplay = 'No Project Registered';
    let supDisplay = 'Pending Assignment';
    let statusDisplay = 'none';
    let pctValue = 0;
    let phaseDisplay = 'Not Started';
    let feedbackDisplay = 'No feedback logged yet for this phase.'; 
    let reqId = null;
    let supervisorId = null;
    let badgeClass = 'badge-rejected';
    let statusText = 'NONE';

    if (myGroupInfo.has_group) {
        const requestsRes = await fetch(`http://127.0.0.1:5000/api/requests${noCache}`);
        if(requestsRes.ok) {
            let allRequests = await requestsRes.json();
            
            
            allRequests.sort((a, b) => b.id - a.id);
            
            const myRequest = allRequests.find(r => 
                r.group_id === myGroupInfo.group_id || 
                (r.group && r.group.toLowerCase() === myGroupInfo.group_name.toLowerCase())
            );

            if (myRequest) {
                reqId = myRequest.id;
                supervisorId = myRequest.supervisor_id;
                statusDisplay = myRequest.status;
                
                if (statusDisplay === 'pending_admin') {
                    titleDisplay = 'Pending Admin Approval';
                    supDisplay = 'Pending Assignment';
                    badgeClass = 'badge-warning';
                    statusText = 'PENDING ADMIN';
                } else {
                    titleDisplay = myRequest.project || 'Untitled Project';
                    supDisplay = myRequest.supervisor ? myRequest.supervisor.replace('Dr. ', '') : 'Assigned Doctor';
                    
                    if (statusDisplay === 'pending_doctor') {
                        badgeClass = 'badge-info';
                        statusText = 'WAITING DOCTOR';
                    }
                    else if (statusDisplay === 'approved' || statusDisplay === 'ongoing') {
                        badgeClass = 'badge-ongoing bg-success text-white border-0';
                        statusText = 'ONGOING';
                    }
                    else if (statusDisplay.includes('rejected')) {
                        badgeClass = 'badge-danger bg-danger text-white border-0';
                        statusText = 'REJECTED';
                    }
                }
            }
        }
    }

    if (statusDisplay === 'approved' || statusDisplay === 'ongoing') {
        const progRes = await fetch(`http://127.0.0.1:5000/api/get_progress${noCache}`);
        if(progRes.ok) {
            const allProgress = await progRes.json();
            const pData = allProgress.find(p => String(p.project_id) === String(reqId));
            if (pData) {
                pctValue = pData.progress;
                phaseDisplay = pData.phase ? pData.phase.trim() : 'Requirement Analysis';
                feedbackDisplay = pData.feedback || 'No feedback logged yet for this phase.';
            }
        }
    }

    let meetList = [];
    if (supervisorId && statusDisplay !== 'pending_admin') {
        const meetRes = await fetch(`http://127.0.0.1:5000/api/meetings/${supervisorId}${noCache}`);
        if (meetRes.ok) {
            const allMeetings = await meetRes.json();
            meetList = allMeetings.filter(m => String(m.group_name).toLowerCase() === String(myGroupInfo.group_name).toLowerCase());
        }
    }

    const pctDisplay = (statusDisplay !== 'none' && !statusDisplay.includes('rejected') && statusDisplay !== 'pending_admin') ? pctValue + '% Complete' : '0% Complete';

    let milestonesHtml = '';
    if (statusDisplay !== 'none' && statusDisplay !== 'pending_admin') {
        const phases = ['Requirement Analysis', 'System Design', 'Implementation', 'Testing', 'Deployment'];
        
        let currentPhaseIdx = phases.findIndex(p => p.toLowerCase() === phaseDisplay.toLowerCase());
        if (currentPhaseIdx === -1) currentPhaseIdx = 0; 
        
        milestonesHtml = `
        <div class="fw-semibold mb-3 mt-4" style="font-size:0.9rem;color:var(--muted);letter-spacing:0.5px;text-transform:uppercase">Development Milestones</div>
        ${phases.map((ph, idx) => {
            const isDone = (statusDisplay === 'approved' || statusDisplay === 'ongoing') && idx <= currentPhaseIdx;
            const isCurrent = (statusDisplay === 'approved' || statusDisplay === 'ongoing') && idx === currentPhaseIdx;
            return `
            <div class="timeline-item">
              <div class="timeline-dot" style="background:${isDone ? 'var(--success)' : 'var(--border)'}; box-shadow:${isCurrent ? '0 0 0 3px rgba(40,167,69,0.2)' : 'none'}"></div>
              <div class="flex-1">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="fw-${isDone ? '600' : '500'}" style="color:${isDone ? 'var(--text)' : 'var(--muted)'}">${ph}</span>
                </div>
                ${isDone ? '<div class="text-xs mt-1" style="color:var(--success)"><i class="bi bi-check-circle-fill me-1"></i>Completed</div>' : ''}
              </div>
            </div>`;
        }).join('')}
        
        ${(statusDisplay === 'approved' || statusDisplay === 'ongoing') ? `
        <div class="mt-4 p-3 rounded-3 border shadow-sm" style="background:var(--bg); border-left: 4px solid var(--primary) !important;">
          <div class="fw-bold mb-2" style="color: var(--primary); font-size: 0.9rem;"><i class="bi bi-chat-quote-fill me-2"></i>Supervisor's Latest Feedback</div>
          <div class="text-dark" style="font-size: 0.85rem; line-height: 1.6;">${feedbackDisplay}</div>
        </div>` : ''}
        `;
    }

    const contentHtml = `
      <div class="row g-4 mb-4">
        ${statCard('bi-file-earmark-check-fill', 'My Project', titleDisplay, 'blue')}
        ${statCard('bi-person-badge-fill', 'Supervisor', supDisplay, 'gold')}
        ${statCard('bi-bar-chart-fill', 'Progress', pctDisplay, 'green')}
        ${statCard('bi-calendar-check-fill', 'Next Meeting', meetList.length > 0 ? meetList[0].date : 'None Scheduled', 'purple')}
      </div>
      <div class="row g-4">
        <div class="col-lg-7">
          <div class="card-sgpms p-4 shadow-sm border-0">
            <div class="section-header mb-3 border-bottom pb-3">
              <div class="fw-bold" style="font-size:1.1rem">Project Progress</div>
              <span class="badge-status ${badgeClass} px-3 py-2">${statusText}</span>
            </div>
            <div class="d-flex justify-content-between mb-2 mt-4">
              <span class="text-muted small">Current Phase: <strong class="text-dark">${statusDisplay === 'pending_admin' ? 'Pending Approval' : phaseDisplay}</strong></span>
              <span class="fw-bold fs-5" style="color:var(--primary)">${statusDisplay === 'pending_admin' ? '0' : pctValue}%</span>
            </div>
            <div class="progress-sgpms mb-4" style="height: 10px;"><div class="bar" style="width:${statusDisplay === 'pending_admin' ? '0' : pctValue}%; background:var(--primary);"></div></div>
            ${milestonesHtml}
          </div>
        </div>
        <div class="col-lg-5">
          <div class="card-sgpms p-4 mb-4 shadow-sm border-0">
            <div class="fw-bold mb-3 text-primary"><i class="bi bi-calendar-event me-2"></i>Upcoming Meetings</div>
            <div class="d-flex flex-column gap-3">
              ${meetList.length > 0 ? meetList.map(m => {
                  const dtParts = m.date.split(' ');
                  return `
                <div class="d-flex align-items-center gap-3 p-3 rounded-3 border bg-white shadow-sm" style="transition: 0.2s;">
                  <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">
                    <i class="bi bi-camera-video-fill"></i>
                  </div>
                  <div class="flex-grow-1 overflow-hidden">
                    <div class="fw-bold text-truncate" style="font-size:0.9rem">${m.notes}</div>
                    <div class="text-muted text-xs mt-1"><i class="bi bi-clock me-1"></i>${dtParts[1] || ''} - ${dtParts[0] || m.date}</div>
                  </div>
                  <a href="${m.link || '#'}" target="_blank" class="btn btn-sm text-white px-3" style="background-color:#5558af; border-radius: 6px;">
                    Join
                  </a>
                </div>`}).join('') : '<div class="text-muted text-center py-3 text-sm bg-light rounded border"><i class="bi bi-calendar-x d-block fs-4 mb-2"></i>No meetings scheduled yet.</div>'}
            </div>
          </div>
          
          <div class="card-sgpms p-4 shadow-sm border-0">
            <div class="fw-bold mb-3">Quick Actions</div>
            <div class="d-flex flex-column gap-2">
              <button class="btn btn-sm text-start d-flex align-items-center gap-2" style="background:var(--bg);border-radius:10px;padding:12px 14px" onclick="showStudentSection('ai',null)">
                <i class="bi bi-robot" style="color:var(--accent)"></i><span class="fw-semibold">Generate Ideas with AI</span>
              </button>
              <button class="btn btn-sm text-start d-flex align-items-center gap-2" style="background:var(--bg);border-radius:10px;padding:12px 14px" onclick="showStudentSection('files',null)">
                <i class="bi bi-upload" style="color:var(--primary)"></i><span class="fw-semibold">Upload Project Files</span>
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
    console.error("Error loading student dashboard:", error);
    const container = document.getElementById('dashboard-container');
    if (container) {
      container.className = '';
      container.innerHTML = '<div class="alert alert-danger w-100">Failed to load dashboard data. Please refresh.</div>';
    }
  }
}

/* --- Student: Supervisors --- */
function studentSupervisors() {
  loadSupervisorsData();
  return `
  <div class="page-header">
    <div class="page-title">Available Supervisors</div>
    <div class="page-sub mt-1">Browse and select your graduation project supervisor</div>
  </div>
  <div id="supervisors-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

async function loadSupervisorsData() {
  try {
    let dbSupervisors;
    try { dbSupervisors = await apiCall('supervisors'); } catch (_) { dbSupervisors = []; }


    let dbRequests;
    To: try { dbRequests = await apiCall('requests'); } catch (_) { dbRequests = []; }

    const cardsHtml = dbSupervisors.map(s => {
      const activeProjectsCount = dbRequests.filter(r => {
        if (r.status !== 'approved' && r.status !== 'ongoing') return false;
        const sId = String(s.id);
        const rSupId = String(r.supervisor_id);
        const rSupStr = String(r.supervisor).replace('Doctor ID: ', '').trim();
        return (sId === rSupId) || (sId === rSupStr);
      }).length;

      const currentGroups = (s.groups || 0) + activeProjectsCount;
      const maxGroups = s.max || 5;
      const pct = Math.round((currentGroups / maxGroups) * 100);

      const available = currentGroups < maxGroups;
      const fillClass = pct >= 100 ? 'fill-high' : pct >= 60 ? 'fill-mid' : 'fill-low';

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
              <span class="text-xs fw-semibold">${currentGroups}/${maxGroups}</span>
            </div>
            <div class="sup-cap-bar"><div class="fill ${fillClass}" style="width:${pct}%"></div></div>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-1">
            <span class="chip"><i class="bi bi-circle-fill me-1" style="font-size:0.5rem;color:${available ? 'var(--success)' : 'var(--danger)'}"></i>${available ? 'Available' : 'Full'}</span>
            
            <button class="btn-primary-sgpms btn-sm ${!available ? 'disabled' : ''}" data-sup-name="${s.name}" onclick="handleSupervisorSelect(this)" ${!available ? 'disabled' : ''}>
              Select <i class="bi bi-arrow-right ms-1"></i>
            </button>
          </div>
        </div>
      </div>`;
    }).join('');

    const container = document.getElementById('supervisors-container');
    if (container) {
      container.className = 'row g-4';
      container.innerHTML = cardsHtml;
      initSection('supervisors');
    }
  } catch (error) {
    console.error("Error loading student supervisors:", error);
    document.getElementById('supervisors-container').innerHTML = '<div class="alert alert-danger w-100">Failed to load supervisors.</div>';
  }
}

function handleSupervisorSelect(buttonElement) {
  const supervisorName = buttonElement.getAttribute('data-sup-name');
  selectSupervisorAndRegister(supervisorName);
}

function selectSupervisorAndRegister(supervisorName) {
  sessionStorage.setItem('preselected_supervisor', supervisorName);
  const registerTab = Array.from(document.querySelectorAll('#student-sidebar .nav-item'))
    .find(n => n.getAttribute('onclick') && n.getAttribute('onclick').includes('register'));
  showStudentSection('register', registerTab);
}

/* --- Student: Register --- */
function studentRegister() {
  loadRegistrationData();
  return `
  <div class="page-header">
    <div class="page-title">Project Registration</div>
    <div class="page-sub mt-1">Submit your graduation project request to the department</div>
  </div>
  <div id="register-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

/* --- Student: Register  --- */
async function loadRegistrationData() {
  try {
    const currentUserId = sessionStorage.getItem('currentUserId');
    const noCache = '?t=' + new Date().getTime();
    
    let myGroupInfo = { has_group: false };
    try {
        const groupRes = await fetch(`http://127.0.0.1:5000/api/my_group/${currentUserId}${noCache}`);
        if (groupRes.ok) myGroupInfo = await groupRes.json();
    } catch(e) {}

    let dbSupervisors = await apiCall('supervisors').catch(() => []);
    let dbRequests = await apiCall('requests').catch(() => []);

    const enrichedSupervisors = dbSupervisors.map(sup => {
      const activeCount = dbRequests.filter(r => {
        if (r.status !== 'approved' && r.status !== 'ongoing') return false;
        const sId = String(sup.id);
        const rSupId = String(r.supervisor_id);
        const rSupStr = String(r.supervisor).replace('Doctor ID: ', '').trim();
        return (sId === rSupId) || (sId === rSupStr);
      }).length;
      return { ...sup, isFull: activeCount >= (sup.max || 5) };
    });

    const simStatus = localStorage.getItem('sgpms_project_status') || 'none';
    const preselectedSup = sessionStorage.getItem('preselected_supervisor');
     
    const disabledAttr = simStatus !== 'none' ? 'disabled' : '';

    const prefillGroup = myGroupInfo.has_group ? myGroupInfo.group_name : '';
    const prefillMembers = myGroupInfo.has_group ? myGroupInfo.members.map(m => m.id).join(', ') : currentUserId;

    const contentHtml = `
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card-sgpms p-4">
            <h6 class="fw-bold mb-4" style="color:var(--primary)"><i class="bi bi-file-earmark-plus me-2"></i>New Project Registration</h6>
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Group Name (Editable)</label>
                <input id="group-name" class="form-control" value="${prefillGroup}" placeholder="e.g. Group Alpha" ${disabledAttr} />
              </div>
              <div class="col-12">
                <label class="form-label">Project Title (For help with project ideas,use the AI ​​Assistant section)</label>
                <input id="reg-title" class="form-control" placeholder="e.g. Smart Graduation Project System" ${disabledAttr} />
              </div>
              <div class="col-12">
                <label class="form-label">Project Description</label>
                <textarea id="reg-desc" class="form-control" rows="4" ${disabledAttr}></textarea>
              </div>
              <div class="col-md-6">
                <label class="form-label">Select Supervisor</label>
                <select id="reg-supervisor" class="form-select" ${disabledAttr}>
                  <option value="">-- Choose a Doctor --</option>
                  ${enrichedSupervisors.map(s => `<option value="${s.id}" data-name="${s.name}" ${s.isFull ? 'disabled' : ''} ${preselectedSup === s.name ? 'selected' : ''}>${s.name} (${s.area}) ${s.isFull ? ' - [FULL CAPACITY]' : ''}</option>`).join('')}
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Academic Year</label>
                <select id="reg-year" class="form-select" ${disabledAttr}><option>2025/2026 – Semester 1</option><option>2025/2026 – Semester 2</option></select>
              </div>
              <div class="col-12">
                <label class="form-label">Team Members (University IDs)</label>
                <input id="reg-members" class="form-control" value="${prefillMembers}" placeholder="e.g. 202310001, 202310002" ${disabledAttr} />
              </div>
              <div class="col-12">
                <label class="form-label">Technical Stack</label>
                <input id="reg-stack" class="form-control" placeholder="e.g. React, Node.js" ${disabledAttr} />
              </div>
              <div class="col-12 mt-3">
                <button class="btn-primary-sgpms ${disabledAttr}" onclick="submitRegistration()" ${disabledAttr}><i class="bi bi-send me-2"></i>Submit Request</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    const container = document.getElementById('register-container');
    if (container) { container.className = ''; container.innerHTML = contentHtml; }
    sessionStorage.removeItem('preselected_supervisor');
  } catch (error) { console.error(error); }
}

/* --- Student: Progress --- */
function studentProgress() {
  loadProgressData();
  return `
  <div class="page-header">
    <div class="page-title">My Project Progress</div>
    <div class="page-sub mt-1">Track your milestones and supervisor feedback</div>
  </div>
  <div id="progress-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

/* --- Student: Progress   --- */
async function loadProgressData() {
  try {
    const currentUserId = sessionStorage.getItem('currentUserId');
    const noCache = '?t=' + new Date().getTime();

    // 1. جلب اسم المجموعة والمشرف
    let myGroupInfo = { has_group: false };
    try {
        const groupRes = await fetch(`http://127.0.0.1:5000/api/my_group/${currentUserId}${noCache}`);
        if (groupRes.ok) myGroupInfo = await groupRes.json();
    } catch(e) {}

    let reqId = null;
    let supervisorId = null;
    let supervisorName = 'N/A';
    let projectTitle = 'N/A';
    
    if (myGroupInfo.has_group) {
        const requestsRes = await fetch(`http://127.0.0.1:5000/api/requests${noCache}`);
        if(requestsRes.ok) {
            const allRequests = await requestsRes.json();
            const myRequest = allRequests.find(r => r.group_id === myGroupInfo.group_id || (r.group && r.group.toLowerCase() === myGroupInfo.group_name.toLowerCase()));
            if (myRequest && (myRequest.status === 'approved' || myRequest.status === 'ongoing')) {
                reqId = myRequest.id;
                supervisorId = myRequest.supervisor_id;
                supervisorName = myRequest.supervisor;
                projectTitle = myRequest.project;
            }
        }
    }

    let pctValue = 0;
    let phaseDisplay = 'Not Started';
    if (reqId) {
        const progRes = await fetch(`http://127.0.0.1:5000/api/get_progress${noCache}`);
        if(progRes.ok) {
            const allProgress = await progRes.json();
            const pData = allProgress.find(p => String(p.project_id) === String(reqId));
            if (pData) {
                pctValue = pData.progress;
                phaseDisplay = pData.phase || 'Requirement Analysis';
            }
        }
    }

    let feedbackList = [];
    if (supervisorId) {
        const fbRes = await fetch(`http://127.0.0.1:5000/api/feedback_history/${supervisorId}${noCache}`);
        if (fbRes.ok) {
            const allFb = await fbRes.json();
            feedbackList = allFb.filter(f => String(f.g).toLowerCase() === String(myGroupInfo.group_name).toLowerCase());
        }
    }

    const phases = ['Requirement Analysis', 'System Design', 'Implementation', 'Testing', 'Deployment'];
    const currentPhaseIdx = phases.indexOf(phaseDisplay);

    const contentHtml = `
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card-sgpms p-4 mb-4 shadow-sm border-0">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="fw-bold fs-5 text-primary">Overall Progress</div>
            <span class="fw-bold fs-4" style="color:var(--primary)">${pctValue}%</span>
          </div>
          <div class="progress-sgpms mb-4" style="height:14px; background:var(--bg);"><div class="bar" style="width:${pctValue}%; background:linear-gradient(90deg, var(--primary), var(--accent));"></div></div>
          
          <div class="fw-semibold mb-4 border-bottom pb-2" style="font-size:0.9rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px">Project Timeline</div>
          ${phases.map((ph, idx) => {
              const isDone = reqId && idx <= currentPhaseIdx;
              const isCurrent = reqId && idx === currentPhaseIdx;
              return `
            <div class="timeline-item pb-3">
              <div class="timeline-dot" style="${isDone ? 'background:var(--success);box-shadow:0 0 0 3px rgba(40,167,69,0.2)' : 'background:var(--border)'}"></div>
              <div class="flex-1 pb-1">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="fw-${isDone ? '600' : '400'}" style="color:${isDone ? 'var(--text)' : 'var(--muted)'}; font-size: 0.95rem;">${ph}</span>
                </div>
                ${isDone ? '<div class="text-xs mt-1" style="color:var(--success)"><i class="bi bi-check-circle-fill me-1"></i>Completed Phase</div>' : `<div class="text-xs mt-1" style="color:var(--muted)"><i class="bi bi-hourglass-split me-1"></i>${isCurrent ? 'In Progress' : 'Upcoming Phase'}</div>`}
              </div>
            </div>`}).join('')}
        </div>
      </div>
      
      <div class="col-lg-4">
        <div class="card-sgpms p-4 mb-4 shadow-sm border-0">
          <div class="fw-bold mb-4 text-primary border-bottom pb-2"><i class="bi bi-chat-quote-fill me-2 text-accent"></i>Supervisor Feedback</div>
          <div class="d-flex flex-column gap-3" style="max-height: 400px; overflow-y: auto; padding-right: 5px;">
            ${feedbackList.length > 0 ? feedbackList.map(f => `
              <div class="p-3 rounded-3 bg-white border shadow-sm" style="border-left:4px solid var(--accent) !important;">
                <div style="font-size:0.88rem;line-height:1.6; color: var(--text);">${f.fb}</div>
                <div class="d-flex justify-content-between align-items-end mt-3 pt-2 border-top">
                  <span class="text-xs fw-bold text-primary">${supervisorName.replace('Dr. ', '')}</span>
                  <span class="text-xs text-muted"><i class="bi bi-calendar me-1"></i>${f.d}</span>
                </div>
              </div>`).join('') : '<div class="text-muted text-center py-4 bg-light rounded"><i class="bi bi-inbox fs-3 d-block mb-2 text-muted"></i>No feedback received yet.</div>'}
          </div>
        </div>
        
        <div class="card-sgpms p-4 shadow-sm border-0">
          <div class="fw-bold mb-3 text-primary">Project Info</div>
          ${[['Title', projectTitle], ['Supervisor', supervisorName], ['Current Phase', phaseDisplay]].map(([k, v]) => `
            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted small">${k}</span>
              <span class="fw-semibold small text-end" style="max-width: 60%;">${v}</span>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
    
    const container = document.getElementById('progress-container');
    if (container) { container.className = ''; container.innerHTML = contentHtml; }
  } catch (error) {
    console.error("Error loading progress:", error);
    const container = document.getElementById('progress-container');
    if (container) container.innerHTML = '<div class="alert alert-danger w-100">Failed to load progress data.</div>';
  }
}

/* --- Student: Meetings --- */
function studentMeetings() {
  loadMeetingsData();
  return `
  <div class="page-header">
    <div class="page-title">Meeting Schedule</div>
    <div class="page-sub mt-1">Your upcoming meetings with your supervisor</div>
  </div>
  <div id="meetings-container" class="spinner-container"><div class="spinner"></div></div>`;
}

/* --- Student: Meetings  --- */
async function loadMeetingsData() {
  try {
    const currentUserId = sessionStorage.getItem('currentUserId');
    const noCache = '?t=' + new Date().getTime();

   
    let myGroupInfo = { has_group: false };
    try {
        const groupRes = await fetch(`http://127.0.0.1:5000/api/my_group/${currentUserId}${noCache}`);
        if (groupRes.ok) myGroupInfo = await groupRes.json();
    } catch(e) {}

    let supervisorId = null;
    let supervisorName = 'Pending Assignment';
    let meetList = [];

  
    if (myGroupInfo.has_group) {
        const requestsRes = await fetch(`http://127.0.0.1:5000/api/requests${noCache}`);
        if (requestsRes.ok) {
            const allRequests = await requestsRes.json();
            const myRequest = allRequests.find(r => 
                r.group_id === myGroupInfo.group_id || 
                (r.group && r.group.toLowerCase() === myGroupInfo.group_name.toLowerCase())
            );

            if (myRequest && (myRequest.status === 'approved' || myRequest.status === 'ongoing')) {
                supervisorId = myRequest.supervisor_id;
                supervisorName = myRequest.supervisor ? myRequest.supervisor.replace('Dr. ', '') : 'Assigned Doctor';
            }
        }
    }

   
    if (supervisorId) {
        const meetRes = await fetch(`http://127.0.0.1:5000/api/meetings/${supervisorId}${noCache}`);
        if (meetRes.ok) {
            const allMeetings = await meetRes.json();
            meetList = allMeetings.filter(m => String(m.group_name).toLowerCase() === String(myGroupInfo.group_name).toLowerCase());
        }
    }

   
    const contentHtml = `
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="d-flex flex-column gap-3">
            ${meetList.length > 0 ? meetList.map(m => {
            
              const dtParts = m.date.split(' ');
              const dateOnly = dtParts[0] || m.date;
              const timeOnly = dtParts[1] || '';
              
              const month = dateOnly.length >= 7 ? dateOnly.slice(5, 7) : '--';
              const day = dateOnly.length >= 10 ? dateOnly.slice(8, 10) : '--';
              
              return `
              <div class="p-3 border rounded-3 d-flex align-items-center gap-3 shadow-sm bg-white" style="transition: 0.2s;">
                <div style="width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;font-size:0.9rem;font-weight:700">
                  <span>${month}/${day}</span>
                </div>
                <div class="flex-1">
                  <div class="fw-bold text-dark" style="font-size:1.05rem;">${m.notes}</div>
                  <div class="text-muted mt-1" style="font-size:0.85rem;"><i class="bi bi-clock me-1 text-primary"></i>${timeOnly}</div>
                </div>
                <a href="${m.link || '#'}" target="_blank" class="btn text-white px-4 rounded-pill d-flex align-items-center gap-2" style="font-size:0.85rem;background-color:#5558af;font-weight:500;">
                  <i class="bi bi-microsoft-teams"></i> Join
                </a>
              </div>`
            }).join('') : `
              <div class="card-sgpms p-5 text-muted text-center shadow-sm border-0 bg-light">
                <i class="bi bi-calendar-x d-block mb-3" style="font-size: 2.5rem; color: var(--muted);"></i>
                <h6 class="fw-bold">No Meetings Scheduled</h6>
                <span class="text-xs">Your supervisor has not scheduled any meetings for your group yet.</span>
              </div>
            `}
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card-sgpms p-4 shadow-sm border-0">
            <div class="fw-bold mb-3 text-primary"><i class="bi bi-info-circle-fill me-2"></i>Meeting Summary</div>
            <div class="d-flex justify-content-between py-3" style="border-bottom:1px dashed var(--border)">
              <span class="text-muted small fw-semibold">Total Meetings</span>
              <span class="fw-bold fs-5 text-primary">${meetList.length}</span>
            </div>
            <div class="d-flex justify-content-between py-3">
              <span class="text-muted small fw-semibold">Supervisor</span>
              <span class="fw-bold small text-dark">${supervisorName}</span>
            </div>
          </div>
        </div>
      </div>`;

    const container = document.getElementById('meetings-container');
    if (container) { container.className = ''; container.innerHTML = contentHtml; }
  } catch (error) { 
    console.error(" Error loading student meetings:", error); 
    const container = document.getElementById('meetings-container');
    if (container) container.innerHTML = '<div class="alert alert-danger text-center">Failed to load meetings from database.</div>';
  }
}

 /*--- Student:AI ASSISTANT---*/ 
let userMajor = "";
let userCategory = "";
const itMajors = ["Computer Science", "Computer Information Systems", "Software Engineering", "Network Engineering & Security", "Cyber Security", "Artificial Intelligence", "Data Science", "Health Information Systems"];
const projectCategories = ["Mobile Dev", "Web Dev", "AI", "Cybersecurity", "AI / Health IT", "Security / IoT", "AI / Analytics"];

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

function showQuickReplies(options, callback) {
  const container = document.getElementById('ai-msgs');
  if (!container) return;
  const replyDiv = document.createElement('div');
  replyDiv.className = 'd-flex flex-wrap gap-2 mt-2 quick-replies-container';

  options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.style.cssText = 'cursor:pointer;border:1px solid var(--primary);background:var(--surface);transition:0.2s;';
    btn.innerText = option;
    btn.onclick = () => {
      replyDiv.remove();
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

function startSGPMSChat() {
  const container = document.getElementById('ai-msgs');
  if (!container) return;
  container.innerHTML = '';
  userMajor = "";
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

async function sendInitialDataToBackend(major, category) {
  appendBotMessage("Analyzing data and matching with supervisors... <i class='bi bi-hourglass-split' style='animation:blink 1s infinite'></i>");
  try {
    const response = await fetch('http://127.0.0.1:5001/api/init_chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ major, interests: category })
    });
    const data = await response.json();
    const msgs = document.getElementById('ai-msgs');
    if (msgs && msgs.lastElementChild) msgs.lastElementChild.remove();
    appendBotMessage(data.reply);
    document.getElementById('ai-input').disabled = false;
    document.getElementById('ai-input').focus();
  } catch (error) {
    const msgs = document.getElementById('ai-msgs');
    if (msgs && msgs.lastElementChild) msgs.lastElementChild.remove();
    appendBotMessage(" Error connecting to the Python AI. Make sure Ai.py is running on port 5001.");
  }
}

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

  if (userMajor === "" || userCategory === "") {
    userMajor = "IT Student";
    userCategory = msg;
    document.querySelectorAll('.quick-replies-container').forEach(el => el.style.display = 'none');
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
    const response = await fetch('http://127.0.0.1:5001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    const data = await response.json();
    document.getElementById(typingId)?.remove();
    appendBotMessage(data.reply);
  } catch (error) {
    document.getElementById(typingId)?.remove();
    appendBotMessage(" Sorry, the AI is offline. Please check your Python server.");
  }
}


/* --- Student: Files  --- */
function studentFiles() {
  setTimeout(() => loadFilesData(), 50);
  return `
  <div class="page-header">
    <div class="page-title">My Files</div>
    <div class="page-sub mt-1">Upload and manage your project documents</div>
  </div>
  <input type="file" id="real-file-upload" style="display: none;" accept=".pdf,.doc,.docx,.pptx,.zip" onchange="uploadRealFile(event)">
  <div id="files-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

async function loadFilesData() {
  try {
    const currentUserId = sessionStorage.getItem('currentUserId');
    const noCache = '?t=' + new Date().getTime();

  
    let myGroupInfo = { has_group: false };
    try {
        const groupRes = await fetch(`http://127.0.0.1:5000/api/my_group/${currentUserId}${noCache}`);
        if (groupRes.ok) myGroupInfo = await groupRes.json();
    } catch(e) {}

    let reqId = null;
    let isApproved = false; 
    
    if (myGroupInfo.has_group) {
        const requestsRes = await fetch(`http://127.0.0.1:5000/api/requests${noCache}`);
        if (requestsRes.ok) {
            const allRequests = await requestsRes.json();
            const myRequest = allRequests.find(r => r.group_id === myGroupInfo.group_id || (r.group && r.group.toLowerCase() === myGroupInfo.group_name.toLowerCase()));
            if (myRequest) {
                reqId = myRequest.id; 
                if (myRequest.status === 'approved' || myRequest.status === 'ongoing') {
                    isApproved = true;
                }
            }
        }
    }

    
    let savedFiles = [];
    if (reqId) {
        const filesRes = await fetch(`http://127.0.0.1:5000/api/files/${reqId}${noCache}`);
        if (filesRes.ok) savedFiles = await filesRes.json();
    }

   
    const storagePercent = Math.min(savedFiles.length * 5, 100);
    const storageUsed = (savedFiles.length * 1.5).toFixed(2) + ' MB'; 

    const hasProposal = savedFiles.some(f => String(f.name).toLowerCase().includes('proposal'));
    const hasSRS = savedFiles.some(f => String(f.name).toLowerCase().includes('srs'));
    const hasDesign = savedFiles.some(f => String(f.name).toLowerCase().includes('design'));

    const contentHtml = `
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card-sgpms p-4 mb-4 border border-primary">
            <h6 class="fw-bold mb-3 text-primary"><i class="bi bi-journal-bookmark-fill me-2"></i>Graduation Project 1 Resources</h6>
            <div class="d-flex flex-column gap-2">
              <div class="d-flex align-items-center justify-content-between p-3 rounded-3" style="background:var(--bg)">
                <div>
                  <div class="fw-semibold" style="font-size:0.88rem"><i class="bi bi-file-earmark-word-fill text-primary me-2"></i>GP1 Official Template</div>
                  <div class="text-xs text-muted">Empty template to fill out your project details</div>
                </div>
                <a href="misc/Graduation Project Template .doc" download class="btn btn-sm btn-outline-primary"><i class="bi bi-download me-1"></i> Download Template</a>
              </div>
              <div class="d-flex align-items-center justify-content-between p-3 rounded-3" style="background:var(--bg)">
                <div>
                  <div class="fw-semibold" style="font-size:0.88rem"><i class="bi bi-file-earmark-pdf-fill text-danger me-2"></i>GP1 Filled Example</div>
                  <div class="text-xs text-muted">Example of an A+ graded graduation project document</div>
                </div>
                <a href="misc/GP1 filled example.docx" download class="btn btn-sm btn-outline-danger"><i class="bi bi-download me-1"></i> Download Example</a>
              </div>
            </div>
          </div>
          <div class="card-sgpms p-4 mb-4 position-relative">
            ${!isApproved ? '<div class="position-absolute top-0 start-0 w-100 h-100 bg-white opacity-75 d-flex align-items-center justify-content-center" style="z-index: 10; border-radius: inherit;"><div class="fw-bold text-danger bg-white p-2 rounded shadow-sm"><i class="bi bi-lock-fill me-2"></i>Project must be approved by Doctor to upload files</div></div>' : ''}
            
            <div class="file-drop" style="cursor:pointer;" onclick="document.getElementById('real-file-upload').click()">
              <i class="bi bi-cloud-arrow-up" style="font-size: 2rem; color: var(--primary);"></i>
              <div class="fw-semibold mb-1 mt-2">Click or Drag & drop files here</div>
              <div class="text-muted small">Supports PDF, DOCX, PPTX · Max 50MB per file</div>
              <button class="btn-primary-sgpms mt-3" style="display:inline-block" onclick="event.stopPropagation(); document.getElementById('real-file-upload').click();">Browse Files</button>
            </div>
          </div>
          <div class="card-sgpms p-4">
            <div class="fw-bold mb-3">Uploaded Files</div>
            <table class="table table-sgpms">
              <thead><tr><th>File Name</th><th>Type</th><th>Size</th><th>Uploaded</th><th>Actions</th></tr></thead>
              <tbody>
                ${savedFiles.length === 0 ? '<tr><td colspan="5" class="text-center text-muted">No files uploaded yet.</td></tr>' : ''}
                ${savedFiles.map((f) => {
                  const ext = f.name.split('.').pop().toUpperCase();
                  return `
                  <tr>
                    <td class="text-truncate" style="max-width: 200px;" title="${f.name}"><i class="bi bi-file-earmark-fill me-2" style="color:var(--accent)"></i>${f.name}</td>
                    <td><span class="chip">${ext}</span></td>
                    <td class="text-muted">~ 1.5 MB</td>
                    <td>${f.date}</td>
                    <td>
                      <a href="http://127.0.0.1:5000/uploads/${f.name}" target="_blank" class="btn-sm-icon me-1 text-primary" title="Download"><i class="bi bi-download"></i></a>
                      <button class="btn-sm-icon text-danger" title="Delete" onclick="deleteRealFile(${f.id})"><i class="bi bi-trash"></i></button>
                    </td>
                  </tr>`
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card-sgpms p-4">
            <div class="fw-bold mb-3">Storage Usage</div>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted small">Used</span>
              <span class="fw-semibold small">${storageUsed} / 100 MB</span>
            </div>
            <div class="progress-sgpms mb-4"><div class="bar" style="width:${storagePercent}%"></div></div>
            <div class="fw-bold mb-3">Required Documents</div>
            <div class="d-flex align-items-center gap-2 mb-2">
              <i class="bi ${hasProposal ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'}"></i> <span style="font-size:0.88rem;">Project Proposal</span>
            </div>
            <div class="d-flex align-items-center gap-2 mb-2">
              <i class="bi ${hasSRS ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'}"></i> <span style="font-size:0.88rem;">SRS Document</span>
            </div>
            <div class="d-flex align-items-center gap-2 mb-2">
              <i class="bi ${hasDesign ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'}"></i> <span style="font-size:0.88rem;">Design Document</span>
            </div>
            <div class="d-flex align-items-center gap-2 mb-2">
              <i class="bi bi-circle text-muted"></i> <span style="font-size:0.88rem;">Final Report</span>
            </div>
          </div>
        </div>
      </div>`;

    const container = document.getElementById('files-container');
    if (container) { container.className = ''; container.innerHTML = contentHtml; }
  } catch (error) { 
    console.error("Error loading files:", error);
    document.getElementById('files-container').innerHTML = '<div class="alert alert-danger w-100 text-center">Failed to load files from database.</div>';
  }
}


async function uploadRealFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const currentUserId = sessionStorage.getItem('currentUserId');
  const noCache = '?t=' + new Date().getTime();
  
  let reqId = null;
  try {
      const groupRes = await fetch(`http://127.0.0.1:5000/api/my_group/${currentUserId}${noCache}`);
      if (groupRes.ok) {
          const myGroupInfo = await groupRes.json();
          if (myGroupInfo.has_group) {
              const requestsRes = await fetch(`http://127.0.0.1:5000/api/requests${noCache}`);
              const allRequests = await requestsRes.json();
              const myRequest = allRequests.find(r => r.group_id === myGroupInfo.group_id || (r.group && r.group.toLowerCase() === myGroupInfo.group_name.toLowerCase()));
              if (myRequest && (myRequest.status === 'approved' || myRequest.status === 'ongoing')) {
                  reqId = myRequest.id;
              }
          }
      }
  } catch(e) {}

  if (!reqId) {
      showToast('warning', 'Restricted', 'Project must be approved to upload files.');
      return;
  }

  showToast('info', 'Uploading...', 'Please wait while saving to database.');
  

  const formData = new FormData();
  formData.append('file', file);
  formData.append('project_id', reqId);

  try {
    const response = await fetch('http://127.0.0.1:5000/api/files/upload', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      showToast('success', 'Upload Complete', `${file.name} was successfully uploaded to the server.`);
      loadFilesData();
    } else {
      const errData = await response.json();
      showToast('danger', 'Upload Failed', errData.message || 'Server rejected the file.');
    }
  } catch (error) {
    showToast('danger', 'Connection Error', 'Could not reach server.');
  }
  event.target.value = '';
}


async function deleteRealFile(fileId) {
  if (!confirm("Are you sure you want to permanently delete this file from the database?")) return;
  
  try {
    const response = await fetch(`http://127.0.0.1:5000/api/files/delete/${fileId}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      showToast('info', 'File Deleted', `File has been removed successfully.`);
      loadFilesData();
    } else {
      showToast('danger', 'Error', 'Could not delete file from database.');
    }
  } catch (error) {
    showToast('danger', 'Connection Error', 'Server not responding.');
  }
}

/* --- Student: Network & Groups --- */
function studentNetwork() {
  setTimeout(loadNetworkData, 50);
  return `
  <div class="page-header">
    <div class="page-title">Network & Groups</div>
    <div class="page-sub mt-1">Form your graduation project team and invite members</div>
  </div>
  <div id="network-container" class="spinner-container"><div class="spinner"></div></div>`;
}

async function loadNetworkData() {
  try {
    const currentId = sessionStorage.getItem('currentUserId');
    const currentName = sessionStorage.getItem('currentUserName');

    let invites = JSON.parse(localStorage.getItem('sgpms_sim_invites')) || [];
    const myInvites = invites.filter(inv => String(inv.toId) === String(currentId));


    const noCacheStr = '?t=' + new Date().getTime();

    let myGroupInfo = { has_group: false };
    try {
        const groupRes = await fetch(`http://127.0.0.1:5000/api/my_group/${currentId}${noCacheStr}`);
        if (groupRes.ok) myGroupInfo = await groupRes.json();
    } catch (e) { console.error("Flask Group Endpoint Error"); }

    let dbStudents = [];
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/students${noCacheStr}`);
      if (res.ok) dbStudents = await res.json();
    } catch (e) { console.error("Flask DB Error"); }


    let invitesHtml = '';
    if (myInvites.length > 0 && !myGroupInfo.has_group) {
      invitesHtml = `
        <div class="card-sgpms p-4 mb-4 border border-warning" style="background-color: #fffdf5;">
          <h6 class="fw-bold mb-3 text-warning"><i class="bi bi-envelope-paper-fill me-2"></i>Pending Invitations</h6>
          ${myInvites.map((inv, idx) => `
            <div class="d-flex justify-content-between align-items-center p-3 rounded border bg-white mb-2 shadow-sm">
              <div>
                <div class="fw-bold text-dark">${inv.fromName}</div>
                <div class="text-xs text-muted">Invited you to join their group.</div>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-success px-3" onclick="acceptSimInvite(${idx})"><i class="bi bi-check-lg"></i></button>
                <button class="btn btn-sm btn-outline-danger px-3" onclick="rejectSimInvite(${idx})"><i class="bi bi-x-lg"></i></button>
              </div>
            </div>
          `).join('')}
        </div>`;
    }


    let myGroupHtml = '';
    if (myGroupInfo.has_group) {
      myGroupHtml = `
        <div class="card-sgpms p-4 mb-4 border-start border-4 border-success">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 class="fw-bold mb-0 text-success"><i class="bi bi-shield-check me-2"></i>${myGroupInfo.group_name}</h6>
              <div class="text-muted text-xs mt-1">Group ID: #${myGroupInfo.group_id || 'N/A'}</div>
            </div>
            <span class="badge bg-success rounded-pill">${myGroupInfo.members.length} / 5</span>
          </div>
          <div class="d-flex flex-column gap-2">
            ${myGroupInfo.members.map(m => {
              let inits = m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
              let isMe = String(m.id) === String(currentId);
              return `
              <div class="d-flex align-items-center gap-3 p-2 border rounded ${isMe ? 'bg-light' : ''}">
                <div class="avatar-circle ${isMe ? 'bg-warning' : 'bg-primary'} text-white d-flex align-items-center justify-content-center" style="width:35px;height:35px;border-radius:50%;font-size:0.8rem;">
                  ${inits}
                </div>
                <div class="flex-1">
                  <div class="fw-semibold" style="font-size:0.88rem">${m.name} ${isMe ? '<span class="text-success text-xs">(You)</span>' : ''}</div>
                  <div class="text-muted text-xs">ID: ${m.id}</div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>`;
    } else {
      myGroupHtml = `
        <div class="card-sgpms p-4 mb-4 text-center">
          <i class="bi bi-people-fill text-muted mb-2" style="font-size:2rem;"></i>
          <h6 class="fw-bold text-muted">No Group Assigned</h6>
          <div class="text-xs text-muted">You are not in a group yet. Form a team or wait for Admin assignment.</div>
        </div>`;
    }

    let dbHtml = '';
    if (dbStudents.length === 0) {
      dbHtml = `<div class="col-12 text-center text-muted py-4">No students found.</div>`;
    } else {
      dbHtml = dbStudents.map(s => {
        if (String(s.id) === String(currentId)) return ''; 

        const alreadyInGroup = s.group_name && s.group_name !== "";

        const alreadyInvited = invites.some(inv => String(inv.toId) === String(s.id) && String(inv.fromId) === String(currentId));

        let statusBtn = alreadyInGroup 
          ? `<button class="btn btn-secondary btn-sm w-100 disabled" style="opacity:0.8"><i class="bi bi-shield-lock-fill me-1"></i>In ${s.group_name}</button>`
          : alreadyInvited
          ? `<button class="btn btn-secondary btn-sm w-100 disabled"><i class="bi bi-envelope-check-fill me-1"></i>Invited</button>`
          : `<button class="btn btn-primary btn-sm w-100" onclick="sendSimInvite('${s.id}', '${s.name.replace(/'/g, "\\'")}')"><i class="bi bi-person-plus-fill me-1"></i>Invite</button>`;

        let inits = s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        return `
           <div class="col-md-6">
             <div class="card p-3 shadow-sm border-0 h-100" style="border-radius:12px;">
               <div class="d-flex gap-3 mb-3">
                 <div class="text-white d-flex align-items-center justify-content-center" style="width:45px;height:45px;border-radius:50%;background:var(--primary);">${inits}</div>
                 <div style="overflow:hidden">
                   <div class="fw-bold text-truncate" style="font-size:0.88rem;" title="${s.name}">${s.name}</div>
                   <div class="text-muted" style="font-size:0.8rem;">ID: ${s.id}</div>
                   <span class="badge bg-light text-primary border mt-1">${s.major || 'CIS'}</span>
                 </div>
               </div>
               <div class="d-flex gap-2 mt-auto">
                 ${statusBtn}
                 <a href="mailto:${s.email || ''}?subject=SGPMS" class="btn btn-outline-secondary btn-sm px-3" title="Send Email"><i class="bi bi-envelope-fill"></i></a>
               </div>
             </div>
           </div>`;
      }).join('');
    }

    const fullHtml = `
      <div class="row g-4">
        <div class="col-lg-5">
          ${invitesHtml}
          ${myGroupHtml}
        </div>
        <div class="col-lg-7">
          <div class="card-sgpms p-4">
            <h6 class="fw-bold mb-3">Classmates Directory</h6>
            <div class="row g-3">
              ${dbHtml}
            </div>
          </div>
        </div>
      </div>
    `;

    const container = document.getElementById('network-container');
    if (container) { container.className = ''; container.innerHTML = fullHtml; }
  } catch (err) { console.error(err); }
}

// ─── INVITATION LOGIC HELPER FUNCTIONS ───

function sendSimInvite(toId, toName) {
  const currentId = sessionStorage.getItem('currentUserId');
  const currentName = sessionStorage.getItem('currentUserName');

  let invites = JSON.parse(localStorage.getItem('sgpms_sim_invites')) || [];
  invites.push({ fromId: currentId, fromName: currentName, toId: toId, toName: toName });
  localStorage.setItem('sgpms_sim_invites', JSON.stringify(invites));

  showToast('success', 'Invite Sent', `An invitation was sent to ${toName}.`);
  loadNetworkData(); 
}

async function acceptSimInvite(inviteIndex) {
  const currentId = sessionStorage.getItem('currentUserId');
  const currentName = sessionStorage.getItem('currentUserName');

  let invites = JSON.parse(localStorage.getItem('sgpms_sim_invites')) || [];
  const acceptedInvite = invites[inviteIndex];

  
  invites = invites.filter(inv => String(inv.toId) !== String(currentId));
  localStorage.setItem('sgpms_sim_invites', JSON.stringify(invites));

  try {
   
    const noCache = '?t=' + new Date().getTime();
    const groupRes = await fetch(`http://127.0.0.1:5000/api/my_group/${acceptedInvite.fromId}${noCache}`);
    let inviterGroupInfo = { has_group: false };
    if (groupRes.ok) inviterGroupInfo = await groupRes.json();

    let targetGroupName = "";
    let memberIds = [];

    if (inviterGroupInfo.has_group && inviterGroupInfo.group_name) {
       
        targetGroupName = inviterGroupInfo.group_name;
       
        memberIds = inviterGroupInfo.members.map(m => String(m.id));
        memberIds.push(String(currentId));
    } else {
     
        const firstName = acceptedInvite.fromName.split(' ')[0];
        targetGroupName = `Team ${firstName}`;
        memberIds = [String(acceptedInvite.fromId), String(currentId)];
    }

    
    const response = await fetch('http://127.0.0.1:5000/api/admin_create_group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group_name: targetGroupName, members: memberIds })
    });

    const resData = await response.json();

    if (response.ok && resData.status === "success") {
      showToast('success', 'Group Joined!', `You successfully joined ${targetGroupName}.`);
      loadNetworkData(); 
    } else {
      showToast('danger', 'Database Error', resData.message);
    }
  } catch (error) {
    console.error(" Error saving invite:", error);
    showToast('danger', 'Connection Error', 'Failed to reach Python server.');
  }
}

function rejectSimInvite(inviteIndex) {
  let invites = JSON.parse(localStorage.getItem('sgpms_sim_invites')) || [];
  invites.splice(inviteIndex, 1);
  localStorage.setItem('sgpms_sim_invites', JSON.stringify(invites));
  showToast('info', 'Invite Declined', 'You have declined the invitation.');
  loadNetworkData();
}
/* ══════════════════════════════════════════════════════════
   DOCTOR واجهه ال
   ══════════════════════════════════════════════════════════ */
function renderDoctorDashboard() {
  const dashboardTab = document.querySelector('#doctor-sidebar .nav-item');
  showDoctorSection('dashboard', dashboardTab);
}

function showDoctorSection(section, el) {
  document.querySelectorAll('#doctor-sidebar .nav-item').forEach(n => n.classList.remove('active'));

  if (el) {
    el.classList.add('active');
  } else {
    const targetNav = Array.from(document.querySelectorAll('#doctor-sidebar .nav-item'))
      .find(n => n.getAttribute('onclick') && n.getAttribute('onclick').includes(`'${section}'`));
    if (targetNav) targetNav.classList.add('active');
  }

  const fn = { dashboard: doctorDashboard, groups: doctorGroups_fn, meetings: doctorMeetings, progress: doctorProgress, feedback: doctorFeedback };
  document.getElementById('doctor-content').innerHTML = fn[section]?.() || '';
}

/* --- Doctor: Dashboard --- */
function doctorDashboard() {
  loadDoctorDashboardData();
  const doctorName = sessionStorage.getItem('currentUserName') || 'Doctor'; 

  return `
  <div class="page-header" style="background:linear-gradient(120deg,#0f2a25,#1a3530)">
    <div class="page-title">Welcome, ${doctorName}</div>
    <div id="doc-specialization-display" class="page-sub mt-1">Loading Specialization... · Supervisor Portal</div>
  </div>
  <div id="doctor-dashboard-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

/* --- Doctor: Dashboard  --- */
async function loadDoctorDashboardData() {
  try {
    const doctorId = String(sessionStorage.getItem('currentUserId')); 
    const noCache = '?t=' + new Date().getTime();

   
    try {
        const supRes = await fetch(`http://127.0.0.1:5000/api/supervisors${noCache}`);
        if (supRes.ok) {
            const allSups = await supRes.json();
            const myProfile = allSups.find(s => String(s.id) === doctorId);
            const specEl = document.getElementById('doc-specialization-display');
            if (specEl && myProfile) {
             
                specEl.innerHTML = `${myProfile.area} · Supervisor Portal`;
            }
        }
    } catch (e) {
        console.error("Failed to load specialization:", e);
    }


    const response = await fetch(`http://127.0.0.1:5000/api/requests${noCache}`);
    const allRequests = await response.json();
    
    const myRequests = allRequests.filter(req => String(req.supervisor_id) === doctorId);
    const activeGroups = myRequests.filter(req => req.status === 'approved' || req.status === 'ongoing');
    const pendingGroups = myRequests.filter(req => req.status === 'pending_doctor');
    const notificationsCount = pendingGroups.length;


    const meetingRes = await fetch(`http://127.0.0.1:5000/api/meetings/${doctorId}${noCache}`);
    let meetingsCount = 0;
    if (meetingRes.ok) {
        const meetingData = await meetingRes.json();
        meetingsCount = Array.isArray(meetingData) ? meetingData.length : 0;
    }


    const progRes = await fetch(`http://127.0.0.1:5000/api/get_progress${noCache}`);
    const allProgress = await progRes.json();

    const contentHtml = `
      <div class="row g-4 mb-4">
        ${statCard2('bi-people-fill', 'Active Groups', activeGroups.length, 'teal')}
        ${statCard2('bi-hourglass-split', 'Pending Requests', pendingGroups.length, 'blue')}
        ${statCard2('bi-calendar-check-fill', 'Meetings Scheduled', meetingsCount, 'gold')}
        ${statCard2('bi-bell-fill', 'Notifications', notificationsCount, 'purple')}
      </div>
      <div class="row g-4">
        <div class="col-lg-7">
          <div class="card-sgpms p-4">
            <div class="fw-bold mb-4 d-flex justify-content-between align-items-center">
              <span><i class="bi bi-cpu-fill me-2 text-teal"></i>Active Groups Real-time Tracking</span>
              <span class="badge bg-light text-dark border" style="font-size:0.75rem; letter-spacing:0.5px;">LIVE SYNC</span>
            </div>
            
            ${activeGroups.length > 0 ? activeGroups.map(g => {
              const pData = allProgress.find(p => String(p.project_id) === String(g.id)) || { progress: 0, week: 0, phase: 'Requirement Analysis' };
              
              return `
              <div class="p-3 rounded-3 mb-3 border shadow-sm" style="background:var(--bg);">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div class="fw-bold text-primary" style="font-size:1.05rem">${g.group}</div>
                    <div class="text-dark fw-semibold small mt-1">Project: <span class="fw-normal text-muted">${g.project}</span></div>
                  </div>
                  <span class="badge bg-dark text-white rounded-pill px-3" style="font-size:0.75rem">Week Logged: #${pData.week}</span>
                </div>
                
                <div class="row my-3 g-2 align-items-center" style="font-size: 0.82rem; border-top: 1px dashed var(--border); border-bottom: 1px dashed var(--border); padding: 10px 0;">
                  <div class="col-6 text-muted">
                    <i class="bi bi-layers-half me-1 text-teal"></i> Phase: <strong class="text-dark">${pData.phase}</strong>
                  </div>
                  <div class="col-6 text-muted text-end text-truncate">
                    <i class="bi bi-people me-1 text-primary"></i> Team IDs: <strong class="text-dark" title="${g.teamMembers || ''}">${g.teamMembers || 'N/A'}</strong>
                  </div>
                </div>

                <div class="d-flex justify-content-between mb-1">
                  <span class="text-xs text-muted fw-bold">Database verified progress</span>
                  <span class="text-xs fw-bold text-success">${pData.progress}%</span>
                </div>
                <div class="progress-sgpms" style="height:8px;"><div class="bar bg-success" style="width:${pData.progress}%"></div></div>
              </div>`;
            }).join('') : '<div class="text-muted text-center py-4"><i class="bi bi-folder-x fs-3 d-block mb-2"></i>No active groups at the moment!</div>'}
          </div>
        </div>
        
        <div class="col-lg-5">
          <div class="card-sgpms p-4 mb-4">
            <div class="fw-bold mb-3"><i class="bi bi-bell-fill me-2" style="color:var(--accent)"></i>Recent Notifications</div>
            ${pendingGroups.length > 0 ? pendingGroups.map(p => `
              <div class="d-flex align-items-center gap-3 mb-3 p-3 border rounded shadow-sm bg-white" style="border-left: 4px solid var(--warning) !important;">
                 <div style="width:35px;height:35px;border-radius:50%;background:var(--warning);color:#000;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">
                   <i class="bi bi-exclamation-circle-fill text-dark"></i>
                 </div>
                 <div style="overflow:hidden; width:100%">
                   <div class="fw-bold text-truncate" style="font-size:0.88rem;" title="${p.group}">${p.group}</div>
                   <div class="text-muted text-truncate" style="font-size:0.78rem;" title="${p.project}">Submitted project request for your approval</div>
                 </div>
              </div>
            `).join('') : '<div class="text-muted text-sm text-center py-3"><i class="bi bi-bell-slash text-muted d-block mb-1"></i>No new notifications.</div>'}
          </div>
        </div>
      </div>`;

    const container = document.getElementById('doctor-dashboard-container');
    if (container) { container.className = ''; container.innerHTML = contentHtml; }
  } catch (error) { 
    console.error("Doctor dashboard error:", error);
    const container = document.getElementById('doctor-dashboard-container');
    if (container) {
      container.className = '';
      container.innerHTML = `<div class="alert alert-danger text-center">Failed to load dashboard metrics. Check Python console.</div>`;
    }
  }
}
/* --- Doctor: Groups --- */
function doctorGroups_fn() {
  loadDoctorGroupsData();
  return `
  <div class="page-header" style="background:linear-gradient(120deg,#0f2a25,#1a3530)">
    <div class="page-title">My Groups</div>
    <div class="page-sub mt-1">All project groups assigned to you</div>
  </div>
  <div id="groups-list-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

/* --- Doctor: Groups --- */
async function loadDoctorGroupsData() {
  try {
    const doctorId = String(sessionStorage.getItem('currentUserId')); 
    const noCache = '?t=' + new Date().getTime();

    const response = await fetch(`http://127.0.0.1:5000/api/requests${noCache}`);
    const allRequests = await response.json();
    const myRequests = allRequests.filter(req => String(req.supervisor_id) === doctorId);

    const progRes = await fetch(`http://127.0.0.1:5000/api/get_progress${noCache}`);
    const allProgress = await progRes.json();

    const studentsRes = await fetch(`http://127.0.0.1:5000/api/students${noCache}`);
    const allStudents = await studentsRes.json();

    let contentHtml = '';

    if (myRequests.length === 0) {
      contentHtml = `<div class="text-muted text-center py-5"><i class="bi bi-folder-x fs-3 d-block mb-2"></i>No requests or groups assigned to you yet!</div>`;
    } else {
      myRequests.forEach(req => {
        
   
        const groupStudents = allStudents.filter(s => s.group_name && s.group_name.strip ? s.group_name.strip().toLowerCase() === req.group.strip().toLowerCase() : String(s.group_name).toLowerCase() === String(req.group).toLowerCase());
        const memberEmails = groupStudents.map(s => s.email).filter(Boolean).join(',');
        const memberNames = groupStudents.map(s => s.name).join(', ') || req.teamMembers || 'N/A';


        if (req.status === 'pending_doctor') {
          contentHtml += `
          <div class="card-sgpms p-4 mb-4 border-start border-4 border-warning shadow-sm bg-white" style="background-color: #fffdf5 !important;">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <div class="fw-bold fs-5 text-dark"><i class="bi bi-inbox me-2 text-warning"></i>${req.group}</div>
                <span class="badge bg-warning text-dark mt-2 border" style="font-size:0.75rem;"><i class="bi bi-hourglass-split me-1"></i>Pending Your Approval</span>
              </div>
              <div class="d-flex flex-column gap-2">
                <button class="btn btn-success btn-sm px-4 py-2 d-flex align-items-center justify-content-center gap-2" style="border-radius:8px; font-weight:600;" onclick="doctorApproveRequest(${req.id})">
                  <i class="bi bi-check-circle-fill"></i> Accept Project
                </button>
                <button class="btn btn-outline-danger btn-sm px-4 py-1 d-flex align-items-center justify-content-center gap-2" style="border-radius:8px; font-weight:600;" onclick="doctorRejectRequest(${req.id})">
                  <i class="bi bi-x-circle-fill"></i> Reject
                </button>
              </div>
            </div>
            
            <div class="p-3 mt-2 rounded" style="background: rgba(255, 193, 7, 0.1); border: 1px dashed var(--warning);">
              <div class="text-dark fw-bold small mb-2">Project Title: <span class="fw-bold text-primary fs-6">${req.project}</span></div>
              <div class="text-dark fw-bold small mb-2">Description: <div class="fw-normal text-muted mt-1" style="line-height:1.6; font-size:0.85rem;">${req.description || 'No description provided by the students.'}</div></div>
              <div class="text-dark fw-bold small mb-2 mt-3">Technical Stack: <span class="fw-normal text-muted">${req.techStack || 'N/A'}</span></div>
              <div class="text-dark fw-bold small mb-1">Team Members: <span class="fw-normal text-muted">${memberNames}</span></div>
            </div>
          </div>`;
        } 
        

        else if (req.status === 'approved' || req.status === 'ongoing') {
          const pData = allProgress.find(p => String(p.project_id) === String(req.id)) || { progress: 0, week: 0, phase: 'Requirement Analysis' };

          contentHtml += `
          <div class="card-sgpms p-4 mb-4 border-start border-4 border-success shadow-sm bg-white">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <div class="fw-bold fs-5 text-primary">${req.group}</div>
                <span class="badge-status badge-ongoing bg-success text-white mt-1">Ongoing</span>
              </div>
              <div class="d-flex flex-column align-items-end gap-2">
                <span class="badge bg-dark text-white rounded-pill px-3" style="font-size:0.75rem">Week Logged: #${pData.week}</span>
                
                <a href="mailto:${memberEmails}?subject=SGPMS Graduation Project - ${req.group}" 
                   class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 px-3 py-1" 
                   style="border-radius:8px; font-size:0.82rem; font-weight: 500;" title="Send email to all group members">
                  <i class="bi bi-envelope-fill"></i> Email Team
                </a>
              </div>
            </div>
            
            <div class="text-dark fw-bold small mb-2">Project Title: <span class="fw-normal text-muted">${req.project}</span></div>
            <div class="text-dark fw-bold small mb-2">Technical Stack: <span class="fw-normal text-muted">${req.techStack || 'N/A'}</span></div>
            <div class="text-dark fw-bold small mb-3">Team Members: <span class="fw-normal text-muted">${memberNames}</span></div>
            
            <div class="row mb-3 g-2 py-2 border-top border-bottom" style="font-size: 0.85rem; background: var(--bg);">
              <div class="col-12 text-muted">
                <i class="bi bi-layers-half me-1 text-teal"></i> Development Phase: <strong class="text-dark">${pData.phase}</strong>
              </div>
            </div>

            <div class="d-flex justify-content-between mb-1">
              <span class="text-xs text-muted fw-bold">Verified Progress</span>
              <span class="text-xs fw-bold text-success">${pData.progress}%</span>
            </div>
            <div class="progress-sgpms" style="height:8px;"><div class="bar bg-success" style="width:${pData.progress}%"></div></div>
          </div>`;
        }
      });
    }

    const container = document.getElementById('groups-list-container');
    if (container) { container.className = ''; container.innerHTML = contentHtml; }
  } catch (error) { 
    console.error(" Error loading doctor groups data:", error); 
  }
}

function acceptStudentProject() {
  let proj = JSON.parse(localStorage.getItem('sgpms_project'));
  proj.status = 'ongoing';
  localStorage.setItem('sgpms_project', JSON.stringify(proj));
  localStorage.setItem('sgpms_supervisor', 'Dr. Deya Al-Zoubi');
  showToast('success', 'Group Accepted', 'The students have been notified.');
  showDoctorSection('groups', null);
}
/* --- Doctor: Meetings  --- */
function doctorMeetings() {
  
  setTimeout(() => initDoctorMeetingsPage(), 50);
  
  return `
  <div class="page-header" style="background:linear-gradient(120deg,#0f2a25,#1a3530)">
    <div class="page-title">Schedule Meetings</div>
    <div class="page-sub mt-1">Set up and manage meetings with your assigned groups</div>
  </div>
  <div class="row g-4">
    <div class="col-lg-5">
      <div class="card-sgpms p-4 shadow-sm bg-white">
        <h6 class="fw-bold mb-3 text-primary"><i class="bi bi-calendar-plus me-2"></i>Create New Meeting</h6>
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label small fw-semibold">Target Project Group</label>
            <select id="meet-group-select" class="form-select">
              <option value="">-- Loading Active Groups --</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label small fw-semibold">Meeting Title / Subject</label>
            <input type="text" id="meet-title" class="form-control" placeholder="e.g. SRS Discussion & System Design">
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-semibold">Date</label>
            <input type="date" id="meet-date" class="form-control">
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-semibold">Time</label>
            <input type="time" id="meet-time" class="form-control">
          </div>
          <div class="col-12 mt-4">
            <button class="btn btn-primary w-100 py-2" style="background-color: var(--doc-accent); border: none; font-weight:500;" onclick="saveRealMeetingToDB()">
              <i class="bi bi-calendar-check me-2"></i>Schedule Meeting
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="col-lg-7">
      <div class="card-sgpms p-4 shadow-sm bg-white">
        <h6 class="fw-bold mb-3"><i class="bi bi-calendar3 me-2 text-teal"></i>Active Meetings Dashboard</h6>
        <div id="doc-meetings-list" class="d-flex flex-column gap-2">
          <div class="text-center py-3"><div class="spinner-border text-primary spinner-border-sm" role="status"></div></div>
        </div>
      </div>
    </div>
  </div>`;
}


async function initDoctorMeetingsPage() {
  const doctorId = String(sessionStorage.getItem('currentUserId'));
  const noCache = '?t=' + new Date().getTime();
  
  try {

    const response = await fetch(`http://127.0.0.1:5000/api/requests${noCache}`);
    const allRequests = await response.json();
    const myActiveGroups = allRequests.filter(req => String(req.supervisor_id) === doctorId && (req.status === 'approved' || req.status === 'ongoing'));
    
    const selectEl = document.getElementById('meet-group-select');
    if (selectEl) {
      selectEl.innerHTML = '<option value="">-- Choose Group --</option>' + 
        myActiveGroups.map(g => `<option value="${g.id}">${g.group} (${g.project.substring(0,25)}...)</option>`).join('');
    }
    
  
    loadDoctorMeetingsList();
  } catch (error) {
    console.error(" Error initializing doctor meetings page:", error);
  }
}

async function saveRealMeetingToDB() {
  const projectId = document.getElementById('meet-group-select').value;
  const title = document.getElementById('meet-title').value.trim();
  const date = document.getElementById('meet-date').value;
  const time = document.getElementById('meet-time').value;
  const supervisorId = sessionStorage.getItem('currentUserId');

  if (!projectId) return showToast('warning', 'Selection Required', 'Please select a student project group.');
  if (!title || !date || !time) return showToast('warning', 'Missing Fields', 'Please fill in the meeting subject, date, and time.');

  try {
    const response = await fetch('http://127.0.0.1:5000/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        notes: title,
        date: date,
        time: time,
        supervisor_id: supervisorId,
        link: 'https://teams.microsoft.com/' 
      })
    });

    if (response.ok) {
      showToast('success', 'Meeting Active', 'تم جدولة اللقاء بنجاح وحفظه في الـ SQLite ومزامنته للطلاب!');
  
      document.getElementById('meet-title').value = '';
      document.getElementById('meet-date').value = '';
      document.getElementById('meet-time').value = '';
      document.getElementById('meet-group-select').value = '';
      loadDoctorMeetingsList(); 
    } else {
      showToast('danger', 'Server Error', 'Failed to save meeting inside database.');
    }
  } catch (error) {
    console.error(error);
    showToast('danger', 'Connection Error', 'تعذر الاتصال بالسيرفر لحفظ اللقاء.');
  }
}

async function loadDoctorMeetingsList() {
  const doctorId = String(sessionStorage.getItem('currentUserId'));
  const noCache = '?t=' + new Date().getTime();
  const container = document.getElementById('doc-meetings-list');
  if (!container) return;

  try {
    const response = await fetch(`http://127.0.0.1:5000/api/meetings/${doctorId}${noCache}`);
    const meets = await response.json();

    if (meets.length === 0) {
      container.innerHTML = '<div class="text-muted text-xs p-4 text-center border rounded bg-light"><i class="bi bi-calendar-x d-block fs-4 mb-2 text-muted"></i>No upcoming meetings scheduled.</div>';
      return;
    }

    container.innerHTML = meets.map(m => {

      const dtParts = m.date.split(' ');
      const dateOnly = dtParts[0] || m.date;
      const timeOnly = dtParts[1] || '';
      
      return `
        <div class="d-flex align-items-center justify-content-between p-3 rounded-3 border bg-white shadow-sm" style="transition: 0.2s;">
          <div>
            <div class="fw-bold text-dark" style="font-size:0.95rem;">${m.notes}</div>
            <div class="text-xs text-primary fw-semibold mt-1"><i class="bi bi-people-fill me-1"></i>Team: <span class="text-dark">${m.group_name || 'Assigned Group'}</span></div>
            <div class="text-muted text-xs mt-1">
              <i class="bi bi-calendar-event me-1"></i>${dateOnly} | <i class="bi bi-clock me-1"></i>${timeOnly}
            </div>
          </div>
          <div class="d-flex gap-2">
            <a href="${m.link}" target="_blank" class="btn btn-sm text-white px-3 d-flex align-items-center gap-1" style="background-color:#5558af; border-radius:8px; font-size:0.8rem; font-weight:500;">
              <i class="bi bi-microsoft-teams"></i> Launch
            </a>
            <button class="btn btn-sm btn-outline-danger" style="border-radius:8px;" onclick="deleteRealMeeting(${m.id})">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>`;
    }).join('');
  } catch (error) {
    container.innerHTML = '<div class="alert alert-danger text-center text-xs">Failed to load meetings from SQLite.</div>';
  }
}
async function deleteRealMeeting(meetingId) {
  if (!confirm("Are you sure you want to permanently delete this meeting from the database?!")) return;
  
  try {
    const response = await fetch(`http://127.0.0.1:5000/api/meetings/delete/${meetingId}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      showToast('info', 'Meeting Cancelled', 'تم حذف موعد اللقاء بنجاح من جدول WeeklyMeetingTab.');
      loadDoctorMeetingsList(); 
    } else {
      showToast('danger', 'Error', 'Could not delete meeting from DB.');
    }
  } catch (error) {
    showToast('danger', 'Connection Error', 'السيرفر لا يستجيب.');
  }
}
/* --- Doctor: Progress --- */
function doctorProgress() {
  loadDocProgressData();
  return `
  <div class="page-header" style="background:linear-gradient(120deg,#0f2a25,#1a3530)">
    <div class="page-title">Update Project Progress</div>
    <div class="page-sub mt-1">Log feedback and set progress for your groups</div>
  </div>
  <div id="doc-progress-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

/* --- Doctor: Progress  --- */
async function loadDocProgressData() {
  try {

    const doctorId = String(sessionStorage.getItem('currentUserId')); 
    const noCache = '?t=' + new Date().getTime();
    
    
    const response = await fetch(`http://127.0.0.1:5000/api/requests${noCache}`);
    const allRequests = await response.json();
    const myActiveGroups = allRequests.filter(req => String(req.supervisor_id) === doctorId && (req.status === 'approved' || req.status === 'ongoing'));


    const progRes = await fetch(`http://127.0.0.1:5000/api/get_progress${noCache}`);
    const allProgress = await progRes.json();


    let groupFilesDB = {};
    for (const g of myActiveGroups) {
      try {
        const filesRes = await fetch(`http://127.0.0.1:5000/api/files/${g.id}${noCache}`);
        if (filesRes.ok) {
          groupFilesDB[g.id] = await filesRes.json();
        } else {
          groupFilesDB[g.id] = [];
        }
      } catch(e) {
        groupFilesDB[g.id] = [];
      }
    }


    const contentHtml = `
      <div class="d-flex flex-column gap-4">
        ${myActiveGroups.length === 0 ? '<div class="alert alert-info text-center shadow-sm py-4"><i class="bi bi-folder-x fs-2 d-block mb-2 text-muted"></i>No active groups available to update progress yet.</div>' : ''}
        
        ${myActiveGroups.map(g => {
          const pData = allProgress.find(p => String(p.project_id) === String(g.id)) || { progress: 0, week: 0, phase: 'Requirement Analysis', feedback: '' };
          

          const gFiles = groupFilesDB[g.id] || [];
          let filesHtml = '';
          
          if (gFiles.length > 0) {
            filesHtml = gFiles.map(f => {
              const ext = String(f.name).split('.').pop().toUpperCase();
              return `
              <div class="d-flex align-items-center justify-content-between p-3 mb-2 rounded border shadow-sm" style="background:#fff">
                <div class="d-flex align-items-center gap-3">
                  <i class="bi bi-file-earmark-text-fill fs-4 text-teal"></i>
                  <div>
                    <div class="fw-bold text-dark text-truncate" style="font-size:0.9rem; max-width: 250px;" title="${f.name}">${f.name}</div>
                    <div class="text-muted text-xs">Type: ${ext} | Uploaded: ${f.date}</div>
                  </div>
                </div>
                <a href="http://127.0.0.1:5000/uploads/${f.name}" target="_blank" class="btn btn-sm btn-outline-primary px-3 fw-bold">
                  <i class="bi bi-download me-1"></i> Download
                </a>
              </div>`;
            }).join('');
          } else {
            filesHtml = '<div class="text-muted text-sm p-3 border rounded text-center bg-light">No files have been submitted by this group yet.</div>';
          }
          
          return `
          <div class="card-sgpms p-4 border border-secondary shadow-sm">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 class="fw-bold mb-0 text-primary">${g.group}</h6>
                <div class="text-muted text-xs">${g.project}</div>
              </div>
              <div class="text-end">
                <span class="badge bg-dark text-white d-block mb-1">Log Week: #${pData.week}</span>
                <span class="fw-bold fs-5" id="prog-val-text-${g.id}" style="color:var(--doc-accent);">${pData.progress}%</span>
              </div>
            </div>
            
            <div class="progress-sgpms mb-3"><div class="bar bg-success" id="prog-val-bar-${g.id}" style="width:${pData.progress}%"></div></div>
            
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Update Progress (%)</label>
                <input type="range" id="prog-input-${g.id}" class="form-range" min="0" max="100" value="${pData.progress}" 
                  oninput="document.getElementById('prog-val-text-${g.id}').textContent=this.value+'%'; document.getElementById('prog-val-bar-${g.id}').style.width=this.value+'%'; this.nextElementSibling.textContent=this.value+'%';"/>
                <small class="text-muted fw-bold">${pData.progress}%</small>
              </div>
              
              <div class="col-md-6">
                <label class="form-label fw-semibold">Current Phase</label>
                <select id="phase-input-${g.id}" class="form-select">
                  <option ${pData.phase === 'Requirement Analysis' ? 'selected' : ''}>Requirement Analysis</option>
                  <option ${pData.phase === 'System Design' ? 'selected' : ''}>System Design</option>
                  <option ${pData.phase === 'Implementation' ? 'selected' : ''}>Implementation</option>
                  <option ${pData.phase === 'Testing' ? 'selected' : ''}>Testing</option>
                  <option ${pData.phase === 'Deployment' ? 'selected' : ''}>Deployment</option>
                </select>
              </div>
              
              <div class="col-12">
                <label class="form-label fw-semibold">Feedback / Comments</label>
                <textarea id="feedback-input-${g.id}" class="form-control" rows="2" placeholder="Write your feedback for this group...">${pData.feedback || ''}</textarea>
              </div>
              
              <div class="col-12 mt-2 pt-4" style="border-top:1px dashed var(--border)">
                <h6 class="fw-bold mb-3"><i class="bi bi-cloud-arrow-down-fill me-2 text-teal"></i>Student Uploaded Files</h6>
                ${filesHtml} 
              </div>
              
              <div class="col-12 text-end mt-3">
                <button class="btn-primary-sgpms px-4" onclick="saveDoctorProgress(${g.id})">
                  <i class="bi bi-floppy me-2"></i>Save Week Report
                </button>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>`;
      
    const container = document.getElementById('doc-progress-container');
    if (container) { container.className = ''; container.innerHTML = contentHtml; }
  } catch (error) {
    console.error("Error loading doctor progress:", error);
  }
}
async function saveDoctorProgress(projectId) {
  const progressVal = document.getElementById(`prog-input-${projectId}`).value;
  const phaseVal = document.getElementById(`phase-input-${projectId}`).value;
  const feedbackVal = document.getElementById(`feedback-input-${projectId}`).value;

  try {
      const response = await fetch('http://127.0.0.1:5000/api/update_progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              project_id: projectId,
              progress: progressVal,
              phase: phaseVal,
              feedback: feedbackVal
          })
      });
      
      if(response.ok) {
          showToast('success', 'Report Saved', 'تم حفظ التقييم، المرحلة، والملاحظات وزيادة رقم الأسبوع بنجاح!');
          loadDocProgressData();
      } else {
          showToast('danger', 'Error', 'حدث خطأ أثناء حفظ التقرير.');
      }
  } catch(e) {
      console.error("🚨 Save Progress Error:", e);
      showToast('danger', 'Connection Error', 'السيرفر لا يستجيب.');
  }
}

/* --- Doctor: Feedback --- */
function doctorFeedback() {
  loadDoctorFeedbackData();
  return `
  <div class="page-header" style="background:linear-gradient(120deg,#0f2a25,#1a3530)">
    <div class="page-title">Feedback Center</div>
    <div class="page-sub mt-1">All feedback you've given to student groups</div>
  </div>
  <div id="doc-feedback-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

/* --- Doctor: Feedback  --- */
async function loadDoctorFeedbackData() {
  try {
    const doctorId = String(sessionStorage.getItem('currentUserId'));
    const noCache = '?t=' + new Date().getTime();

    
    const response = await fetch(`http://127.0.0.1:5000/api/feedback_history/${doctorId}${noCache}`);
    const data = await response.json();

    const contentHtml = `
      <div class="card-sgpms p-4">
        <table class="table table-sgpms mb-0">
          <thead>
            <tr>
              <th>Group</th>
              <th>Date</th>
              <th>Feedback</th>
              <th>Phase</th>
            </tr>
          </thead>
          <tbody>
            ${data.length === 0 ? '<tr><td colspan="4" class="text-center text-muted py-4"><i class="bi bi-chat-left-dots fs-3 d-block mb-2"></i>No feedback logged in database yet. Try saving progress with comments first!</td></tr>' : ''}
            ${data.map(r => `
              <tr>
                <td><strong class="text-primary" style="font-size:0.95rem">${r.g || 'Unknown Group'}</strong></td>
                <td class="text-muted" style="font-size:0.85rem; white-space:nowrap;"><i class="bi bi-calendar-event me-1"></i>${r.d || 'Today'}</td>
                <td style="font-size:0.88rem; max-width: 350px; word-wrap: break-word; line-height:1.5;">${r.fb}</td>
                <td><span class="chip bg-light text-dark border fw-semibold" style="font-size:0.78rem">${r.ph || 'N/A'}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
      
    const container = document.getElementById('doc-feedback-container');
    if (container) { container.className = ''; container.innerHTML = contentHtml; }
  } catch (error) {
    console.error("🚨 Error loading doctor feedback center:", error);
    const container = document.getElementById('doc-feedback-container');
    if (container) container.innerHTML = '<div class="alert alert-danger text-center">Unable to load feedback log from database.</div>';
  }
}
/*--- doctor accepting or rejecting group ---*/


async function doctorApproveRequest(id) {
  if (!confirm("Are you sure you want to ACCEPT this group request?")) return;
  try {

    await apiCall(`requests/${id}`, 'PUT', { status: 'approved', reason: '' });
    showToast('success', 'Request Accepted', 'You are now the supervisor for this group.');
    loadDoctorDashboardData(); 
    loadDoctorGroupsData();    
  } catch (error) {
    showToast('danger', 'Error', 'Could not accept the request.');
  }
}

async function doctorRejectRequest(id) {
 
  const reason = prompt("Please enter the reason for rejection!");
  if (reason === null) return; 
  if (reason.trim() === "") {
      showToast('warning', 'Required', 'يجب إدخال سبب الرفض لتبرير القرار.');
      return;
  }
  
  try {
  
    await apiCall(`requests/${id}`, 'PUT', { status: 'rejected_by_doctor', reason: reason });
    showToast('danger', 'Request Rejected', 'The request has been declined and sent back to admin.');
    loadDoctorDashboardData();
    loadDoctorGroupsData();
  } catch (error) {
    showToast('danger', 'Error', 'Could not reject the request.');
  }
}

/* ══════════════════════════════════════════════════════════
   ADMIN واجهه ال
   ══════════════════════════════════════════════════════════ */

async function handleAddSupervisorSubmit(supName, supSpec, maxCap) {
  if (!supName) {
    showToast("الرجاء إدخال اسم المشرف", "danger");
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:5000/api/add_supervisor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: supName,
        specialization: supSpec,
        max_capacity: parseInt(maxCap) || 5
      })
    });

    const result = await response.json();

    if (response.ok && result.status === "success") {
      showToast("تم إضافة المشرف بنجاح وحفظه في الـ SQLite!", "success");

     
      if (typeof loadDashboardData === "function") {
        loadDashboardData();
      } else if (typeof fetchSupervisors === "function") {
        fetchSupervisors();
      }

      const modal = document.getElementById('supervisor-modal') || document.getElementById('add-supervisor-modal');
      if (modal) {
        modal.style.display = 'none';
      }

    } else {
      showToast("خطأ من السيرفر: " + result.message, "danger");
    }
  } catch (error) {
    console.error(" Error sending supervisor data:", error);
    showToast("تعذر الاتصال بالسيرفر، تأكد من تشغيل ملف الـ .bat", "danger");
  }
}

function renderAdminDashboard() {
  const dashboardTab = document.querySelector('#admin-sidebar .nav-item');
  showAdminSection('dashboard', dashboardTab);
}

function showAdminSection(section, el) {
  document.querySelectorAll('#admin-sidebar .nav-item').forEach(n => n.classList.remove('active'));

  if (el) {
    el.classList.add('active');
  } else {
    const targetNav = Array.from(document.querySelectorAll('#admin-sidebar .nav-item'))
      .find(n => n.getAttribute('onclick') && n.getAttribute('onclick').includes(`'${section}'`));
    if (targetNav) targetNav.classList.add('active');
  }

  const fn = { dashboard: adminDashboard, requests: adminRequests, supervisors: adminSupervisors, students: adminStudents, reports: adminReports };
  document.getElementById('admin-content').innerHTML = fn[section]?.() || '';
}

/* --- Admin: Dashboard --- */
function adminDashboard() {
  loadAdminDashboardData();
  return `
  <div class="page-header" style="background:linear-gradient(120deg,#160a30,#1e1040)">
    <div class="page-title">Admin Dashboard</div>
    <div class="page-sub mt-1">Department Head · Full System Overview</div>
  </div>
  <div id="admin-dashboard-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

async function loadAdminDashboardData() {
  try {

    const realSupervisors = await apiCall('supervisors');
    const realRequests = await apiCall('requests');
    const realStudents = await apiCall('students'); 


    const pendingCount = realRequests.filter(r => r.status === 'pending_admin').length;
    const approvedCount = realRequests.filter(r => r.status === 'approved' || r.status === 'ongoing').length;

  
    const enrichedSupervisors = realSupervisors.map(sup => {
      const activeProjectsCount = realRequests.filter(r => {
        if (r.status !== 'approved' && r.status !== 'ongoing') return false;

        const sId = String(sup.id);
        const rSupId = String(r.supervisor_id);
        const rSupStr = String(r.supervisor).replace('Doctor ID: ', '').trim();
        return (sId === rSupId) || (sId === rSupStr);
      }).length;
      return { ...sup, liveGroups: (sup.groups || 0) + activeProjectsCount };
    });

    const recentRequests = realRequests.slice(0, 4);

  
    const contentHtml = `
      <div class="row g-4 mb-4">
        ${statCard3('bi-inbox-fill', 'Pending Requests', pendingCount, 'gold')}
        ${statCard3('bi-people-fill', 'Total Students', realStudents.length, 'blue')}
        ${statCard3('bi-person-badge-fill', 'Active Supervisors', realSupervisors.length, 'purple')}
        ${statCard3('bi-check2-circle', 'Approved Projects', approvedCount, 'green')}
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
                ${recentRequests.length > 0 ? recentRequests.map(r => {
                  const matchedSup = enrichedSupervisors.find(s => {
                    const sId = String(s.id);
                    const rSupId = String(r.supervisor_id);
                    const rSupStr = String(r.supervisor).replace('Doctor ID: ', '').trim();
                    return (sId === rSupId) || (sId === rSupStr);
                  });
                  const displaySupName = matchedSup ? matchedSup.name : r.supervisor;
                  return `
                  <tr>
                    <td class="fw-semibold">${r.group}</td>
                    <td class="text-muted" style="font-size:0.85rem">${r.project}</td>
                    <td class="fw-bold text-primary" style="font-size:0.85rem">${displaySupName.replace('Dr. ', '')}</td>
                    <td>
                      ${r.status === 'pending_admin' ? '<span class="badge bg-warning text-dark">Pending</span>' :
                        r.status === 'pending_doctor' ? '<span class="badge bg-info text-dark">Waiting Doctor</span>' :
                        r.status === 'rejected_by_admin' || r.status === 'rejected_by_doctor' ? '<span class="badge bg-danger">Rejected</span>' :
                        '<span class="badge bg-success">Approved</span>'}
                    </td>
                    <td style="white-space: nowrap;">
                      <button class="btn-sm-icon me-1" title="View Details" onclick="viewRequestDetails(${r.id})" style="color:var(--primary)"><i class="bi bi-eye"></i></button>
                      
                      ${r.status === 'pending_admin' ? `
                        <button class="btn-sm-icon me-1" title="Approve & Forward" onclick="approveRequest(${r.id})" style="color:var(--success)"><i class="bi bi-check-lg"></i></button>
                        <button class="btn-sm-icon" title="Reject" onclick="rejectRequest(${r.id})" style="color:var(--danger)"><i class="bi bi-x-lg"></i></button>`
                      : r.status === 'rejected_by_doctor' ? `
                        <button class="btn-sm-icon" title="View Rejection Reason" onclick="alert('Doctor Rejection Reason:\\n${r.reason ? r.reason.replace(/'/g, "\\'") : 'No reason provided'}')"><i class="bi bi-info-circle text-warning"></i></button>
                      ` : '<span class="text-muted text-xs">—</span>'}
                    </td>
                  </tr>`
                }).join('') : '<tr><td colspan="5" class="text-center text-muted py-4">No recent requests found in database.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
        <div class="col-lg-5">
          <div class="card-sgpms p-4 mb-4">
            <div class="fw-bold mb-3">Supervisor Capacity</div>
            ${enrichedSupervisors.map(s => {
              const currentGroups = s.liveGroups;
              const maxGroups = s.max || 5;
              const pct = Math.round(currentGroups / maxGroups * 100);
              return `
              <div class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                  <span style="font-size:0.85rem">${s.name}</span>
                  <span class="text-xs fw-semibold">${currentGroups}/${maxGroups}</span>
                </div>
                <div class="sup-cap-bar"><div class="fill ${pct >= 100 ? 'fill-high' : pct >= 60 ? 'fill-mid' : 'fill-low'}" style="width:${pct}%"></div></div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;

    const container = document.getElementById('admin-dashboard-container');
    if (container) { container.className = ''; container.innerHTML = contentHtml; }
  } catch (error) {
    console.error("Admin dashboard error:", error);
    const container = document.getElementById('admin-dashboard-container');
    if (container) container.innerHTML = '<div class="alert alert-danger w-100">Failed to load admin dashboard data. Ensure Python server is running.</div>';
  }
}
/* --- Admin: Requests --- */
function adminRequests() {
  loadAdminRequestsData();
  return `
  <div class="page-header" style="background:linear-gradient(120deg,#160a30,#1e1040)">
    <div class="page-title">Project Requests</div>
    <div class="page-sub mt-1">Review and approve/reject student registration requests</div>
  </div>
  <div id="admin-requests-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

async function loadAdminRequestsData() {
  try {
    let realRequests;
   try { realRequests = await apiCall('requests'); } catch (e) { realRequests = []; }

    let realSupervisors;
    try { realSupervisors = await apiCall('supervisors'); } catch (e) { realSupervisors = []; }

    const contentHtml = `
      <div class="card-sgpms p-4">
        <div class="d-flex gap-2 mb-4 flex-wrap" id="admin-request-filters">
          ${['All', 'Pending', 'Approved', 'Rejected'].map((f, i) => `
            <button class="chip filter-btn" 
                    style="cursor:pointer; border:none; ${i === 0 ? 'background:var(--primary); color:#fff;' : 'background:var(--bg); color:var(--text);'}" 
                    onclick="filterAdminRequests('${f.toLowerCase()}', this)">${f}</button>
          `).join('')}
        </div>
        <table class="table table-sgpms">
          <thead><tr><th>Group</th><th>Project</th><th>Supervisor</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody id="requests-table">
            ${realRequests.map(r => {

      const matchedSup = realSupervisors.find(s => {
        const sId = String(s.id);
        const rSupId = String(r.supervisor_id);
        const rSupStr = String(r.supervisor).replace('Doctor ID: ', '').trim();
        return (sId === rSupId) || (sId === rSupStr);
      });
      const displaySupName = matchedSup ? matchedSup.name : r.supervisor;

      return `
           <tr id="req-row-${r.id}" class="req-row" data-status="${r.status}">
                <td class="fw-semibold">${r.group}</td>
                <td>${r.project}</td>
                <td class="fw-bold" style="color:var(--primary)">${displaySupName}</td>
                <td>${r.date || 'N/A'}</td>
                <td>
                  ${r.status === 'pending_admin' ? '<span class="badge bg-warning text-dark">Pending Admin</span>' :
                    r.status === 'pending_doctor' ? '<span class="badge bg-info text-dark">Waiting for Doctor</span>' :
                    r.status === 'rejected_by_admin' ? '<span class="badge bg-danger">Rejected (Admin)</span>' :
                    r.status === 'rejected_by_doctor' ? '<span class="badge bg-danger">Rejected (Doctor)</span>' :
                    '<span class="badge bg-success">Approved</span>'}
                </td>
                <td style="white-space: nowrap;">
                  <button class="btn-sm-icon me-1" title="View Details" onclick="viewRequestDetails(${r.id})" style="color:var(--primary)"><i class="bi bi-eye"></i></button>
                  
                  ${r.status === 'pending_admin' ? `
                    <button class="btn-sm-icon me-1" title="Approve & Forward" onclick="approveRequest(${r.id})" style="color:var(--success)"><i class="bi bi-check-lg"></i></button>
                    <button class="btn-sm-icon" title="Reject" onclick="rejectRequest(${r.id})" style="color:var(--danger)"><i class="bi bi-x-lg"></i></button>`
                  : r.status === 'rejected_by_doctor' ? `
                    <button class="btn-sm-icon" title="View Rejection Reason" onclick="alert('Doctor Rejection Reason:\\n${r.reason ? r.reason.replace(/'/g, "\\'") : 'No reason provided'}')"><i class="bi bi-info-circle text-warning"></i></button>
                  ` : ''}
                </td>
              </tr>`
    }).join('')}
          </tbody>
        </table>
      </div>`;
    const container = document.getElementById('admin-requests-container');
    if (container) { container.className = ''; container.innerHTML = contentHtml; }
  } catch (error) {
    console.error("Error loading admin requests:", error);
    const container = document.getElementById('admin-requests-container');
    if (container) container.innerHTML = '<div class="alert alert-danger w-100">Failed to load requests. Please try again.</div>';
  }
}


function filterAdminRequests(status, btnElement) {

  const allBtns = document.querySelectorAll('#admin-request-filters .filter-btn');
  allBtns.forEach(btn => {
    btn.style.background = 'var(--bg)';
    btn.style.color = 'var(--text)';
  });

  btnElement.style.background = 'var(--primary)';
  btnElement.style.color = '#fff';

  const allRows = document.querySelectorAll('.req-row');
  allRows.forEach(row => {
    if (status === 'all') {
      row.style.display = ''; 
    } else if (row.getAttribute('data-status') === status) {
      row.style.display = ''; 
    } else {
      row.style.display = 'none'; 
    }
  });
}

/* --- Admin: Supervisors --- */
function adminSupervisors() {
  loadAdminSupervisorsData();
  return `
  <div class="page-header" style="background:linear-gradient(120deg,#160a30,#1e1040)">
    <div class="page-title">Supervisors</div>
    <div class="page-sub mt-1">Manage faculty supervisors and their capacities</div>
  </div>
  <div id="admin-supervisors-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

async function loadAdminSupervisorsData() {
  try {
    const response = await fetch('http://127.0.0.1:5000/api/supervisors');
    if (!response.ok) throw new Error("Server offline");
    const data = await response.json();

    let realRequests;
    try { realRequests = await apiCall('requests'); } catch (e) { realRequests = []; }

    const contentHtml = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <span class="text-muted small">${data.length} supervisors loaded from DB</span>
        <button class="btn-primary-sgpms" onclick="openAddSupervisorModal()"><i class="bi bi-plus me-2"></i>Add Supervisor</button>
      </div>
      <div class="row g-4">
        ${data.map(s => {
      const activeProjectsCount = realRequests.filter(r => {
        if (r.status !== 'approved' && r.status !== 'ongoing') return false;
        const sId = String(s.id);
        const rSupId = String(r.supervisor_id);
        const rSupStr = String(r.supervisor).replace('Doctor ID: ', '').trim();
        return (sId === rSupId) || (sId === rSupStr);
      }).length;

      const currentGroups = (s.groups || 0) + activeProjectsCount;
      const maxGroups = s.max || 5;
      const pct = Math.round((currentGroups / maxGroups) * 100);

      return `
          <div class="col-md-6 col-lg-4">
            <div class="sup-card d-flex flex-column h-100">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="sup-avatar" style="background:linear-gradient(135deg,var(--admin-accent),var(--primary))">${s.initials || '??'}</div>
                <div style="max-width: calc(100% - 60px);">
                  <div class="sup-name text-truncate" title="${s.name}">${s.name}</div>
                  <div class="sup-area text-truncate" title="${s.area}">${s.area}</div>
                </div>
              </div>
              
              <div>
                <div class="d-flex justify-content-between mb-1">
                  <span class="text-xs text-muted">Current Load</span>
                  <span class="text-xs fw-semibold" id="load-text-${s.id}">${currentGroups} / ${maxGroups}</span>
                </div>
                <div class="sup-cap-bar mb-3"><div class="fill ${pct >= 100 ? 'fill-high' : pct >= 60 ? 'fill-mid' : 'fill-low'}" id="load-bar-${s.id}" style="width:${pct}%"></div></div>
              </div>

              <div class="p-2 mt-auto rounded" style="background:var(--bg); border:1px solid var(--border);">
                <div class="d-flex justify-content-between mb-1">
                  <span class="text-xs fw-bold"><i class="bi bi-sliders me-1"></i>Max Capacity</span>
                  <span class="text-xs fw-bold" style="color:var(--admin-accent)" id="cap-val-${s.id}">${maxGroups}</span>
                </div>
                <input type="range" class="form-range" min="1" max="10" value="${maxGroups}"
                  oninput="document.getElementById('cap-val-${s.id}').innerText = this.value"
                  onchange="updateSupervisorCapacity('${s.id}', this.value, ${currentGroups})">
              </div>

              <div class="d-flex gap-2 mt-3">
                <button class="btn-sm-icon text-danger ms-auto" title="Remove" onclick="deleteSupervisorFromDB('${s.id}')"><i class="bi bi-trash"></i></button>
              </div>
            </div>
          </div>`;
    }).join('')}
      </div>`;

    const container = document.getElementById('admin-supervisors-container');
    if (container) { container.className = ''; container.innerHTML = contentHtml; }
  } catch (error) {
    console.error(error);
    const container = document.getElementById('admin-supervisors-container');
    if (container) container.innerHTML = `<div class="alert alert-danger w-100 text-center py-4">Failed to load from DB.</div>`;
  }
}


function openAddSupervisorModal() {
  let modal = document.getElementById('add-supervisor-modal');

  if (!modal) {
    const modalHTML = `
      <div id="add-supervisor-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; justify-content: center; align-items: center; direction: rtl;">
        <div class="p-4" style="width: 450px; background: white; border-radius: 14px; box-shadow: 0 8px 30px rgba(0,0,0,0.2); font-family: sans-serif;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold text-primary mb-0"><i class="bi bi-person-plus-fill me-2"></i>إضافة مشرف جديد</h5>
            <button type="button" class="btn-close" onclick="document.getElementById('add-supervisor-modal').style.display='none'"></button>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold text-dark d-block text-start">اسم الدكتور الثلاثي</label>
            <input type="text" id="new-sup-name" class="form-control" placeholder="مثال: Dr. Ahmad Mustafa" style="direction: ltr;">
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold text-dark d-block text-start">التخصص الدقيق</label>
            <input type="text" id="new-sup-spec" class="form-control" placeholder="مثال: Cyber Security" style="direction: ltr;">
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold text-dark d-block text-start">الحد الأقصى للمجموعات</label>
            <input type="number" id="new-sup-max" class="form-control" value="5" min="1" style="direction: ltr;">
          </div>
          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-secondary px-3" onclick="document.getElementById('add-supervisor-modal').style.display='none'">إلغاء</button>
            <button type="button" class="btn btn-primary px-4" onclick="submitNewSupervisorFromModal()">حفظ في قاعدة البيانات</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    modal = document.getElementById('add-supervisor-modal');
  }

  modal.style.display = 'flex';
}


async function submitNewSupervisorFromModal() {
  const nameInput = document.getElementById('new-sup-name');
  const specInput = document.getElementById('new-sup-spec');
  const maxInput = document.getElementById('new-sup-max');

  const name = nameInput ? nameInput.value.trim() : "";
  const spec = specInput ? specInput.value.trim() : "CIS";
  const max = maxInput ? parseInt(maxInput.value) : 5;

  if (!name) {
    alert("الرجاء إدخال اسم المشرف");
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:5000/api/add_supervisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, specialization: spec, max_capacity: max })
    });

    const result = await response.json();

    if (response.ok) {
    
      if (typeof showToast === 'function') {
        showToast('success', 'تم الإضافة!', 'تم حفظ المشرف الجديد في SQLite بنجاح.');
      } else {
        alert('✅ تم حفظ المشرف الجديد بنجاح في قاعدة بيانات SQLite!');
      }

   
      document.getElementById('add-supervisor-modal').style.display = 'none';
      if (nameInput) nameInput.value = "";
      if (specInput) specInput.value = "";

   
      loadAdminSupervisorsData();

    } else {
      alert("❌ خطأ أثناء الحفظ: " + result.message);
    }
  } catch (err) {
    console.error(err);
    alert("🚨 السيرفر لا يستجيب، تأكد من تشغيل ملف الـ .bat");
  }
}

async function updateSupervisorCapacity(supId, newMax, currentGroups) {
  const pct = Math.round((currentGroups / newMax) * 100);
  const bar = document.getElementById(`load-bar-${supId}`);
  const loadText = document.getElementById(`load-text-${supId}`);
  if (bar) {
    bar.style.width = `${pct}%`;
    bar.className = `fill ${pct >= 100 ? 'fill-high' : pct >= 60 ? 'fill-mid' : 'fill-low'}`;
  }
  if (loadText) loadText.innerText = `${currentGroups} / ${newMax}`;

  try {
    const response = await fetch('http://127.0.0.1:5000/api/update_capacity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: supId, max_capacity: newMax })
    });

    if (response.ok) {
      showToast('success', 'Capacity Updated!', `تم تعديل الحد الأقصى بنجاح.`);
    } else {
      showToast('danger', 'Error', 'حدث خطأ أثناء الحفظ.');
    }
  } catch (err) {
    console.error(err);
    showToast('danger', 'Connection Error', 'السيرفر لا يستجيب.');
  }
}

/* --- Admin: Students --- */
function adminStudents() {
  loadAdminStudentsData();
  return `
  <div class="page-header" style="background:linear-gradient(120deg,#160a30,#1e1040)">
    <div class="page-title">Students & Groupings</div>
    <div class="page-sub mt-1">Manage student registrations and bulk import database rosters</div>
  </div>
  <div id="admin-students-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

async function loadAdminStudentsData() {
  try {
    const data = await apiCall('students');
    const container = document.getElementById('admin-students-container');
    if (!container) return;

    container.className = '';
 container.innerHTML = `
      <div class="card-sgpms p-4">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h6 class="fw-bold mb-1">Student Directory</h6>
            <div class="text-xs text-muted">Select ungrouped students to manually form a new group, import via CSV, or send an email.</div>
            <div class="text-warning small fw-bold mt-2">
             <i class="bi bi-exclamation-triangle-fill me-1"></i>
             Note: The CSV file must follow this exact format: Student_ID,Student_Name,Student_Email,Student_Major
            </div>
            </div>
          
          <div class="d-flex gap-2">
            <input id="student-search-input" class="form-control form-control-sm" style="max-width:200px" placeholder="Search by name or ID…" oninput="filterStudentsTable()"/>
            
            <input type="file" id="csv-file-input" accept=".csv" style="display: none;" onchange="handleCSVUpload(event)">
            
            <button class="btn btn-outline-success btn-sm px-3 d-flex align-items-center gap-2" onclick="document.getElementById('csv-file-input').click()" style="border-radius: 8px;">
              <i class="bi bi-file-earmark-spreadsheet-fill"></i> Import CSV
            </button>

            <button class="btn btn-outline-primary btn-sm px-3 d-flex align-items-center gap-2" onclick="adminEmailSelectedStudents()" style="border-radius: 8px;">
              <i class="bi bi-envelope-fill"></i> Email Selected
            </button>
            
            <button class="btn btn-primary btn-sm px-3 d-flex align-items-center gap-2" onclick="adminCreateGroup()" style="border-radius: 8px;">
              <i class="bi bi-people-fill"></i> Form Group
            </button>
            
            <button class="btn-primary-sgpms btn-sm" onclick="showAddStudentModal()">
              <i class="bi bi-plus-lg me-1"></i> Add Student
            </button>
          </div>
        </div>
        
        <div class="table-responsive">
          <table class="table table-sgpms align-middle">
            <thead>
              <tr>
                <th style="width: 40px;"><input type="checkbox" class="form-check-input" onchange="toggleAllStudents(this)"></th>
                <th>ID</th>
                <th>Student Name</th>
                <th>Major</th>
                <th>Email Address</th>
                <th>Group Status</th>
              </tr>
            </thead>
            <tbody id="students-table-body">
              ${data.length === 0 ? '<tr><td colspan="6" class="text-center text-muted py-4">No student entries found. Import a CSV file to begin.</td></tr>' : ''}
              ${data.map(s => {
      const isGrouped = s.group_name && s.group_name !== "" && s.group_name !== null;
      return `
                <tr class="student-row-item">
                  <td>
                    <input type="checkbox" class="form-check-input student-checkbox" 
                           value="${s.id}" data-name="${s.name}" data-email="${s.email}" ${isGrouped ? 'disabled' : ''}>
                  </td>
                  <td class="fw-bold text-primary search-id-target">${s.id}</td>
                  <td class="fw-semibold search-name-target">${s.name}</td>
                  <td><span class="badge bg-light text-primary border">${s.major || 'CIS'}</span></td>
                  <td class="text-muted text-xs">${s.email}</td>
                  <td>
                    ${isGrouped
          ? `<span class="badge bg-success text-white"><i class="bi bi-shield-check me-1"></i>${s.group_name}</span>`
          : `<span class="badge bg-secondary text-white opacity-75">Ungrouped</span>`
        }
                  </td>
                </tr>`;
    }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  } catch (error) {
    console.error(" Error parsing students data grid:", error);
    const container = document.getElementById('admin-students-container');
    if (container) {
      container.className = '';
      container.innerHTML = `<div class="alert alert-danger w-100 text-center">Failed to load student log from SQLite database.</div>`;
    }
  }
}


function filterStudentsTable() {
  const query = document.getElementById('student-search-input').value.toLowerCase().trim();
  const rows = document.querySelectorAll('.student-row-item');

  rows.forEach(row => {
    const idText = row.querySelector('.search-id-target').textContent.toLowerCase();
    const nameText = row.querySelector('.search-name-target').textContent.toLowerCase();

    if (idText.includes(query) || nameText.includes(query)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}


function toggleAllStudents(masterCheckbox) {
  const checkboxes = document.querySelectorAll('.student-checkbox:not(:disabled)');
  checkboxes.forEach(cb => cb.checked = masterCheckbox.checked);
}



function showAddStudentModal() {
  const sId = prompt("Enter Student ID (6 digits):");
  if (!sId) return;
  const sName = prompt("Enter Student Full Name (In English):");
  if (!sName) return;
  const sMajor = prompt("Enter Major (CIS / CS / SE):", "CIS");
  if (!sMajor) return;
  const sEmail = `std${sId}@cit.just.edu.jo`;

  fetch('http://127.0.0.1:5000/api/add_student', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: sId, name: sName, major: sMajor, email: sEmail })
  })
    .then(res => res.json())
    .then(resData => {
      if (resData.status === "success") {
        showToast('success', 'Student Inserted', 'تم حفظ الطالب بنجاح داخل الـ SQLite database.');
        loadAdminStudentsData(); 
      } else {
        alert("❌ خطأ: " + resData.message);
      }
    })
    .catch(err => console.error("Error inserting student:", err));
}


async function handleCSVUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  showToast('info', 'Processing...', 'Uploading and parsing CSV database rows...');

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://127.0.0.1:5000/api/import_students_csv', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (response.ok && result.status === "success") {
      showToast('success', 'Import Success!', `تم رفع وإدخال ${result.count} طلاب بنجاح في قاعدة البيانات!`);
      loadAdminStudentsData();
    } else {
      alert("❌ خطأ أثناء معالجة الملف: " + result.message);
    }
  } catch (error) {
    console.error("🚨 Connection dropped to CSV endpoint:", error);
    showToast('danger', 'Error', 'السيرفر لا يستجيب، تأكد من تشغيل البايثون.');
  }

  event.target.value = '';
}


function toggleAllStudents(masterCheckbox) {
  const checkboxes = document.querySelectorAll('.student-checkbox:not(:disabled)');
  checkboxes.forEach(cb => cb.checked = masterCheckbox.checked);
}

async function adminCreateGroup() {
  const selected = Array.from(document.querySelectorAll('.student-checkbox:checked'));

  if (selected.length === 0) return showToast('warning', 'No Students Selected', 'Please check the box next to at least one ungrouped student.');
  if (selected.length > 5) return showToast('warning', 'Too Many Students', 'A group can have a maximum of 5 members.');

  const randomNum = Math.floor(Math.random() * 1000);
  const groupName = prompt("Enter a name for the new group:", `Team ${randomNum}`);
  if (!groupName) return; 

  const memberIds = selected.map(cb => String(cb.value));

  try {
    const response = await fetch('http://127.0.0.1:5000/api/admin_create_group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group_name: groupName, members: memberIds })
    });

    const resData = await response.json();

    if (response.ok && resData.status === "success") {
      showToast('success', 'Group Saved in DB', `تم إنشاء المجموعه ${groupName} بنجاح!`);
      loadAdminStudentsData(); 
    } else {
      alert("❌ خطأ من السيرفر: " + resData.message);
    }
  } catch (error) {
    console.error("🚨 Error in admin grouping API:", error);
    showToast('danger', 'Connection Error', 'تعذر الاتصال بالسيرفر لحفظ المجموعة.');
  }
}
function adminEmailSelectedStudents() {

  const selected = Array.from(document.querySelectorAll('.student-checkbox:checked'));


  if (selected.length === 0) {
    return showToast('warning', 'No Students Selected', 'Please select at least one student to email.');
  }


  const emails = selected.map(cb => cb.getAttribute('data-email')).filter(email => email).join(',');

  if (!emails) {
    return showToast('danger', 'Error', 'Could not find valid email addresses for the selected students.');
  }

 
  const subject = encodeURIComponent("Graduation Project Group Formation");
  const bodyText = "Hello everyone,\n\nYou can now start forming groups and choosing supervisors for your Graduation Project.\n\nThank you.";
  const body = encodeURIComponent(bodyText);


  window.location.href = `mailto:?bcc=${emails}&subject=${subject}&body=${body}`;
  
  showToast('info', 'Opening Mail Client', 'Preparing your email template...');
}

/* --- Admin: Reports --- */
function adminReports() {
  loadAdminReportsData();
  return `
  <div class="page-header" style="background:linear-gradient(120deg,#160a30,#1e1040)">
    <div class="page-title">Reports</div>
    <div class="page-sub mt-1">Generate and export system reports</div>
  </div>
  <div id="admin-reports-container" class="spinner-container">
    <div class="spinner"></div>
  </div>`;
}

async function loadAdminReportsData() {
  try {
    const realRequests = await apiCall('requests');
    const totalProjects = realRequests.length;
    const approvedCount = realRequests.filter(r => r.status === 'approved').length;
    const pendingCount = realRequests.filter(r => r.status === 'pending').length;
    const rejectedCount = realRequests.filter(r => r.status === 'rejected').length;

    const approvedPct = totalProjects > 0 ? (approvedCount / totalProjects) * 100 : 0;
    const pendingPct = totalProjects > 0 ? (pendingCount / totalProjects) * 100 : 0;
    const rejectedPct = totalProjects > 0 ? (rejectedCount / totalProjects) * 100 : 0;

    const offsetStart = 25;
    const approvedOffset = offsetStart;
    const pendingOffset = offsetStart - approvedPct;
    const rejectedOffset = offsetStart - approvedPct - pendingPct;

    const data = {
      stats: [
        { icon: 'bi-check2-circle', label: 'Approved', val: approvedCount, color: 'success' },
        { icon: 'bi-hourglass-split', label: 'Pending', val: pendingCount, color: 'warning' },
        { icon: 'bi-x-circle', label: 'Rejected', val: rejectedCount, color: 'danger' },
        { icon: 'bi-collection', label: 'Total Projects', val: totalProjects, color: 'primary' },
      ],
      chartData: [
        ['var(--success)', 'Approved', approvedCount, `${approvedPct.toFixed(1)}%`],
        ['var(--warning)', 'Pending', pendingCount, `${pendingPct.toFixed(1)}%`],
        ['var(--danger)', 'Rejected', rejectedCount, `${rejectedPct.toFixed(1)}%`]
      ],
      exports: [
        { icon: 'bi-file-earmark-pdf', label: 'All Projects Report', sub: 'PDF format · All project statuses' },
        { icon: 'bi-file-earmark-spreadsheet', label: 'Supervisor Load Report', sub: 'Excel format · Capacity overview' },
        { icon: 'bi-file-earmark-bar-graph', label: 'Progress Summary', sub: 'PDF format · All groups progress' },
        { icon: 'bi-envelope-paper', label: 'Invoice to Supervisors', sub: 'Per university policy' },
      ]
    };

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
                ${approvedPct > 0 ? `<circle r="15.9" cx="21" cy="21" fill="none" stroke="var(--success)" stroke-width="6" stroke-dasharray="${approvedPct} ${100 - approvedPct}" stroke-dashoffset="${approvedOffset}" transform="rotate(-90 21 21)"/>` : ''}
                ${pendingPct > 0 ? `<circle r="15.9" cx="21" cy="21" fill="none" stroke="var(--warning)" stroke-width="6" stroke-dasharray="${pendingPct} ${100 - pendingPct}" stroke-dashoffset="${pendingOffset}" transform="rotate(-90 21 21)"/>` : ''}
                ${rejectedPct > 0 ? `<circle r="15.9" cx="21" cy="21" fill="none" stroke="var(--danger)"  stroke-width="6" stroke-dasharray="${rejectedPct} ${100 - rejectedPct}" stroke-dashoffset="${rejectedOffset}" transform="rotate(-90 21 21)"/>` : ''}
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
            <div class="fw-bold mb-3">Export Reports</div>
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
    if (container) { container.className = ''; container.innerHTML = contentHtml; }
  } catch (error) {
    console.error("Error loading reports:", error);
    const container = document.getElementById('admin-reports-container');
    if (container) container.innerHTML = '<div class="alert alert-danger w-100">Failed to load reports data.</div>';
  }
}

/* ══════════════════════════════════════════════════════════
    Admin UTILITIES & HELPERS
   ══════════════════════════════════════════════════════════ */
function statCard(icon, label, value, colorClass) {
  return `<div class="col-md-6 col-lg-3"><div class="stat-card"><div class="stat-icon ${colorClass}"><i class="bi ${icon}"></i></div><div><div class="stat-num" style="font-size:1rem;font-weight:600">${value}</div><div class="stat-label">${label}</div></div></div></div>`;
}
function statCard2(icon, label, value, colorClass) {
  return `<div class="col-md-6 col-lg-3"><div class="stat-card"><div class="stat-icon ${colorClass}"><i class="bi ${icon}"></i></div><div><div class="stat-num">${value}</div><div class="stat-label">${label}</div></div></div></div>`;
}
function statCard3(icon, label, value, colorClass) {
  return `<div class="col-md-6 col-lg-3"><div class="stat-card"><div class="stat-icon ${colorClass}"><i class="bi ${icon}"></i></div><div><div class="stat-num">${value}</div><div class="stat-label">${label}</div></div></div></div>`;
}

async function approveRequest(id) {
  try {
    const response = await fetch(`http://127.0.0.1:5000/api/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending_doctor', reason: '' })
    });
    
    const resData = await response.json();
    
    if (response.ok) {
        showToast('success', 'Forwarded to Doctor', 'تمت موافقة رئيس القسم، الطلب الآن عند الدكتور المشرف.');
        loadAdminDashboardData();
        loadAdminRequestsData();
    } else {
       
        showToast('danger', 'Action Denied', resData.message || 'حدث خطأ أثناء تمرير الطلب.');
    }
  } catch (error) {
    console.error("Error approving request:", error);
    showToast('danger', 'Connection Error', 'السيرفر لا يستجيب.');
  }
}

async function rejectRequest(id) {
  try {
    await apiCall(`requests/${id}`, 'PUT', { status: 'rejected_by_admin', reason: 'Rejected by Department Head' });
    showToast('danger', 'Rejected', 'تم رفض الطلب من قبل رئيس القسم.');
    loadAdminDashboardData();
    loadAdminRequestsData();
  } catch (error) {
    showToast('danger', 'Error', 'Could not reject the request.');
  }
}

async function viewRequestDetails(id) {
  try {
    const requests = await apiCall('requests');
    const req = requests.find(r => r.id === id);

    if (!req) {
      showToast('danger', 'Error', 'Request details not found.');
      return;
    }

    const modalId = `details-modal-${id}`;
    const statusColor = req.status === 'approved' ? 'var(--success)' : req.status === 'rejected' ? 'var(--danger)' : 'var(--warning)';

    const modalHtml = `
      <div id="${modalId}" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px);">
        <div class="card-sgpms p-4" style="max-width:550px;width:90%;position:relative;animation:slideDown 0.3s ease;">
          <button onclick="document.getElementById('${modalId}').remove()" style="position:absolute;top:15px;right:15px;background:var(--bg);border:none;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text);">
            <i class="bi bi-x-lg"></i>
          </button>         
          <div class="d-flex align-items-center gap-3 mb-4" style="border-bottom:1px solid var(--border);padding-bottom:15px;">
            <div style="width:45px;height:45px;border-radius:10px;background:${statusColor};color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">
              <i class="bi bi-card-text"></i>
            </div>
            <div>
              <h5 class="fw-bold mb-0">Project Full Details</h5>
              <div class="text-muted text-xs">ID: #${req.id}</div>
            </div>
          </div>         
          <div class="d-flex flex-column gap-3" style="max-height: 60vh; overflow-y: auto; padding-right: 10px;">           
            <div><span class="text-muted small d-block mb-1">Group Name</span> <div class="fw-bold">${req.group}</div></div>           
            <div><span class="text-muted small d-block mb-1">Supervisor</span> <div class="fw-semibold">${req.supervisor}</div></div>
            <div><span class="text-muted small d-block mb-1">Project Title</span> <div class="fw-semibold" style="color:var(--primary)">${req.project}</div></div>           
            <div>
              <span class="text-muted small d-block mb-1">Description</span> 
              <div class="p-3 rounded-3" style="background:var(--bg); font-size:0.9rem; line-height:1.6;">${req.description || 'No description provided.'}</div>
            </div>           
            <div><span class="text-muted small d-block mb-1">Academic Year</span> <div class="fw-semibold">${req.academicYear || 'N/A'}</div></div>           
            <div><span class="text-muted small d-block mb-1">Tech Stack</span> <div class="fw-semibold">${req.techStack || 'N/A'}</div></div>
            <div><span class="text-muted small d-block mb-1">Team Members (IDs)</span> <div class="fw-semibold">${req.teamMembers || 'N/A'}</div></div>
            <div class="mt-2 pt-3" style="border-top:1px dashed var(--border)">
              <span class="text-muted small d-block mb-1">Submission Date</span> <div class="fw-semibold">${req.date}</div>
            </div>
            <div>
              <span class="text-muted small d-block mb-1">Status</span> 
              <span class="badge-status badge-${req.status}">${req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

  } catch (error) {
    console.error("🚨 Error loading details:", error);
    showToast('danger', 'Error', 'Could not load project details.');
  }
}

async function submitRegistration() {
  const currentUserId = sessionStorage.getItem('currentUserId');
  const noCache = '?t=' + new Date().getTime();
  
  const title = document.getElementById('reg-title').value;
  const description = document.getElementById('reg-desc').value;
  const supSelect = document.getElementById('reg-supervisor');
  const supervisorId = supSelect.value; 
  const academicYear = document.getElementById('reg-year').value;
  const techStack = document.getElementById('reg-stack').value;

  if (title.trim() === '') return showToast('warning', 'Missing Title', 'Please enter a title for your project.');
  if (supervisorId === '') return showToast('danger', 'Select Supervisor', 'You must select a supervisor.');

  try {
    
    let finalGroupName = document.getElementById('group-name').value.trim();
    let finalMembers = document.getElementById('reg-members').value.trim();
    let realGroupId = null;

   
    const groupRes = await fetch(`http://127.0.0.1:5000/api/my_group/${currentUserId}${noCache}`);
    if (groupRes.ok) {
        const myGroupInfo = await groupRes.json();
        if (myGroupInfo.has_group) {
            realGroupId = myGroupInfo.group_id; 
        }
    }

    if (finalGroupName === '') return showToast('warning', 'Missing Name', 'Group name required.');

    const memberCount = finalMembers.split(',').filter(m => m.trim() !== '').length;
    if (memberCount > 5) return showToast('warning', 'Limit Exceeded', 'A group cannot have more than 5 members.');

    const supervisorName = supSelect.options[supSelect.selectedIndex].getAttribute('data-name');
    const today = new Date().toISOString().split('T')[0];
    
    const body = {
      group: finalGroupName,
      project: title,
      description: description,
      academicYear: academicYear,
      teamMembers: finalMembers,
      techStack: techStack,
      supervisor: supervisorName,       
      supervisor_id: parseInt(supervisorId),
      date: today,
      status: 'pending_admin',
      group_id: realGroupId 
    };

    const response = await fetch('http://127.0.0.1:5000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    
    const resData = await response.json();
    
    if (response.ok && resData.status === 'success') {
        showToast('success', 'Submitted', 'Your request is now pending Admin approval.');
        loadRegistrationData();
    } else {
        showToast('danger', 'Request Denied', resData.message || 'Failed to submit request.');
    }
  } catch (error) {
    showToast('danger', 'Connection Error', 'Failed to submit request.');
  }
}


function initSection(section) {
  setTimeout(() => {
    document.querySelectorAll('.progress-sgpms .bar').forEach(b => {
    
      if (b.dataset.init) return; 
      b.dataset.init = 'true';
      
      const w = b.style.width; 
      b.style.width = '0%'; 
      setTimeout(() => { b.style.width = w; }, 50);
    });
    
    document.querySelectorAll('.sup-cap-bar .fill').forEach(f => {
    
      if (f.dataset.init) return; 
      f.dataset.init = 'true';
      
      const w = f.style.width; 
      f.style.width = '0%'; 
      setTimeout(() => { f.style.width = w; }, 50);
    });
  }, 80);
  
  if (section === 'ai') startSGPMSChat();
}



function showToast(type, title, msg) {
  const iconMap = { success: 'bi-check-circle-fill', danger: 'bi-x-circle-fill', info: 'bi-info-circle-fill', warning: 'bi-exclamation-triangle-fill' };
  const colorMap = { success: 'var(--success)', danger: 'var(--danger)', info: 'var(--primary)', warning: 'var(--warning)' };
  const id = 'toast-' + Date.now();
  const container = document.getElementById('toast-container');
  if (!container) return; 
  container.insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast-sgpms d-flex align-items-center gap-3 mb-2">
      <i class="bi ${iconMap[type]}" style="color:${colorMap[type]};font-size:1.2rem;flex-shrink:0"></i>
      <div><div class="fw-semibold" style="font-size:0.88rem">${title}</div><div class="text-muted" style="font-size:0.82rem">${msg}</div></div>
    </div>`);
  setTimeout(() => { const el = document.getElementById(id); if (el) el.remove(); }, 3500);
}


async function deleteSupervisorFromDB(supId) {
  if (!confirm("هل أنت متأكد من حذف هذا المشرف نهائياً من قاعدة البيانات؟")) return;

  try {
    const response = await fetch(`http://127.0.0.1:5000/api/delete_supervisor/${supId}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (response.ok) {
      showToast('success', 'Deleted!', 'تم حذف المشرف وتحديث الجداول بنجاح.');
      loadAdminSupervisorsData();
    } else {
      alert("خطأ أثناء الحذف: " + result.message);
    }
  } catch (err) {
    console.error("🚨 Error connecting to delete API:", err);
    alert("السيرفر لا يستجيب، تأكد من تشغيل الـ .bat");
  }
}