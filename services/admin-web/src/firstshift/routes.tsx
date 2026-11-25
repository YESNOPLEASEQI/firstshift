/* eslint-disable react-refresh/only-export-components */
import React from "react";
import type { RouteObject } from "react-router-dom";
import EmployeeLayout from "./components/EmployeeLayout";

const Home = React.lazy(() => import("./pages/employee/Home"));
const Jobs = React.lazy(() => import("./pages/employee/Jobs"));
const JobDetail = React.lazy(() => import("./pages/employee/JobDetail"));
const PracticePrep = React.lazy(() => import("./pages/employee/PracticePrep"));
const Practice = React.lazy(() => import("./pages/employee/Practice"));
const PracticeFeedback = React.lazy(() => import("./pages/employee/PracticeFeedback"));
const Passport = React.lazy(() => import("./pages/employee/Passport"));
const PassportEdit = React.lazy(() => import("./pages/employee/PassportEdit"));
const PassportShare = React.lazy(() => import("./pages/employee/PassportShare"));
const Work = React.lazy(() => import("./pages/employee/Work"));
const WorkTask = React.lazy(() => import("./pages/employee/WorkTask"));
const WorkChange = React.lazy(() => import("./pages/employee/WorkChange"));
const HelpRequest = React.lazy(() => import("./pages/employee/HelpRequest"));
const HelpRequests = React.lazy(() => import("./pages/employee/HelpRequests"));
const Settings = React.lazy(() => import("./pages/employee/Settings"));
const NotFound = React.lazy(() => import("./pages/employee/NotFound"));

// Employee-facing demo. No auth guard by design; all data is local synthetic demo data.
const firstshiftRoute: RouteObject = {
  path: "/firstshift",
  Component: EmployeeLayout,
  children: [
    { index: true, Component: Home },
    { path: "jobs", Component: Jobs },
    { path: "jobs/:jobId", Component: JobDetail },
    { path: "practice", Component: PracticePrep },
    { path: "practice/:taskId", Component: Practice },
    { path: "practice/:taskId/feedback", Component: PracticeFeedback },
    { path: "passport", Component: Passport },
    { path: "passport/edit", Component: PassportEdit },
    { path: "passport/share", Component: PassportShare },
    { path: "work", Component: Work },
    { path: "work/changes/:changeId", Component: WorkChange },
    { path: "work/:taskId", Component: WorkTask },
    { path: "help/request", Component: HelpRequest },
    { path: "help/requests", Component: HelpRequests },
    { path: "settings", Component: Settings },
    { path: "*", Component: NotFound },
  ],
};

export default firstshiftRoute;
