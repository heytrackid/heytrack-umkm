/**
 * Type Guards and Assertions
 * Provides runtime type checking functions
 */

import type { ApiError, ApiResponse } from './api';
import type {
    Customer,
    HppSnapshot,
    Ingredient,
    IngredientPurchase,
    Order,
    OrderItem,
    OrderStatus,
    PaymentStatus,
    Recipe,
    RecipeIngredient,
    Supplier,
    UserProfile,
} from './database';

/**
 * Check if a value is a non-null object
 */
function isObject(value: any): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Check if a value has a specific property
 */
function hasProperty<K extends string>(
    value: any,
    key: K
): value is Record<K, unknown> {
    return isObject(value) && key in value;
}

/**
 * Type guard for OrderStatus
 */
export function isOrderStatus(value: any): value is OrderStatus {
    return (
        typeof value === 'string' &&
        ['pending', 'processing', 'completed', 'cancelled'].includes(value)
    );
}

/**
 * Type guard for PaymentStatus
 */
export function isPaymentStatus(value: any): value is PaymentStatus {
    return (
        typeof value === 'string' &&
        ['unpaid', 'partial', 'paid'].includes(value)
    );
}

/**
 * Type guard for Ingredient
 */
export function isIngredient(value: any): value is Ingredient {
    return (
        isObject(value) &&
        typeof value.id === 'string' &&
        typeof value.name === 'string' &&
        typeof value.unit === 'string' &&
        typeof value.current_stock === 'number' &&
        typeof value.min_stock === 'number' &&
        typeof value.price_per_unit === 'number' &&
        typeof value.user_id === 'string'
    );
}

/**
 * Type assertion for Ingredient
 */
export function assertIngredient(value: any): asserts value is Ingredient {
    if (!isIngredient(value)) {
        throw new TypeError('Invalid ingredient data');
    }
}

/**
 * Type guard for Recipe
 */
export function isRecipe(value: any): value is Recipe {
    return (
        isObject(value) &&
        typeof value.id === 'string' &&
        typeof value.name === 'string' &&
        typeof value.selling_price === 'number' &&
        typeof value.user_id === 'string'
    );
}

/**
 * Type assertion for Recipe
 */
export function assertRecipe(value: any): asserts value is Recipe {
    if (!isRecipe(value)) {
        throw new TypeError('Invalid recipe data');
    }
}

/**
 * Type guard for Order
 */
export function isOrder(value: any): value is Order {
    return (
        isObject(value) &&
        typeof value.id === 'string' &&
        typeof value.order_date === 'string' &&
        typeof value.total_amount === 'number' &&
        isOrderStatus(value.status) &&
        isPaymentStatus(value.payment_status) &&
        typeof value.user_id === 'string'
    );
}

/**
 * Type assertion for Order
 */
export function assertOrder(value: any): asserts value is Order {
    if (!isOrder(value)) {
        throw new TypeError('Invalid order data');
    }
}

/**
 * Type guard for Customer
 */
export function isCustomer(value: any): value is Customer {
    return (
        isObject(value) &&
        typeof value.id === 'string' &&
        typeof value.name === 'string' &&
        typeof value.user_id === 'string'
    );
}

/**
 * Type assertion for Customer
 */
export function assertCustomer(value: any): asserts value is Customer {
    if (!isCustomer(value)) {
        throw new TypeError('Invalid customer data');
    }
}

/**
 * Type guard for Supplier
 */
export function isSupplier(value: any): value is Supplier {
    return (
        isObject(value) &&
        typeof value.id === 'string' &&
        typeof value.name === 'string' &&
        typeof value.user_id === 'string'
    );
}

/**
 * Type assertion for Supplier
 */
export function assertSupplier(value: any): asserts value is Supplier {
    if (!isSupplier(value)) {
        throw new TypeError('Invalid supplier data');
    }
}

/**
 * Type guard for OrderItem
 */
