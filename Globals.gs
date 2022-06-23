const DATA_SHEET = "Shared Tasks (Inbox)";
const CONFIG_SHEET = "Configurations";
const TASK_KEY_MAPPING_SHEET = "Task Key Mapping";
const QUOTE_SHEET = "Productivity Quotes";
const TEMPLATE_SHEET = "EmailTemplate";

//
const TASK_KEY = Object.freeze({
  SCHEDULED: "scheduled",
  TASK_NAME: "taskname",
  OWNER_ID: "ownerid",
  STATUS: "status",
  PAGE_ID: "pageid",
  PROJECT_NAME: "projectname",
  PROJECT: "project",
  DEADLINE_START: "deadlinestart",
  CREATED_BY: "createdby",
  AGE: "age",
  NEXT_STEP: "nextstep"
});

const TASK_VALUE = Object.freeze({
  COMPLETED: "Completed",
  CANCELLED: "Cancelled"
});

const REPORT_TYPE = Object.freeze({
  TODAYS_TASKS: "todaysTasks",
  YESTERDAYS_COMPLETED_TASKS: "yesterdaysCompletedTasks",
  YESTERDAYS_INCOMPLETE_TASKS: "yesterdaysIncompleteTasks",
  UNSCHEDULED_TASKS: "unscheduledTasks",

  INCOMPLETE_TASKS: "incompleteTasks",
  OWNERLESS_TASKS: "ownerlessTasks"
});