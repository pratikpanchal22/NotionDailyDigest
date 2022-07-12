const DATA_SHEET = "Shared Tasks (Inbox)";

const CONFIG_SHEET = "Configurations";
// const CONFIG_SHEET = "Dev_Configurations";

const TASK_KEY_MAPPING_SHEET = "Task Key Mapping";
const QUOTE_SHEET = "Productivity Quotes";
const TEMPLATE_SHEET = "EmailTemplate";

//
const TASK_KEY = Object.freeze({
  SCHEDULED: "scheduled",
  SCHEDULED_END: "scheduledend",
  TASK_NAME: "taskname",
  SUMMARY: 'summary',
  OWNER_ID: "ownerid",
  STATUS: "status",
  PAGE_ID: "pageid",
  PROJECT_NAME: "projectname",
  PROJECT: "project",
  DEADLINE_START: "deadlinestart",
  CREATED_BY: "createdby",
  AGE: "age",
  NEXT_STEP: "nextstep",
  CREATED: "created",
  AUTO_CREATE_GCAL_EVENT: 'autocreategooglecalevent',
  GCAL_EVENT_LINK: 'googlecaleventlink'
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