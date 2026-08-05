export type PlatformRole = 'Student' | 'Representative Student' | 'Teacher' | 'Manager' | 'Admin';

export const settingsNavigation = [
  'Account & Profile',
  'Privacy & Security',
  'Two-Factor Authentication',
  'Notification Preferences',
  'Appearance & Theme',
  'Language & Region',
  'Accessibility',
  'Connected Accounts',
  'Billing & Subscription',
  'Data Export',
  'Devices & Active Sessions',
  'Help & Support',
  'Legal / Delete Account',
] as const;

export const sharedSidebarNavigation = [
  'Profile',
  'Messages / Inbox',
  'Create a Course',
  'Apply to Work',
  'Volunteer',
  'Donate to Us',
  'AI Agent',
  'Resource Library',
  'Rewards & Wallet',
  'Settings',
] as const;

export const roleMainNavigation: Record<PlatformRole, readonly string[]> = {
  Student: ['Home', 'Study', 'Calendar', 'Study Rooms', 'Community', 'Progress & Analytics', 'Courses'],
  'Representative Student': ['Home', 'Study', 'Calendar', 'Study Rooms', 'Community', 'Progress & Analytics', 'Courses'],
  Teacher: ['Dashboard', 'My Classes', 'Gradebook', 'Calendar', 'Community', 'Create Course'],
  Manager: ['Dashboard', 'Team Overview', 'Course Oversight', 'Reports & Analytics', 'Approvals'],
  Admin: ['Dashboard', 'User Management', 'Course Management', 'Jobs & Volunteer Oversight', 'Donations & Finance', 'Content Moderation', 'Roles & Permissions', 'Reports & Analytics', 'System Settings & Audit Logs'],
};

export const pageSubNavigation: Record<string, readonly string[]> = {
  Home: ['Dashboard Overview', 'Courses', 'Announcements', 'Recommended for You', 'Recent Activity', 'Quick Actions', 'My Submissions / Pending Approvals'],
  Study: ['My Courses', 'Browse Catalog', 'Assignments', 'Grades & Progress', 'Certificates', 'Subjects'],
  Calendar: ['Month', 'Week', 'Agenda', 'Deadlines', 'Events & Sessions'],
  'Study Rooms': ['My Rooms', 'Discover Rooms', 'Create Room', 'Room Schedule', 'Recordings'],
  Community: ['Feed', 'Groups', 'Discussions', 'Leaderboard', 'Events', 'My Submissions / Pending Approvals'],
  'Progress & Analytics': ['Learning Streaks', 'Skill Map', 'Time Spent Reports', 'Goal Tracking'],
  Courses: ['My Courses', 'Browse Catalog', 'Course Detail'],
  Dashboard: ['Overview'],
  'My Classes': ['Active Classes', 'Upcoming Classes', 'Students', 'Attendance'],
  Gradebook: ['Grade Entry', 'Assessment Types', 'Student Progress', 'Exports'],
  'Create Course': ['New Draft', 'My Courses', 'Templates', 'Collaborators'],
  'Team Overview': ['People', 'Institutions', 'Performance', 'Activity'],
  'Course Oversight': ['All Courses', 'Approvals', 'Quality Checks', 'Reports'],
  Approvals: ['Students', 'Teachers', 'Managers', 'Courses'],
  'User Management': ['Signup Requests', 'All Students', 'Representative Students', 'Teachers', 'Managers', 'Admins', 'Suspended / Banned', 'Pending Verification'],
  'Course Management': ['All Courses', 'Pending Approval', 'Flagged / Reported', 'Categories & Tags', 'Course Analytics'],
  'Jobs & Volunteer Oversight': ['Postings', 'Applications', 'Volunteer Programs', 'Hours Verification'],
  'Donations & Finance': ['Overview', 'Sponsorships', 'Payouts / Refunds', 'Financial Reports'],
  'Content Moderation': ['Reported Content', 'Community Posts', 'AI Agent Logs'],
  'Roles & Permissions': ['Role Cards', 'Permission Matrix', 'Access History'],
  'Reports & Analytics': ['Platform Metrics', 'User Reports', 'Course Reports', 'Exports'],
  'System Settings & Audit Logs': ['Platform Settings', 'Integrations', 'Audit Logs'],
};

