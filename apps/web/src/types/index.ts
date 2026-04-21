/**
 * Common Type Definitions for the Application
 */

/**
 * API Response Type
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  error?: string;
}

/**
 * Pagination Types
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Filter Types
 */
export interface FilterOption {
  label: string;
  value: string | number;
}

export interface Filter {
  key: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
}

/**
 * Sort Types
 */
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * Request Status Types
 */
export type RequestStatus = 'idle' | 'pending' | 'success' | 'error';

export interface RequestState<T> {
  data: T | null;
  status: RequestStatus;
  error: Error | null;
}

/**
 * Form Types
 */
export interface FormError {
  field: string;
  message: string;
}

export interface FormState<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
}

/**
 * Entity Types
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Types
 */
export interface User extends BaseEntity {
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  avatar?: string;
}

/**
 * Table Column Types
 */
export interface ColumnDef<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

/**
 * Menu Item Types
 */
export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  children?: MenuItem[];
  divider?: boolean;
}

/**
 * Breadcrumb Types
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Tab Types
 */
export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

/**
 * Step Types (for Stepper/Wizard)
 */
export interface Step {
  id: string;
  label: string;
  description?: string;
  completed?: boolean;
  error?: string;
}
