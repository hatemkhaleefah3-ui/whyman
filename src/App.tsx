import { useMemo, useState } from 'react';
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  Heart,
  Home,
  Inbox,
  LayoutDashboard,
  Library,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  X,
} from 'lucide-react';

type Role = 'Student' | 'Representative Student' | 'Teacher' | 'Manager' | 'Admin';
type Status = 'Pending' | 'Active' | 'Rejected';
type Course = {
  id: string;
  code: string;
  name: string;
  institution: string;
  stage: string;
  visibility: 'Public' | 'Institution';
  progress: number;
  accent: string;
};
type Request = {
  id: string;
  name: string;
  initials: string;
  role: Role;
  institution: string;
  stage: string;
  status: Status;
  approvalTier: string;
};

const courses: Course[] = [
  { id: 'c1', code: 'CS-202', name: 'Computer Science — Stage 2', institution: 'Baghdad University', stage: 'Stage 2', visibility: 'Institution', progress: 68, accent: 'blue' },
  { id: 'c2', code: 'ENG-110', name: 'English for Academic Success', institution: 'Whyman Public', stage: 'Open', visibility: 'Public', progress: 41, accent: 'green' },
  { id: 'c3', code: 'DATA-101', name: 'Data Literacy Essentials', institution: 'Whyman Public', stage: 'Open', visibility: 'Public', progress: 23, accent: 'purple' },
  { id: 'c4', code: 'SE-240', name: 'Software Engineering Studio', institution: 'Baghdad University', stage: 'Stage 2', visibility: 'Institution', progress: 12, accent: 'amber' },
];

const subjects = [
  { code: 'AL', name: 'Algorithms & Data Structures', instructor: 'Dr. Noor Al-Samarrai', progress: 72, next: 'Thu, 10:00 · Lab 4' },
  { code: 'DB', name: 'Database Systems', instructor: 'Prof. Kareem Hassan', progress: 64, next: 'Sun, 12:30 · Room B12' },
  { code: 'NW', name: 'Computer Networks', instructor: 'Dr. Leen Abbas', progress: 51, next: 'Mon, 09:00 · Online' },
  { code: 'SE', name: 'Software Engineering', instructor: 'Ms. Tara Younis', progress: 78, next: 'Tue, 11:00 · Studio 2' },
];

const initialRequests: Request[] = [
  { id: 'REQ-1042', name: 'Rana Mahmoud', initials: 'RM', role: 'Student', institution: 'Baghdad University', stage: 'Stage 2', status: 'Pending', approvalTier: 'Admin + Representative' },
  { id: 'REQ-1043', name: 'Ali Kareem', initials: 'AK', role: 'Teacher', institution: 'Whyman Public', stage: 'Free user', status: 'Pending', approvalTier: 'Admin' },
  { id: 'REQ-1044', name: 'Zahra Fadhil', initials: 'ZF', role: 'Representative Student', institution: 'Basra University', stage: 'Stage 1', status: 'Pending', approvalTier: 'Admin — first representative' },
];

const mainNav: Record<Role, string[]> = {
  Student: ['Home', 'Study', 'Calendar', 'Study Rooms', 'Community', 'Progress & Analytics', 'Courses'],
  'Representative Student': ['Home', 'Study', 'Calendar', 'Study Rooms', 'Community', 'Progress & Analytics', 'Courses'],
  Teacher: ['Dashboard', 'My Classes', 'Gradebook', 'Calendar', 'Community', 'Create Course'],
  Manager: ['Dashboard', 'Team Overview', 'Course Oversight', 'Reports & Analytics', 'Approvals'],
  Admin: ['Dashboard', 'User Management', 'Course Management', 'Jobs & Volunteer', 'Donations & Finance', 'Content Moderation', 'Roles & Permissions', 'Reports & Analytics', 'System Settings'],
};

