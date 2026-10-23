# GestPro Platform Requirements

**Updated Feature, Requirement Flow, and Functional Scope**
**Prepared for:** ITTIQ / Project Team | **Product:** GestPro | **Version:** 1.0 (Core Workspace & RBAC)

## Major Features Applied
*   **Workspace Isolation by Team:** Users are grouped into Teams. Projects and Tasks are strictly bound to a specific Team. Users can only access the data of the teams they belong to.
*   **Role-Based Access Control (RBAC):** Three distinct levels of access (Admin, Lead, Dev). Permissions are contextual to the user's role within a specific team.
*   **Restricted Developer Access:** Devs have "Read-Only" access to project structures. They cannot create projects, modify project details, or create tasks. They can only update the status of tasks explicitly assigned to them.
*   **Hierarchical Task Management:** Tasks follow a strict hierarchy: Epic ➔ Task ➔ Sub-task.
*   **Bulk Task Import:** Leads and Admins can import complex task hierarchies instantly via a simple text-based format (indentation-based) or CSV.
*   **Visual Kanban Board:** Interactive drag-and-drop board for tracking task progress (To Do, In Progress, Review, Done).

## Purpose of this document
This document defines the functional scope, access rules, and architectural boundaries for **GestPro**, an internal project and task management platform. It serves as the reference for developers, leads, and stakeholders to understand how data is structured, who can perform which actions, and the primary user journeys.

---

## Contents
1. Product Boundary
2. Authentication and User Management
3. Roles and Permissions (RBAC)
4. Team and Workspace Management
5. Project Management
6. Task Management & Workflows
7. Bulk Import Feature
8. Security & Access Rules
9. Core Data to Store
10. Main User Journeys
11. Summary of Developer Rules

---

## 1. Product Boundary
GestPro is a collaborative workspace platform designed to structure projects and track tasks securely across multiple teams.

| Feature / Area | Requirements | Functionalities / Flow |
| :--- | :--- | :--- |
| **Workspace Layer** | GestPro provides an isolated environment for each team. | Projects and tasks cannot exist outside of a team. A user without a team sees an empty workspace. |
| **Management Layer** | GestPro must handle users, teams, projects, and hierarchical tasks natively. | UI includes Dashboard, Projects List, Project Kanban, Teams List, and Admin Panel. |
| **Product Rule** | Do not allow cross-team data leakage. | A Lead in Team A cannot see Team B's projects unless they are also a member of Team B. |

## 2. Authentication and User Management
| Feature / Area | Requirements | Functionalities / Flow |
| :--- | :--- | :--- |
| **Login** | Users authenticate via email and password. | JWT-based authentication. Sessions are managed securely. |
| **Admin Provisioning** | Only Admins can create new user accounts in the system. | Admin defines Name, Email, and Global Role (Admin, Lead, Dev) at creation. |
| **Welcome Flow** | Newly created users receive an automated email with their credentials. | Welcome email contains a direct link to the platform and the assigned password. |

## 3. Roles and Permissions (RBAC)
GestPro enforces strict access control to prevent unauthorized modifications to project scopes.

| Role | Requirements | Functionalities / Flow |
| :--- | :--- | :--- |
| **Admin** | Global system access. | Can manage all users, create all teams, view all projects across the platform, and bypass team-isolation rules. |
| **Lead** | Team manager & Project Owner. | Can create projects for their assigned teams, create tasks, assign tasks to devs, import task hierarchies, and edit project details. |
| **Dev (Developer)**| Restricted execution role. | Can view projects belonging to their team. **Cannot** create tasks, edit task details, or modify projects. Can **only** change the status (To Do ➔ Done) of tasks specifically assigned to them. |

## 4. Team and Workspace Management
| Feature / Area | Requirements | Functionalities / Flow |
| :--- | :--- | :--- |
| **Team Creation** | Admin and Leads can create teams. | A team requires a Name and an optional Description. |
| **Member Management** | Leads manage their team's roster. | Leads can add existing users to their team and assign them a contextual role within that team (Lead or Dev). |
| **Multi-Team Support** | A user can belong to multiple teams simultaneously. | The UI aggregates projects from all teams the user belongs to, respecting their specific role in each team. |

## 5. Project Management
| Feature / Area | Requirements | Functionalities / Flow |
| :--- | :--- | :--- |
| **Project Creation** | Projects must be linked to a specific Team upon creation. | Lead clicks "New Project", fills title/description/dates, and selects the owning Team. |
| **Project Visibility** | Projects are only visible to the members of the owning Team and Admins. | Enforced by the backend checking the user's `teams` array against the project's `teamId`. |
| **Project States** | Projects have lifecycle statuses. | Planning, Active, Completed, On Hold. |

