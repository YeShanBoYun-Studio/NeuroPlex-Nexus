/**
 * Common type definitions for the application
 */

// UUID type alias
export type UUID = string;

// API related types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

/**
 * Get all possible nested keys of an object type with dot notation
 * Example: { a: { b: { c: string } } } -> 'a' | 'a.b' | 'a.b.c'
 */
export type DeepKeyOf<T> = T extends Record<string, any>
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends Record<string, any>
          ? `${K}` | `${K}.${DeepKeyOf<T[K]>}`
          : `${K}`
        : never;
    }[keyof T]
  : never;

/**
 * Get the value type at a specific path in an object type
 * Example: ValueAtPath<{ a: { b: string } }, ['a', 'b']> -> string
 */
export type ValueAtPath<T, P extends string[]> = P extends [infer First, ...infer Rest]
  ? First extends keyof T
    ? Rest extends string[]
      ? ValueAtPath<T[First], Rest>
      : never
    : never
  : T;

/**
 * Split a dot-notation path into tuple type
 * Example: 'a.b.c' -> ['a', 'b', 'c']
 */
export type Split<S extends string> = S extends `${infer First}.${infer Rest}`
  ? [First, ...Split<Rest>]
  : [S];

/**
 * Get type of a nested property using dot notation
 * Example: NestedValue<{ a: { b: string } }, 'a.b'> -> string
 */
export type NestedValue<T, P extends string> = ValueAtPath<T, Split<P>>;

/**
 * Make specific properties required in a type
 */
export type RequiredProps<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific properties optional in a type
 */
export type OptionalProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Type safe record with specific keys
 */
export type SafeRecord<K extends string | number | symbol, T> = { [P in K]: T };

/**
 * Extract keys of specific value type
 */
export type KeysOfType<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T];

/**
 * Make all properties deeply required
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: DeepRequired<T[P]>;
};

/**
 * Make all properties deeply optional
 */
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

/**
 * Type for pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Type for sort parameters
 */
export interface SortParams {
  sortBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Type for filter parameters
 */
export interface FilterParams {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Base query parameters type
 */
export type QueryParams = PaginationParams & SortParams & FilterParams;

/**
 * Error status types
 */
export type ErrorStatus = 'error' | 'warning' | 'info' | 'success';

/**
 * Loading state type
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Theme mode type
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Role type
 */
export type UserRole = 'admin' | 'user' | 'guest';

/**
 * Permission type
 */
export type Permission = 'read' | 'write' | 'delete' | 'manage';