export const subjectDetailTabs = ['Progress', 'Lectures', 'Attachments'] as const;
export const representativeRequestTabs = ['Students', 'Teachers', 'Managers'] as const;
export const representativeToolsTabs = ['Manage Cards', 'Submission Queue', 'Rep Analytics'] as const;

export const institutionOptions = [
  {
    university: 'Baghdad University',
    colleges: [
      { name: 'College of Science', stages: ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'] },
      { name: 'College of Engineering', stages: ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5'] },
    ],
  },
  {
    university: 'University of Basra',
    colleges: [
      { name: 'College of Computer Science and IT', stages: ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'] },
      { name: 'College of Education', stages: ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'] },
    ],
  },
  {
    university: 'University of Mosul',
    colleges: [
      { name: 'College of Computer Science and Mathematics', stages: ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'] },
    ],
  },
] as const;

export const stageCourseMapping: Record<string, string> = {
  'Baghdad University|College of Science|Stage 1': 'Foundations of Computing — Stage 1',
  'Baghdad University|College of Science|Stage 2': 'Computer Science — Stage 2',
  'Baghdad University|College of Science|Stage 3': 'Advanced Computing — Stage 3',
  'Baghdad University|College of Science|Stage 4': 'Graduation Project — Stage 4',
  'Baghdad University|College of Engineering|Stage 1': 'Engineering Foundations — Stage 1',
  'Baghdad University|College of Engineering|Stage 2': 'Engineering Systems — Stage 2',
  'University of Basra|College of Computer Science and IT|Stage 1': 'Computing Fundamentals — Stage 1',
  'University of Basra|College of Computer Science and IT|Stage 2': 'Software Systems — Stage 2',
  'University of Mosul|College of Computer Science and Mathematics|Stage 1': 'Mathematics and Computing — Stage 1',
};

export const rejectionReasons = ['Fake Person', 'We Are Off Now', 'Not a Real Photo'] as const;

export const platformBusinessRules = {
  freeUserRoles: ['Student', 'Teacher'] as const,
  courseCreationDonationUsd: 5,
  representativeCourseCreationDonationWaived: true,
  freeUsersCanJoinVisibility: 'Public' as const,
  institutionApproval: ['Admin', 'Institution Representative'] as const,
  firstRepresentativeApproval: ['Admin'] as const,
  representativeGestures: {
    swipeLeft: 'Edit',
    swipeRight: 'Remove with confirmation',
  },
  signupApprovalResult: {
    accepted: 'Generate platform ID and secure six-digit passkey, send branded acceptance email, activate account, and auto-enroll mapped institution course.',
    rejected: 'Require a rejection reason, send branded rejection email with support and reapply guidance, and mark the request rejected.',
  },
} as const;

export const sidebarPageSections: Record<string, readonly string[]> = {
  Profile: ['Bio Card', 'Digital ID', 'Achievements & Badges', 'Certificates & Portfolio', 'Activity History'],
  'Messages / Inbox': ['Direct Messages', 'Notifications', 'Announcements'],
  'Create a Course': ['New Draft', 'My Courses', 'Templates', 'Collaborators', '$5 Donation Gate'],
  'Apply to Work': ['Job Board', 'My Applications', 'Saved Positions', 'Interview Schedule'],
  Volunteer: ['Opportunities', 'My Hours', 'Volunteer Certificates', 'Partner Organizations'],
  'Donate to Us': ['One-Time Donation', 'Recurring Donation', 'Donation History', 'Sponsor a Student'],
  'AI Agent': ['Chat with Tutor', 'AI Study Planner', 'AI Content Generator', 'Conversation History'],
  'Resource Library': ['Templates & Guides', 'Saved Resources', 'Shared with Me'],
  'Rewards & Wallet': ['Points Balance', 'Points History', 'Redeem Rewards', 'Referral Program'],
  Settings: settingsNavigation,
};
