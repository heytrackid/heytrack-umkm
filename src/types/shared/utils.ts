

/**
 * Utility Types
 * Provides helper types for common TypeScript patterns
 */

/**
 * Make all properties required and non-nullable
 * @template T - The type to make required and non-null
 */
export type RequiredNonNull<T> = {
    [P in keyof T]-?: NonNullable<T[P]>;
};

/**
 * Extract the return type of an async function
 * @template T - The async function type
 */
export type AsyncReturnType<T extends (..._args: unknown[]) => Promise<unknown>> =
    T extends (..._args: unknown[]) => Promise<infer R> ? R : never;

/**
 * Get keys of T that have values of type U
 * @template T - The object type
 * @template U - The value type to filter by
 */
export type KeysOfType<T, U> = {
    [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Strict Omit that ensures keys exist in T
 * @template T - The object type
 * @template K - The keys to omit (must exist in T)
 */
export type StrictOmit<T, K extends keyof T> = Omit<T, K>;

/**
 * Strict Pick that ensures keys exist in T
 * @template T - The object type
 * @template K - The keys to pick (must exist in T)
 */
export type StrictPick<T, K extends keyof T> = Pick<T, K>;

/**
 * Make specific properties optional
 * @template T - The object type
 * @template K - The keys to make optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 * @template T - The object type
 * @template K - The keys to make required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Deep partial - makes all nested properties optional
 * @template T - The object type
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep readonly - makes all nested properties readonly
 * @template T - The object type
 */
export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Type guard function type
 * @template T - The type to guard for
 */
export type TypeGuard<T> = (value: unknown) => value is T;

/**
 * Type assertion function type
 * @template T - The type to assert
 */
export type TypeAssertion<T> = (value: unknown) => asserts value is T;

/**
 * Extract non-nullable keys from an object type
 * @template T - The object type
 */
export type NonNullableKeys<T> = {
    [K in keyof T]: null extends T[K] ? never : K;
}[keyof T];

/**
 * Extract nullable keys from an object type
 * @template T - The object type
 */
export type NullableKeys<T> = {
    [K in keyof T]: null extends T[K] ? K : never;
}[keyof T];

/**
 * Unwrap a Promise type
 * @template T - The Promise type
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Make a type mutable (remove readonly)
 * @template T - The type to make mutable
 */
export type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};

/**
 * Get the value type of an object or array
 * @template T - The object or array type
 */
export type ValueOf<T> = T extends readonly unknown[] ? T[number] : T[keyof T];

/**
 * Ensure at least one property is present
 * @template T - The object type
 */
export type AtLeastOne<T> = {
    [K in keyof T]: Partial<Omit<T, K>> & Pick<T, K>;
}[keyof T];

/**
 * Ensure exactly one property is present
 * @template T - The object type
 */
export type ExactlyOne<T> = {
    [K in keyof T]: Partial<Record<Exclude<keyof T, K>, never>> & Pick<T, K>;
}[keyof T];