const subNav: Record<string, string[]> = {
  Home: ['Dashboard Overview', 'My Submissions / Pending Approvals'],
  Study: ['My Courses', 'Browse Catalog', 'Assignments', 'Grades & Progress', 'Certificates', 'Subjects'],
  Calendar: ['Month', 'Week', 'Agenda', 'Deadlines', 'Events & Sessions'],
  'Study Rooms': ['My Rooms', 'Discover Rooms', 'Create Room', 'Room Schedule', 'Recordings'],
  Community: ['Feed', 'Groups', 'Discussions', 'Leaderboard', 'Events', 'My Submissions / Pending Approvals'],
  'Progress & Analytics': ['Learning Streaks', 'Skill Map', 'Time Spent Reports', 'Goal Tracking'],
  Courses: ['My Courses', 'Browse Catalog', 'Course Detail'],
  Dashboard: ['Overview'],
  'User Management': ['Signup Requests', 'All Students', 'Representative Students', 'Teachers', 'Managers', 'Admins', 'Suspended/Banned', 'Pending Verification'],
  'Course Management': ['All Courses', 'Pending Approval', 'Flagged/Reported', 'Categories & Tags', 'Course Analytics'],
  'Jobs & Volunteer': ['Postings', 'Applications', 'Volunteer Programs', 'Hours Verification'],
  'Donations & Finance': ['Overview', 'Sponsorships', 'Payouts/Refunds', 'Financial Reports'],
  'Content Moderation': ['Reported Content', 'Community Posts', 'AI Agent Logs'],
  'Roles & Permissions': ['Role Matrix'],
  'Reports & Analytics': ['Platform Metrics', 'Exports'],
  'System Settings': ['Settings', 'Audit Logs'],
};

const sidebarItems = [
  ['Profile', Users], ['Messages / Inbox', Inbox], ['Create a Course', Plus], ['Apply to Work', Briefcase], ['Volunteer', Heart],
  ['Donate to Us', Heart], ['AI Agent', Sparkles], ['Resource Library', Library], ['Rewards & Wallet', Wallet], ['Settings', Settings],
] as const;