## 6. Task Management & Workflows
| Feature / Area | Requirements | Functionalities / Flow |
| :--- | :--- | :--- |
| **Hierarchical Structure**| Tasks must support 3 levels: Epic ➔ Task ➔ Sub-task. | Parent-child relationship enforced in the database. Deleting a parent deletes its children. |
| **Task Creation** | Only Leads and Admins can create tasks. | Form collects Title, Description, Due Date, Assignee, and Parent Task. Devs see the "New Task" button grayed out or hidden. |
| **Task Assignment** | Tasks can be assigned to a specific user within the team. | Dropdown only shows users belonging to the project's owning team. |
| **Kanban Workflow** | Tasks progress through statuses: To Do, In Progress, Review, Done. | Drag-and-drop interface. Devs can only drag their *own* assigned tasks. Leads can drag any task. |

## 7. Bulk Import Feature
| Feature / Area | Requirements | Functionalities / Flow |
| :--- | :--- | :--- |
| **Text-Based Import** | Leads must be able to paste a text hierarchy to generate tasks instantly. | Dash (`-`) indicates level: No dash = Epic, `-` = Task, `--` = Sub-task. |
| **Automation** | System parses the text and automatically handles parent-child ID linking. | Tasks are created sequentially. If an error occurs (e.g., unauthorized), the import stops and displays an error banner. |

## 8. Security & Access Rules
| Feature / Area | Requirements | Functionalities / Flow |
| :--- | :--- | :--- |
| **API Protection** | All API endpoints must verify JWT and contextual authorization. | `assertLeadCanWriteProject` middleware ensures that only users who are "Lead" in the project's owning team can execute POST/PUT/DELETE requests. |
| **Graceful Rejection**| The UI must catch API 403 (Forbidden) errors and display them properly. | Modals display a red warning banner instead of failing silently if a restricted user bypasses frontend checks. |
| **Data Integrity** | Updating a user profile must not overwrite their team memberships. | `userService.update` handles name/password/role, while team arrays are strictly managed via `/teams/:id/members`. |

## 9. Core Data to Store
| Collection | Requirements | Functionalities / Flow |
| :--- | :--- | :--- |
| **Users** | ID, Name, Email, Password Hash, Global Role, Teams Array `[{teamId, role}]` | Central authentication and RBAC resolution. |
| **Teams** | ID, Name, Description | Logical boundary for access control. |
| **Projects** | ID, Title, Description, Status, `teamId` (Owner) | High-level containers for tasks. |
| **Tasks** | ID, Title, Description, Status, `projectId`, `parentId` (hierarchy), `assignedTo` | Granular units of work. |

## 10. Main User Journeys

**Lead Journey: Project Setup & Delegation**
1. Lead logs into GestPro.
2. Navigates to Teams ➔ Creates "Frontend Team" ➔ Adds Devs A and B.
3. Navigates to Projects ➔ Creates "Website Overhaul" ➔ Assigns to "Frontend Team".
4. Opens Project ➔ Clicks "Import Tasks" ➔ Pastes a hierarchy of Epics and Tasks.
5. Edits the generated tasks to assign specific tasks to Dev A and Dev B.
6. Monitors overall progress on the Kanban board.

**Dev Journey: Daily Execution**
1. Dev A logs into GestPro.
2. Navigates to Projects ➔ Sees "Website Overhaul" (because they are in Frontend Team).
3. Opens Project ➔ "New Task" button is hidden/disabled.
4. Goes to Kanban Board ➔ Sees all tasks, but can only drag tasks assigned to "Dev A".
5. Drags a task from "To Do" to "In Progress".

## 11. Summary of Developer Rules (Backend & UI Implementation)
*   **Never trust the UI:** Always re-verify the user's role *within the specific team* on the backend before writing to the database.
*   **Team Isolation First:** All project queries must include `{ teamId: { $in: userTeamIds } }` unless the user is a global Admin.
*   **Error Bubbling:** Frontend API calls (`createTask`, `updateTask`) must check `res.ok`. If false, the UI must display `res.data.message` (e.g., in a red banner inside the modal) rather than closing the modal silently.
*   **Mongoose Warning Prevention:** Use `{ returnDocument: 'after' }` instead of `{ new: true }` to avoid deprecation warnings.
*   **Team Membership Source of Truth:** Never mutate the `teams` array from the general user profile update route. Use dedicated endpoints for adding/removing members from a team.
