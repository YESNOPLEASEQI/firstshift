/* eslint-disable react-refresh/only-export-components */
import React from "react";
import type { RouteObject } from "react-router-dom";
import EmployeeLayout from "./components/EmployeeLayout";
import CoachLayout from "./coach/CoachLayout";

const Home = React.lazy(() => import("./pages/employee/Home"));
const Jobs = React.lazy(() => import("./pages/employee/Jobs"));
const JobDetail = React.lazy(() => import("./pages/employee/JobDetail"));
const PracticeIndex = React.lazy(() => import("./pages/employee/PracticeIndex"));
const SimulationList = React.lazy(() => import("./pages/employee/SimulationList"));
const PracticePrep = React.lazy(() => import("./pages/employee/PracticePrep"));
const Practice = React.lazy(() => import("./pages/employee/Practice"));
const PracticeFeedback = React.lazy(() => import("./pages/employee/PracticeFeedback"));
const Passport = React.lazy(() => import("./pages/employee/Passport"));
const PassportEdit = React.lazy(() => import("./pages/employee/PassportEdit"));
const PassportShare = React.lazy(() => import("./pages/employee/PassportShare"));
const Work = React.lazy(() => import("./pages/employee/Work"));
const WorkTask = React.lazy(() => import("./pages/employee/WorkTask"));
const WorkGuides = React.lazy(() => import("./pages/employee/WorkGuides"));
const WorkChanges = React.lazy(() => import("./pages/employee/WorkChanges"));
const WorkChange = React.lazy(() => import("./pages/employee/WorkChange"));
const WorkContacts = React.lazy(() => import("./pages/employee/WorkContacts"));
const WorkContact = React.lazy(() => import("./pages/employee/WorkContact"));
const HelpRequest = React.lazy(() => import("./pages/employee/HelpRequest"));
const HelpRequests = React.lazy(() => import("./pages/employee/HelpRequests"));
const HelpRequestDetail = React.lazy(() => import("./pages/employee/HelpRequestDetail"));
const Settings = React.lazy(() => import("./pages/employee/Settings"));
const SettingsDetail = React.lazy(() => import("./pages/employee/SettingsDetail"));
const NotFound = React.lazy(() => import("./pages/employee/NotFound"));

const CoachDashboard = React.lazy(() => import("./pages/coach/Dashboard"));
const CoachTasks = React.lazy(() => import("./pages/coach/Tasks"));
const CoachEditor = React.lazy(() => import("./pages/coach/Editor"));
const CoachReviews = React.lazy(() => import("./pages/coach/Reviews"));
const CoachReviewDetail = React.lazy(() => import("./pages/coach/ReviewDetail"));
const CoachRequests = React.lazy(() => import("./pages/coach/Requests"));
const CoachAccess = React.lazy(() => import("./pages/coach/Access"));

// Employee-facing demo. No auth guard by design; all data is local synthetic demo data.
const firstshiftRoute: RouteObject = {
  path: "/firstshift",
  Component: EmployeeLayout,
  children: [
    { index: true, Component: Home },
    { path: "jobs", Component: Jobs },
    { path: "jobs/:jobId", Component: JobDetail },
    { path: "practice", Component: PracticeIndex },
    { path: "practice/new", Component: SimulationList },
    { path: "practice/new/:taskId", Component: PracticePrep },
    { path: "practice/:taskId", Component: Practice },
    { path: "practice/:taskId/feedback", Component: PracticeFeedback },
    { path: "passport", Component: Passport },
    { path: "passport/edit", Component: PassportEdit },
    { path: "passport/share", Component: PassportShare },
    { path: "passport/share/preview", Component: PassportShare },
    { path: "passport/share/history", Component: PassportShare },
    { path: "work", Component: Work },
    { path: "work/guides", Component: WorkGuides },
    { path: "work/changes", Component: WorkChanges },
    { path: "work/changes/:changeId", Component: WorkChange },
    { path: "work/contacts", Component: WorkContacts },
    { path: "work/contacts/:contactId", Component: WorkContact },
    { path: "work/:taskId", Component: WorkTask },
    { path: "help/request", Component: HelpRequest },
    { path: "help/requests", Component: HelpRequests },
    { path: "help/requests/:requestId", Component: HelpRequestDetail },
    { path: "settings", Component: Settings },
    { path: "settings/font", Component: SettingsDetail },
    { path: "settings/help", Component: SettingsDetail },
    { path: "settings/privacy", Component: SettingsDetail },
    { path: "settings/data", Component: SettingsDetail },
    { path: "settings/data/clear", Component: SettingsDetail },
    { path: "settings/about", Component: SettingsDetail },
    { path: "*", Component: NotFound },
  ],
};

// Coach-side demo shares the same local data set. Also no auth guard.
const coachRoute: RouteObject = {
  path: "/firstshift/coach",
  Component: CoachLayout,
  children: [
    { index: true, Component: CoachDashboard },
    { path: "tasks", Component: CoachTasks },
    { path: "editor", Component: CoachEditor },
    { path: "editor/:taskId", Component: CoachEditor },
    { path: "reviews", Component: CoachReviews },
    { path: "reviews/:taskId", Component: CoachReviewDetail },
    { path: "requests", Component: CoachRequests },
    { path: "access", Component: CoachAccess },
    { path: "*", Component: NotFound },
  ],
};

// One pathless wrapper keeps the shared Router.tsx untouched.
const firstshiftRoutes: RouteObject = { children: [coachRoute, firstshiftRoute] };

export default firstshiftRoutes;
