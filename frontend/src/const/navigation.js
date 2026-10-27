import {
  Dashboard,
  MailOutline,
  ManageAccounts,
  Groups,
  Description,
  School,
  WorkspacePremium,
  UploadFile,
  PersonAdd,
  ListAlt,
  Folder,
  Assignment,
  Person,
} from "@mui/icons-material";

// ===============================
// Side menu + dashboard cards, one list per role.
// This is the single place to edit when a page is built:
//   set `ready: true` and make sure `path` matches the route in App.js.
//
// item: { icon, label, text, path, ready, group? }
//   - `text` is the short line shown on the dashboard card
//   - `home: true` marks the dashboard itself (not shown as a card)
//   - `group` puts a small heading above the item in the side menu
// ===============================
export const NAV_ITEMS = {
  admin: [
    { icon: Dashboard, label: "Dashboard", path: "/admin", ready: true, home: true },
    { icon: MailOutline, label: "Invitations", text: "Send sign-up links to agents, teachers and students.", path: "/admin/invitations", ready: true, group: "People" },
    { icon: ManageAccounts, label: "Users", text: "See everyone with an account and suspend or reactivate access.", path: "/admin/users", ready: true },
    { icon: Groups, label: "Agents", text: "See each agent and send agreements.", path: "/admin/agents", ready: true },
    { icon: Description, label: "Agreements", text: "Countersign agent agreements and edit the agreement template.", path: "/admin/agreements", ready: true, group: "Admissions" },
    { icon: School, label: "Applications", text: "Review applications and request changes.", path: "/admin/applications", ready: false },
    { icon: WorkspacePremium, label: "Offer letters", text: "Generate and send offer letters.", path: "/admin/offers", ready: false },
  ],
  agent: [
    { icon: Dashboard, label: "Dashboard", path: "/agent", ready: true, home: true },
    { icon: UploadFile, label: "My agreement", text: "Read and sign your agent agreement online.", path: "/agent/agreement", ready: true, group: "Getting started" },
    { icon: PersonAdd, label: "Add a student", text: "Submit a new student application with documents.", path: "/agent/students/new", ready: false, group: "Students" },
    { icon: ListAlt, label: "My students", text: "Track the status of each application.", path: "/agent/students", ready: false },
    { icon: WorkspacePremium, label: "Offer letters", text: "Download offers issued for your students.", path: "/agent/offers", ready: false },
  ],
  teacher: [
    { icon: Dashboard, label: "Dashboard", path: "/teacher", ready: true, home: true },
    { icon: Groups, label: "My students", text: "See the students assigned to you.", path: "/teacher/students", ready: false },
    { icon: Folder, label: "Class materials", text: "Share and manage class resources.", path: "/teacher/materials", ready: false },
  ],
  student: [
    { icon: Dashboard, label: "Dashboard", path: "/student", ready: true, home: true },
    { icon: Assignment, label: "My application", text: "See the status of your application.", path: "/student/application", ready: false },
    { icon: Folder, label: "My documents", text: "Upload and view your documents.", path: "/student/documents", ready: false },
    { icon: WorkspacePremium, label: "Offer letter", text: "Download your offer letter when it is ready.", path: "/student/offer", ready: false },
    { icon: Person, label: "My profile", text: "Update your contact details.", path: "/student/profile", ready: false },
  ],
};