export function isOrderItem(value: any): value is OrderItem {
    return (
        isObject(value) &&
        typeof value.id === 'string' &&
        typeof value.order_id === 'string' &&
        typeof value.recipe_id === 'string' &&
        typeof value.quantity === 'number' &&
        typeof value.unit_price === 'number' &&
        typeof value.subtotal === 'number'
    );
}

/**
 * Type guard for RecipeIngredient
 */
export function isRecipeIngredient(value: any): value is RecipeIngredient {
    return (
        isObject(value) &&
        typeof value.id === 'string' &&
        typeof value.recipe_id === 'string' &&
        typeof value.ingredient_id === 'string' &&
        typeof value.quantity === 'number' &&
        typeof value.unit === 'string'
    );
}

/**
 * Type guard for IngredientPurchase
 */
export function isIngredientPurchase(value: any): value is IngredientPurchase {
    return (
        isObject(value) &&
        typeof value.id === 'string' &&
        typeof value.ingredient_id === 'string' &&
        typeof value.quantity === 'number' &&
        typeof value.unit_price === 'number' &&
        typeof value.total_cost === 'number' &&
        typeof value.purchase_date === 'string' &&
        typeof value.user_id === 'string'
    );
}

/**
 * Type guard for HppSnapshot
 */
export function isHppSnapshot(value: any): value is HppSnapshot {
    return (
        isObject(value) &&
        typeof value.id === 'string' &&
        typeof value.recipe_id === 'string' &&
        typeof value.snapshot_date === 'string' &&
        typeof value.hpp_value === 'number' &&
        isObject(value.cost_breakdown) &&
        typeof value.user_id === 'string'
    );
}

/**
 * Type guard for UserProfile
 */
export function isUserProfile(value: any): value is UserProfile {
    return (
        isObject(value) &&
        typeof value.id === 'string' &&
        typeof value.user_id === 'string'
    );
}

/**
 * Type guard for ApiError
 */
export function isApiError(value: any): value is ApiError {
    return (
        isObject(value) &&
        typeof value.code === 'string' &&
        typeof value.message === 'string'
    );
}

/**
 * Type guard for ApiResponse
 */
export function isApiResponse<T>(
    value: any,
    dataGuard?: (data: any) => data is T
): value is ApiResponse<T> {
    if (!isObject(value) || typeof value.success !== 'boolean') {
        return false;
    }

    if (value.error !== null && !isApiError(value.error)) {
        return false;
    }

    if (dataGuard && value.data !== null && !dataGuard(value.data)) {
        return false;
    }

    return true;
}

/**
 * Type guard for arrays
 */
export function isArrayOf<T>(
    value: any,
    itemGuard: (item: any) => item is T
): value is T[] {
    return Array.isArray(value) && value.every(itemGuard);
}

/**
 * Type assertion for arrays
 */
export function assertArrayOf<T>(
    value: any,
    itemGuard: (item: any) => item is T,
    errorMessage = 'Invalid array data'
): asserts value is T[] {
    if (!isArrayOf(value, itemGuard)) {
        throw new TypeError(errorMessage);
    }
}

/**
 * Type guard for non-null values
 */
export function isNonNull<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

/**
 * Type assertion for non-null values
 */
export function assertNonNull<T>(
    value: T | null | undefined,
    errorMessage = 'Value is null or undefined'
): asserts value is T {
    if (!isNonNull(value)) {
        throw new TypeError(errorMessage);
    }
}

/**
 * Type guard for string values
 */
export function isString(value: any): value is string {
    return typeof value === 'string';
}

/**
 * Type guard for number values
 */
export function isNumber(value: any): value is number {
    return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard for boolean values
 */
export function isBoolean(value: any): value is boolean {
    return typeof value === 'boolean';
}

/**
 * Type guard for Record<string, unknown>
 */
export function isRecord(value: any): value is Record<string, unknown> {
    return isObject(value);
}
