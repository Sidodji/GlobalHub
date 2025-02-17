import { getEnvVar } from '../config/environmentVariables';

export const API_GATEWAY_BASE = getEnvVar('API_GATEWAY_URL', process.env.API_GATEWAY_URL);

// API Suffixes
export const NOTES_API_SUFFIX = 'notes-api';
export const BUDGETS_API_SUFFIX = 'budgets-api';
export const NOTIFICATIONS_API_SUFFIX = 'notifications-api';
export const PROJECTS_API_SUFFIX = 'projects-api';
export const PROJECTS_ODATA_API_SUFFIX = 'projects-api/odata';
export const IDENTITY_API_SUFFIX = 'identity-api';

// Constants related to notes
export const CREATE_NOTE = '/Notes/CreateNote';
export const GET_NOTE_BY_ID = '/Notes/GetNoteById';
export const UPDATE_NOTE_TITLE = '/Notes/UpdateNoteTitle';
export const UPDATE_NOTE_CONTENT = '/Notes/UpdateNoteContent';
export const GET_NOTES_MAP = '/Notes/GetNoteMap';
export const GET_NOTES_LIST = '/Notes/GetNoteList';
export const DELETE_NOTE = '/Notes/DeleteNote';

// Constants related to budgets
export const GET_BUDGETS_MAP = '/Budget/GetBudgetsMap';
export const GET_BUDGET_BY_ID = '/Budget/GetBudgetById';
export const CREATE_BUDGET = '/Budget/CreateNewBudget';
export const GET_BUDGETS_ANALYTIC_FOR_CURRENT_MONTH = '/Budget/GetBudgetAnalyticForDateRange';
export const DELETE_BUDGET_BY_ID = '/Budget/DeleteBudgetById';
export const UPDATE_BUDGET_TITLE = '/Budget/UpdateBudgetTitle';
export const UPDATE_BUDGET_DESCRIPTION = '/Budget/UpdateBudgetDescription';
export const UPDATE_BUDGET_PRESERVE_PERCENT = '/Budget/UpdateBudgetPreservePercent';

// Constants related to budget items
export const GET_BUDGET_ITEMS_BY_BUDGET_ID = '/BudgetItem/GetBudgetItemsByBudgetId';
export const CREATE_BUDGET_ITEM = '/BudgetItem/CreateBudgetItem';
export const UPDATE_BUDGET_ITEM = '/BudgetItem/UpdateBudgetItem';
export const DELETE_BUDGET_ITEM_BY_ID = '/BudgetItem/DeleteBudgetItem';
export const GET_EXPENSES_SUM_GROUPED_BY_TAGS = '/BudgetItem/GetCurrentMonthExpensesSumsGroupedByTags';
export const GET_BUDGET_ITEMS_BY_ID_AND_RANGE = '/BudgetItem/GetBudgetItemsByIdAndRange';

// Constants related to tags
export const GET_BUDGET_TAGS_BY_ID = '/Tag/GetBudgetTagsByBudgetId';
export const CREATE_TAG = '/Tag/CreateNewTag';
export const UPDATE_TAG = '/Tag/UpdateTag';
export const DELETE_TAG = '/Tag/DeleteTag';

// Constants related to tag limits
export const GET_TAG_LIMITS = '/TagLimits/GetTagLimits';
export const UPDATE_BUDGET_TAG_LIMITS = '/TagLimits/UpdateBudgetTagLimits';

// Constants related to projects
export const GET_USER_PROJECTS = '/Projects';
export const CREATE_PROJECT = '/Projects/Create';
export const RENAME_PROJECT = '/Projects/UpdateTitle';
export const DELETE_PROJECT = '/Projects/Delete';

// Constants related to project items
export const GET_PROJECT_ITEMS = '/ProjectItems';
export const CREATE_PROJECT_TASK = '/ProjectItems/CreateProjectTask';
export const CREATE_PROJECT_EVENT = '/ProjectItems/CreateProjectEvent';
export const UPDATE_PROJECT_ITEMS = '/ProjectItems/UpdateProjectItem';
export const DELETE_PROJECT_ITEMS = '/ProjectItems/DeleteProjectItems';

// Constants related to project tags
export const CREATE_PROJECT_TAG = '/Tags/Create';
export const UPDATE_PROJECT_TAG = '/Tags/Update';
export const DELETE_PROJECT_TAG = '/Tags/Delete';

// Constants related to notifications
export const GET_USER_NOTIFICATIONS = '/Notifications/GetUserNotifications';