export function App() {
  const [entered, setEntered] = useState(false);
  const [wizard, setWizard] = useState(false);
  const [role, setRole] = useState<Role>('Student');
  const [page, setPage] = useState('Home');
  const [tab, setTab] = useState('Dashboard Overview');
  const [activeCourse, setActiveCourse] = useState('c1');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [requests, setRequests] = useState(initialRequests);
  const [impersonated, setImpersonated] = useState<string | null>(null);

  const currentCourse = courses.find((course) => course.id === activeCourse) ?? courses[0];
  const tabs = (subNav[page] ?? ['Overview']).filter((item) => role === 'Representative Student' || !item.includes('My Submissions'));

  const changeRole = (nextRole: Role) => {
    const firstPage = mainNav[nextRole][0];
    setRole(nextRole);
    setPage(firstPage);
    setTab(subNav[firstPage]?.[0] ?? 'Overview');
    setEntered(true);
  };

  if (!entered) {
    return (
      <Landing
        onJoin={() => setWizard(true)}
        onEnter={() => changeRole('Student')}
        wizard={wizard}
        close={() => setWizard(false)}
        submit={() => {
          setRequests((current) => [
            { id: `REQ-${1045 + current.length}`, name: 'New Applicant', initials: 'NA', role: 'Student', institution: 'Baghdad University', stage: 'Stage 2', status: 'Pending', approvalTier: 'Admin + Representative' },
            ...current,
          ]);
          setWizard(false);
          setEntered(true);
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      {impersonated && (
        <div className="impersonation-banner">
          <span>Viewing as <strong>{impersonated}</strong></span>
          <button onClick={() => setImpersonated(null)}>Return to Admin</button>
        </div>
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">W</div>
          <div className="brand-copy"><strong>Whyman</strong><small>Learning Network</small></div>
          <button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <div className="sidebar-section-label">Workspace</div>
        <nav className="sidebar-nav">
          {sidebarItems.map(([label, Icon], index) => (
            <button className={`sidebar-item ${index === 0 ? 'active' : ''}`} key={label}>
              <Icon size={18} /><span>{label}</span>
            </button>
          ))}
          {role === 'Representative Student' && (
            <>
              <button className="sidebar-item"><ShieldCheck size={18} /><span>Rep Tools</span></button>
              <button className="sidebar-item"><Users size={18} /><span>Requests</span></button>
            </>
          )}
        </nav>
        <div className="sidebar-foot">
          <div className="mini-profile"><div className="avatar">TA</div><div><strong>Tary Avy</strong><small>{role}</small></div></div>
          <button className="collapse-button" onClick={() => setCollapsed((value) => !value)}>{collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}<span>Collapse</span></button>
        </div>
      </aside>

      {mobileOpen && <button className="mobile-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}

      <main className="workspace">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu /></button>
            <div className="main-nav-scroll">
              {mainNav[role].map((item) => (
                <button key={item} className={item === page ? 'active' : ''} onClick={() => { setPage(item); setTab(subNav[item]?.[0] ?? 'Overview'); }}>{item}</button>
              ))}
            </div>
          </div>
          <div className="topbar-actions">
            <button className="search-button"><Search size={17} /><span>Search</span><kbd>⌘K</kbd></button>
            <button className="icon-button"><Bell size={18} /></button>
            <RoleSwitcher role={role} onChange={changeRole} />
            <div className="avatar">TA</div>
          </div>
        </header>

        <div className="subnav">
          {tabs.map((item) => <button key={item} className={item === tab ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>)}
        </div>

        <section className="content-area">
          <div className="page-hero">
            <div>
              <span className="eyebrow">{role}{role === 'Representative Student' ? ' · Rep Mode' : ''}</span>
              <h1>{page}</h1>
              <p>{tab}</p>
            </div>
            <div className="page-actions">
              {role === 'Representative Student' && <button className="button secondary"><Plus size={16} />Add card</button>}
              <button className="button primary">Open workspace</button>
            </div>
          </div>

          {role === 'Teacher' || role === 'Manager' ? (
            <ComingSoon role={role} />
          ) : role === 'Admin' ? (
            <Admin page={page} tab={tab} requests={requests} setRequests={setRequests} impersonate={setImpersonated} />
          ) : (
            <StudentView page={page} tab={tab} course={currentCourse} activeCourse={activeCourse} setActiveCourse={setActiveCourse} />
          )}
        </section>
      </main>
    </div>
  );
}

function Landing({ onJoin, onEnter, wizard, close, submit }: { onJoin: () => void; onEnter: () => void; wizard: boolean; close: () => void; submit: () => void }) {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="sidebar-brand compact"><div className="brand-mark">W</div><div className="brand-copy"><strong>Whyman</strong><small>Learning Network</small></div></div>
        <div className="landing-links"><a href="#about">About</a><a href="#features">Features</a><a href="#stories">Stories</a><a href="#contact">Contact</a></div>
        <button className="button primary" onClick={onJoin}>Join Us</button>
      </nav>

      <section className="landing-hero">
        <div className="hero-copy">
          <span className="hero-pill"><ShieldCheck size={15} />Verified education, built for community</span>
          <h1>One platform for learning, opportunity, and impact.</h1>
          <p>Courses, credentials, volunteering, jobs, donations, and trusted communities—designed around the learner journey.</p>
          <div className="hero-actions"><button className="button primary large" onClick={onJoin}>Join Whyman</button><button className="button secondary large" onClick={onEnter}>Explore the demo</button></div>
          <div className="hero-proof"><div className="stacked-avatars"><span>RA</span><span>AK</span><span>LN</span><span>+4k</span></div><p>Trusted by learners and institutions across Iraq</p></div>
        </div>
        <div className="hero-visual">
          <div className="hero-orb orb-one" /><div className="hero-orb orb-two" />
          <div className="credential-card">
            <div className="credential-top"><div className="brand-mark inverse">W</div><span>WHyman Digital Credential</span></div>
            <div className="credential-profile"><div className="credential-photo">TA</div><div><small>STUDENT</small><h3>Tary Avy</h3><p>Computer Science · Stage 2</p></div></div>
            <div className="credential-bottom"><span>ID: STU-2026-004821</span><div className="credential-chip">VERIFIED</div></div>
          </div>
          <div className="floating-card floating-one"><CheckCircle2 size={19} /><div><strong>Identity verified</strong><small>Approved 2 minutes ago</small></div></div>
          <div className="floating-card floating-two"><Award size={19} /><div><strong>New badge earned</strong><small>Five-day learning streak</small></div></div>
        </div>
      </section>

      <section className="landing-stats">
        {[['128', 'Institutions onboarded'], ['6,204', 'Credentials issued'], ['$42k', 'Donated to date'], ['99%', 'Verification accuracy']].map(([value, label]) => <div className="metric-card" key={label}><strong>{value}</strong><span>{label}</span></div>)}
      </section>

      <section className="landing-section" id="features">
        <div className="section-intro"><span className="eyebrow">Built around real outcomes</span><h2>Everything learners need, connected.</h2><p>Whyman unifies learning, identity, opportunity, and community into one responsive experience.</p></div>
        <div className="feature-grid">
          <FeatureCard icon={<BookOpen />} title="Course-first learning" text="Switch your active course and subjects, calendar, rooms, and community follow instantly." />
          <FeatureCard icon={<ShieldCheck />} title="Trusted credentials" text="Issue digital IDs, passkeys, certificates, badges, and verified portfolios." />
          <FeatureCard icon={<Briefcase />} title="Opportunity network" text="Discover jobs, volunteering, sponsorships, and community-led programs." />
        </div>
      </section>

      <section className="landing-cta" id="contact"><div><span className="eyebrow">Start your journey</span><h2>Learn with purpose. Grow with proof.</h2><p>Create your request in a few guided steps and join the Whyman community.</p></div><button className="button primary large" onClick={onJoin}>Create your request</button></section>
      <footer className="landing-footer"><span>© 2026 Whyman Learning Network</span><span>Privacy · Accessibility · Support</span></footer>
      {wizard && <JoinWizard close={close} submit={submit} />}
    </div>
  );
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="feature-card"><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p><a href="#about">Learn more <ChevronRight size={15} /></a></article>;
}

function JoinWizard({ close, submit }: { close: () => void; submit: () => void }) {
  const [step, setStep] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const steps = ['Account', 'Identity', 'Role', 'Institution', 'Verification', 'Submit'];
  return (
    <div className="modal-backdrop">
      <div className="wizard-panel">
        <aside className="wizard-aside"><div className="brand-mark inverse">W</div><span className="eyebrow light">Join Whyman</span><h2>Your verified learning identity starts here.</h2><p>Complete one simple step at a time. Your information is reviewed before your account becomes active.</p><div className="wizard-step-list">{steps.map((label, index) => <div className={index <= step ? 'active' : ''} key={label}><span>{index + 1}</span><p>{label}</p></div>)}</div></aside>
        <div className="wizard-content">
          <button className="icon-button wizard-close" onClick={close}><X /></button>
          <div className="mobile-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
          {step === 0 && <><span className="eyebrow">Step 1 of 6</span><h2>Do you already have an account?</h2><p className="lead">Choose how you would like to continue.</p><div className="choice-grid"><button className="choice-card" onClick={() => setStep(1)}><GraduationCap /><strong>Create a new account</strong><span>Join as a student, representative, teacher, or manager.</span></button><button className="choice-card"><ShieldCheck /><strong>Sign in</strong><span>Use your student ID and six-digit passkey.</span></button></div></>}
          {step === 1 && <><span className="eyebrow">Step 2 of 6</span><h2>Tell us who you are</h2><p className="lead">Use your real identity exactly as it appears on official documents.</p><div className="form-grid"><label>First name<input placeholder="Tary" /></label><label>Father's name<input placeholder="Hatem" /></label><label>Grandfather's name<input placeholder="Khalil" /></label><label>Date of birth<input type="date" /></label><label>Sex<select><option>Select</option><option>Female</option><option>Male</option></select></label><label className="upload-field">Real photo<input type="file" accept="image/*" /><span>Upload photo</span></label></div></>}
          {step === 2 && <><span className="eyebrow">Step 3 of 6</span><h2>Choose your user type</h2><p className="lead">Your role determines your permissions and approval path.</p><div className="choice-grid four">{['Student', 'Representative Student', 'Teacher', 'Manager'].map((label) => <button className="choice-card compact-choice" key={label}><Users /><strong>{label}</strong></button>)}</div></>}
          {step === 3 && <><span className="eyebrow">Step 4 of 6</span><h2>Connect to an institution</h2><p className="lead">Institution accounts are mapped to a predefined stage and course.</p><div className="form-grid"><label>Account path<select><option>Specific institution</option><option>Free user</option></select></label><label>University / College<select><option>Baghdad University</option><option>Basra University</option><option>University of Mosul</option></select></label><label>Stage<select><option>Stage 2</option><option>Stage 1</option><option>Stage 3</option><option>Stage 4</option></select></label></div></>}
          {step === 4 && <><span className="eyebrow">Step 5 of 6</span><h2>Verify your contact details</h2><p className="lead">Email and phone are verified independently.</p><div className="verification-stack"><div className="verification-card"><label>Email address<input placeholder="name@example.com" /></label><button className="button secondary" onClick={() => setEmailVerified(true)}>Send code</button>{emailVerified && <span className="status-chip success"><CheckCircle2 size={13} />Verified</span>}</div><div className="verification-card"><label>Phone number<input placeholder="+964 7XX XXX XXXX" /></label><button className="button secondary" onClick={() => setPhoneVerified(true)}>Send code</button>{phoneVerified && <span className="status-chip success"><CheckCircle2 size={13} />Verified</span>}</div></div></>}
          {step === 5 && <><span className="eyebrow">Step 6 of 6</span><h2>Ready for review</h2><p className="lead">Your signup request will enter the admin review queue. Institution accounts may also require representative approval.</p><div className="review-summary"><CheckCircle2 /><div><strong>Request prepared</strong><span>Identity, role, institution, and verification details are ready.</span></div></div><button className="button success large" onClick={submit}>Send request</button></>}
          <div className="wizard-actions">{step > 0 && <button className="button secondary" onClick={() => setStep((value) => value - 1)}>Back</button>}{step < 5 && <button className="button primary" onClick={() => setStep((value) => value + 1)}>Continue</button>}</div>
        </div>
      </div>
    </div>
  );
}

function RoleSwitcher({ role, onChange }: { role: Role; onChange: (role: Role) => void }) {
  return <select className="role-switcher" value={role} onChange={(event) => onChange(event.target.value as Role)}>{(['Student', 'Representative Student', 'Teacher', 'Manager', 'Admin'] as Role[]).map((item) => <option key={item}>{item}</option>)}</select>;
}

function ActiveCourseChip({ course }: { course: Course }) {
  return <span className="active-course-chip"><span />Active Course: {course.name}</span>;
}

function StudentView({ page, tab, course, activeCourse, setActiveCourse }: { page: string; tab: string; course: Course; activeCourse: string; setActiveCourse: (id: string) => void }) {
  if (page === 'Study' && tab === 'Subjects') {
    return <><ActiveCourseChip course={course} /><div className="subject-grid">{subjects.map((subject) => <article className="subject-card" key={subject.name}><div className="subject-icon">{subject.code}</div><div className="subject-content"><div className="subject-top"><div><h3>{subject.name}</h3><p>{subject.instructor}</p></div><strong>{subject.progress}%</strong></div><div className="progress-track"><span style={{ width: `${subject.progress}%` }} /></div><small><Clock3 size={13} />Next: {subject.next}</small></div></article>)}</div></>;
  }

  return (
    <>
      <div className="dashboard-summary">
        <div><span className="eyebrow">Wednesday, August 5</span><h2>Good morning, Tary.</h2><p>You have two classes, one deadline, and a study room session today.</p></div>
        <div className="summary-score"><span>Weekly goal</span><strong>78%</strong><div className="progress-track"><span style={{ width: '78%' }} /></div></div>
      </div>
      <ActiveCourseChip course={course} />
      {(page === 'Home' || page === 'Courses') && <Section title="Your courses" subtitle="Choose a course to make it active across the platform." action="See all courses"><div className="course-grid">{courses.map((item) => <button key={item.id} className={`course-card accent-${item.accent} ${item.id === activeCourse ? 'selected' : ''}`} onClick={() => setActiveCourse(item.id)}><div className="course-card-head"><span className={`course-status ${item.id === activeCourse ? 'active' : ''}`}>{item.id === activeCourse ? 'Active course' : item.visibility}</span><span className="course-code">{item.code}</span></div><div><h3>{item.name}</h3><p>{item.institution} · {item.stage}</p></div><div className="course-progress"><div className="progress-track"><span style={{ width: `${item.progress}%` }} /></div><small>{item.progress}% complete</small></div></button>)}</div></Section>}
      <div className="dashboard-grid">
        <Section title="Today" subtitle="Your next scheduled learning moments."><div className="timeline-list"><TimelineItem time="10:00" icon={<BookOpen />} title="Algorithms lecture" text="Lab 4 · Dr. Noor Al-Samarrai" /><TimelineItem time="12:30" icon={<FileText />} title="Database assignment due" text="Relational design exercise" /><TimelineItem time="19:30" icon={<MessageCircle />} title="Study room session" text="Algorithms peer group" /></div></Section>
        <Section title="Progress snapshot" subtitle="Your momentum across the active course."><div className="mini-stats"><MiniStat icon={<BarChart3 />} value="68%" label="Course progress" /><MiniStat icon={<Award />} value="8" label="Badges earned" /><MiniStat icon={<Clock3 />} value="12.4h" label="This week" /></div></Section>
        <Section title="Announcements" subtitle="Latest updates from your institution."><Announcement title="Midterm rooms updated" text="Room assignments are now available for the active course." tag="Academic" /><Announcement title="Community service day" text="Volunteer registration closes Friday at 5:00 PM." tag="Community" /></Section>
        <Section title="Recommended for you" subtitle="Personalized based on your learning activity."><Recommendation icon={<Sparkles />} title="Practice SQL joins" text="20-minute guided exercise" /><Recommendation icon={<Users />} title="Algorithms study room" text="Eight classmates are joining tonight" /></Section>
      </div>
    </>
  );
}

function Section({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: string; children: React.ReactNode }) {
  return <section className="section-block"><div className="section-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action && <button>{action}</button>}</div>{children}</section>;
}

function TimelineItem({ time, icon, title, text }: { time: string; icon: React.ReactNode; title: string; text: string }) {
  return <div className="timeline-item"><time>{time}</time><div className="timeline-icon">{icon}</div><div><strong>{title}</strong><span>{text}</span></div></div>;
}
function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) { return <div className="mini-stat"><div>{icon}</div><strong>{value}</strong><span>{label}</span></div>; }
function Announcement({ title, text, tag }: { title: string; text: string; tag: string }) { return <article className="announcement"><div><span>{tag}</span><h3>{title}</h3><p>{text}</p></div><ChevronRight size={18} /></article>; }
function Recommendation({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <article className="recommendation"><div className="recommendation-icon">{icon}</div><div><h3>{title}</h3><p>{text}</p></div><button>Open</button></article>; }

function Admin({ page, tab, requests, setRequests, impersonate }: { page: string; tab: string; requests: Request[]; setRequests: React.Dispatch<React.SetStateAction<Request[]>>; impersonate: (name: string) => void }) {
  const pendingCount = useMemo(() => requests.filter((item) => item.status === 'Pending').length, [requests]);
  if (page === 'User Management' && tab === 'Signup Requests') {
    return <><div className="admin-toolbar"><div><strong>{pendingCount} pending requests</strong><span>Review identity, institution, and approval requirements.</span></div><div><button className="button secondary"><Search size={16} />Filter</button><button className="button primary">Export queue</button></div></div><div className="request-grid">{requests.map((request) => <SignupRequestCard key={request.id} request={request} update={(status) => setRequests((items) => items.map((item) => item.id === request.id ? { ...item, status } : item))} />)}</div></>;
  }
  if (page === 'User Management') return <AdminTable impersonate={impersonate} />;
  return <><div className="admin-kpi-grid">{[['12,408', 'Total users', '+8.2%'], ['86', 'Active courses', '+4 this month'], ['17', 'Pending requests', 'Needs review'], ['$1,284', "Today's donations", '+18.6%']].map(([value, label, trend]) => <div className="admin-kpi" key={label}><span>{label}</span><strong>{value}</strong><small>{trend}</small></div>)}</div><div className="dashboard-grid"><Section title="Platform health" subtitle="Live operational snapshot."><div className="health-card"><div className="health-score"><strong>99.98%</strong><span>API success rate</span></div><div className="health-lines"><p><span className="dot success" />D1 database operational</p><p><span className="dot success" />R2 file storage operational</p><p><span className="dot success" />Worker routes healthy</p></div></div></Section><Section title="Recent activity" subtitle="Latest high-impact admin events."><div className="audit-list"><Audit actor="Admin" action="Approved REQ-1041" time="4 min ago" /><Audit actor="Rep · Baghdad" action="Reviewed institution request" time="18 min ago" /><Audit actor="System" action="Generated credential bundle" time="29 min ago" /></div></Section></div></>;
}

function SignupRequestCard({ request, update }: { request: Request; update: (status: Status) => void }) {
  const [reason, setReason] = useState('Fake Person');
  const [stamp, setStamp] = useState<Status | null>(null);
  const act = (status: Status) => { setStamp(status); window.setTimeout(() => update(status), 420); };
  return <article className="request-card"><div className={`stamp ${stamp ? 'show' : ''} ${stamp?.toLowerCase()}`}>{stamp === 'Active' ? 'Approved' : stamp}</div><div className="request-head"><div className="request-avatar">{request.initials}</div><div><span>{request.id}</span><h3>{request.name}</h3><p>{request.role}</p></div><span className={`status-chip ${request.status.toLowerCase()}`}>{request.status}</span></div><dl><div><dt>Institution</dt><dd>{request.institution}</dd></div><div><dt>Stage</dt><dd>{request.stage}</dd></div><div><dt>Approval path</dt><dd>{request.approvalTier}</dd></div></dl><div className="request-actions"><button className="button success" onClick={() => act('Active')}>Accept</button><select value={reason} onChange={(event) => setReason(event.target.value)}><option>Fake Person</option><option>We Are Off Now</option><option>Not a Real Photo</option></select><button className="button danger" onClick={() => act('Rejected')}>Reject</button></div></article>;
}

function AdminTable({ impersonate }: { impersonate: (name: string) => void }) {
  const users = [['STU-4821', 'Sara Hassan', 'Student', 'Baghdad University', 'Active'], ['REP-1102', 'Omar Naji', 'Representative Student', 'Basra University', 'Active'], ['TCH-2040', 'Dr. Leen Abbas', 'Teacher', 'Whyman Public', 'Pending']];
  return <div className="table-card"><div className="table-toolbar"><div><h2>All users</h2><p>Search, filter, review, and impersonate accounts.</p></div><button className="button secondary"><Search size={16} />Search users</button></div><div className="table-scroll"><table><thead><tr><th>ID</th><th>User</th><th>Role</th><th>Institution</th><th>Status</th><th>Actions</th></tr></thead><tbody>{users.map((user) => <tr key={user[0]}>{user.map((cell, index) => <td key={index}>{index === 4 ? <span className="status-chip success">{cell}</span> : cell}</td>)}<td><button className="table-action" onClick={() => impersonate(user[1])}>Join as user</button></td></tr>)}</tbody></table></div></div>;
}

function Audit({ actor, action, time }: { actor: string; action: string; time: string }) { return <div className="audit-item"><div className="audit-icon"><ShieldCheck size={16} /></div><div><strong>{action}</strong><span>{actor} · {time}</span></div></div>; }

function ComingSoon({ role }: { role: Role }) {
  return <div className="coming-soon"><div className="coming-icon"><LayoutDashboard /></div><span className="eyebrow">Workspace preview</span><h2>{role} tools are coming soon</h2><p>The full navigation structure is ready. Live class management, oversight, approvals, and reporting will activate in a future release.</p><div className="disabled-actions"><button disabled>Open dashboard</button><button disabled>View reports</button><button disabled>Manage records</button></div></div>;
}
