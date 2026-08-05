let schemaReady: Promise<void> | null = null;

const SCHEMA = `
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS institutions(id TEXT PRIMARY KEY,name TEXT NOT NULL UNIQUE,type TEXT NOT NULL,representative_user_id TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,student_id TEXT UNIQUE,name TEXT NOT NULL,role TEXT NOT NULL,institution TEXT,stage TEXT,status TEXT NOT NULL DEFAULT 'Active',active_course_id TEXT,email TEXT,phone TEXT,photo_key TEXT,passkey_hash TEXT,representative_active INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS courses(id TEXT PRIMARY KEY,name TEXT NOT NULL,institution TEXT NOT NULL,stage TEXT NOT NULL,visibility TEXT NOT NULL CHECK(visibility IN ('Public','Institution')),progress INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS subjects(id TEXT PRIMARY KEY,course_id TEXT NOT NULL,name TEXT NOT NULL,instructor TEXT NOT NULL,progress INTEGER NOT NULL DEFAULT 0,next_lecture_at TEXT,FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS signup_requests(id TEXT PRIMARY KEY,name TEXT NOT NULL,father_name TEXT,grandfather_name TEXT,date_of_birth TEXT,sex TEXT,role TEXT NOT NULL,institution TEXT,stage TEXT,email TEXT NOT NULL,phone TEXT NOT NULL,photo_key TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'Pending',approval_tier TEXT NOT NULL,account_type TEXT NOT NULL DEFAULT 'Institution',admin_approved INTEGER NOT NULL DEFAULT 0,representative_approved INTEGER NOT NULL DEFAULT 0,rejection_reason TEXT,student_id TEXT,passkey_hash TEXT,reviewed_by TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,reviewed_at TEXT);
CREATE TABLE IF NOT EXISTS verification_codes(id TEXT PRIMARY KEY,channel TEXT NOT NULL,destination TEXT NOT NULL,code_hash TEXT NOT NULL,expires_at TEXT NOT NULL,verified_at TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,token_hash TEXT NOT NULL UNIQUE,impersonator_user_id TEXT,expires_at TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS audit_logs(id INTEGER PRIMARY KEY AUTOINCREMENT,actor_id TEXT,action TEXT NOT NULL,target_id TEXT,metadata TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS institution_stage_courses(id TEXT PRIMARY KEY,institution TEXT NOT NULL,stage TEXT NOT NULL,course_id TEXT NOT NULL,UNIQUE(institution,stage),FOREIGN KEY(course_id) REFERENCES courses(id));
CREATE TABLE IF NOT EXISTS enrollments(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,course_id TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'Active',progress INTEGER NOT NULL DEFAULT 0,enrolled_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE(user_id,course_id));
CREATE TABLE IF NOT EXISTS lectures(id TEXT PRIMARY KEY,subject_id TEXT NOT NULL,title TEXT NOT NULL,starts_at TEXT NOT NULL,room_or_link TEXT,duration_minutes INTEGER,recording_key TEXT,status TEXT NOT NULL DEFAULT 'Upcoming');
CREATE TABLE IF NOT EXISTS attachments(id TEXT PRIMARY KEY,subject_id TEXT NOT NULL,name TEXT NOT NULL,file_key TEXT NOT NULL,mime_type TEXT,size_bytes INTEGER,uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS study_rooms(id TEXT PRIMARY KEY,course_id TEXT NOT NULL,name TEXT NOT NULL,host_user_id TEXT,starts_at TEXT,capacity INTEGER NOT NULL DEFAULT 12,status TEXT NOT NULL DEFAULT 'Open');
CREATE TABLE IF NOT EXISTS community_posts(id TEXT PRIMARY KEY,course_id TEXT NOT NULL,author_user_id TEXT,title TEXT NOT NULL,body TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS donations(id TEXT PRIMARY KEY,user_id TEXT,amount_cents INTEGER NOT NULL,currency TEXT NOT NULL DEFAULT 'USD',purpose TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'Pending',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS course_creation_requests(id TEXT PRIMARY KEY,creator_user_id TEXT NOT NULL,title TEXT NOT NULL,visibility TEXT NOT NULL,institution TEXT,stage TEXT,donation_id TEXT,status TEXT NOT NULL DEFAULT 'Draft',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,title TEXT NOT NULL,organization TEXT NOT NULL,location TEXT,employment_type TEXT,tags TEXT,status TEXT NOT NULL DEFAULT 'Open',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS job_applications(id TEXT PRIMARY KEY,job_id TEXT NOT NULL,user_id TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'Applied',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS volunteer_programs(id TEXT PRIMARY KEY,title TEXT NOT NULL,organization TEXT NOT NULL,hours_target INTEGER NOT NULL DEFAULT 0,status TEXT NOT NULL DEFAULT 'Open');
CREATE TABLE IF NOT EXISTS volunteer_hours(id TEXT PRIMARY KEY,program_id TEXT NOT NULL,user_id TEXT NOT NULL,hours REAL NOT NULL,verified INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS notifications(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,title TEXT NOT NULL,body TEXT NOT NULL,type TEXT NOT NULL DEFAULT 'Info',read_at TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS email_outbox(id TEXT PRIMARY KEY,recipient TEXT NOT NULL,subject TEXT NOT NULL,html TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'Queued',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,sent_at TEXT);
CREATE INDEX IF NOT EXISTS idx_signup_status ON signup_requests(status);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
INSERT OR IGNORE INTO courses(id,name,institution,stage,visibility,progress) VALUES('c1','Computer Science — Stage 2','Baghdad University','Stage 2','Institution',68),('c2','English for Academic Success','Whyman Public','Open','Public',41),('c3','Data Literacy Essentials','Whyman Public','Open','Public',23),('c4','Software Engineering Studio','Baghdad University','Stage 2','Institution',12);
INSERT OR IGNORE INTO subjects(id,course_id,name,instructor,progress,next_lecture_at) VALUES('s1','c1','Algorithms & Data Structures','Dr. Noor Al-Samarrai',72,'2026-08-06T10:00:00Z'),('s2','c1','Database Systems','Prof. Kareem Hassan',64,'2026-08-09T12:30:00Z'),('s3','c1','Computer Networks','Dr. Leen Abbas',51,'2026-08-10T09:00:00Z'),('s4','c1','Software Engineering','Ms. Tara Younis',78,'2026-08-11T11:00:00Z');
INSERT OR IGNORE INTO institution_stage_courses(id,institution,stage,course_id) VALUES('map-baghdad-2','Baghdad University','Stage 2','c1');
INSERT OR IGNORE INTO lectures(id,subject_id,title,starts_at,room_or_link,duration_minutes,status) VALUES('l1','s1','Graph Algorithms','2026-08-06T10:00:00Z','Lab 4',90,'Upcoming'),('l2','s2','SQL Joins Workshop','2026-08-09T12:30:00Z','Room B12',75,'Upcoming');
INSERT OR IGNORE INTO jobs(id,title,organization,location,employment_type,tags) VALUES('j1','Junior Frontend Intern','Nahrain Labs','Baghdad','Internship','React,TypeScript'),('j2','Community Coordinator','Learn Iraq','Remote','Part-time','Community,Education');
INSERT OR IGNORE INTO volunteer_programs(id,title,organization,hours_target) VALUES('v1','Digital Literacy Weekend','Whyman Foundation',12),('v2','Campus Welcome Team','Baghdad University',8);
`;

export function ensureSchema(db: D1Database): Promise<void> {
  if (!schemaReady) schemaReady = db.exec(SCHEMA).then(() => undefined).catch(error => { schemaReady = null; throw error; });
  return schemaReady;
}
