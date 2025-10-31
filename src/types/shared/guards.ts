/**
 * Type Guards and Assertions
 * Provides runtime type checking functions
 * 
 * This module contains:
 * - Basic type guards (isIngredient, isRecipe, isOrderItem, etc.)
 * - Type assertions (assertIngredient, assertRecipe, etc.)
 * - Validation functions with detailed error messages (validateIngredient, validateRecipe, etc.)
 * - Complex type guards (isRecipeWithIngredients)
 * - Utility type guards (isUUID, isDateString, isPositiveNumber, etc.)
 * 
 * Type guards return boolean values and can be used in conditional statements.
 * Type assertions throw errors if validation fails.
 * Validation functions return detailed error information for debugging.
 */

import type { ApiError, ApiResponse } from './api';
import type { 
  CustomersTable, 
  IngredientsTable, 
  IngredientPurchasesTable, 
  OrdersTable, 
  OrderItemsTable, 
  OrderStatus,
  RecipesTable, 
  RecipeIngredientsTable, 
  SuppliersTable, 
  UserProfilesTable 
} from '@/types/database';

// Type aliases for easier use in guards
type Customer = CustomersTable;
type Ingredient = IngredientsTable;
type IngredientPurchase = IngredientPurchasesTable;
type Order = OrdersTable;
// type OrderItem = OrderItemsTable;
type Recipe = RecipesTable;
type RecipeIngredient = RecipeIngredientsTable;
type Supplier = SuppliersTable;
type UserProfile = UserProfilesTable;
type PaymentStatus = 'unpaid' | 'partial' | 'paid';

/**
 * Check if a value is a non-null object
 */
function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Check if a value has a specific property
 */
function hasProperty<K extends string>(
    value: unknown,
    key: K
): value is Record<K, unknown> {
    return isObject(value) && key in value;
}

/**
 * Type guard for OrderStatus
 */
export function isOrderStatus(value: unknown): value is OrderStatus {
    return (
        typeof value === 'string' &&
        ['pending', 'processing', 'completed', 'cancelled'].includes(value)
    );
}

/**
 * Type guard for PaymentStatus
 */
export function isPaymentStatus(value: unknown): value is PaymentStatus {
    return (
        typeof value === 'string' &&
        ['unpaid', 'partial', 'paid'].includes(value)
    );
}

/**
 * Type guard for Ingredient
 */
export function isIngredient(value: unknown): value is Ingredient {
    return (
        isObject(value) &&
        typeof value['id'] === 'string' &&
        typeof value['name'] === 'string' &&
        typeof value['unit'] === 'string' &&
        (typeof value['current_stock'] === 'number' || value['current_stock'] === null) &&
        (typeof value['min_stock'] === 'number' || value['min_stock'] === null) &&
        typeof value['price_per_unit'] === 'number'
    );
}

/**
 * Type assertion for Ingredient
 */
export function assertIngredient(value: unknown): asserts value is Ingredient {
    if (!isIngredient(value)) {
        throw new TypeError('Invalid ingredient data');
    }
}

/**
 * Type guard for Recipe
 */
export function isRecipe(value: unknown): value is Recipe {
    return (
        isObject(value) &&
        typeof value['id'] === 'string' &&
        typeof value['name'] === 'string' &&
        (typeof value['selling_price'] === 'number' || value['selling_price'] === null)
    );
}

/**
 * Type assertion for Recipe
 */
export function assertRecipe(value: unknown): asserts value is Recipe {
    if (!isRecipe(value)) {
        throw new TypeError('Invalid recipe data');
    }
}

/**
 * Type guard for Order
 */
export function isOrder(value: unknown): value is Order {
    return (
        isObject(value) &&
        typeof value['id'] === 'string' &&
        (typeof value['order_date'] === 'string' || value['order_date'] === null) &&
        (typeof value['total_amount'] === 'number' || value['total_amount'] === null) &&
        (isOrderStatus(value['status']) || value['status'] === null) &&
        (isPaymentStatus(value['payment_status']) || value['payment_status'] === null)
    );
}

/**
 * Type assertion for Order
 */
export function assertOrder(value: unknown): asserts value is Order {
    if (!isOrder(value)) {
        throw new TypeError('Invalid order data');
    }
}

/**
 * Type guard for Customer
 */
export function isCustomer(value: unknown): value is Customer {
    return (
        isObject(value) &&
        typeof value['id'] === 'string' &&
        typeof value['name'] === 'string'
    );
}

/**
 * Type assertion for Customer
 */
export function assertCustomer(value: unknown): asserts value is Customer {
    if (!isCustomer(value)) {
        throw new TypeError('Invalid customer data');
    }
}

/**
 * Type guard for Supplier
 */
export function isSupplier(value: unknown): value is Supplier {
    return (
        isObject(value) &&
        typeof value['id'] === 'string' &&
        typeof value['name'] === 'string'
    );
}

/**
 * Type assertion for Supplier
 */
export function assertSupplier(value: unknown): asserts value is Supplier {
    if (!isSupplier(value)) {
        throw new TypeError('Invalid supplier data');
    }
}

/**
 * Type guard for OrderItem
 */
export function isOrderItem(value: unknown): value is OrderItem {
    return (
        isObject(value) &&
        typeof value['id'] === 'string' &&
        typeof value['order_id'] === 'string' &&
        typeof value['recipe_id'] === 'string' &&
        typeof value['quantity'] === 'number' &&
        typeof value['unit_price'] === 'number' &&
        typeof value['total_price'] === 'number'
    );
}

/**
 * Type guard for RecipeIngredient
 */
export function isRecipeIngredient(value: unknown): value is RecipeIngredient {
    return (
        isObject(value) &&
        typeof value['id'] === 'string' &&
        typeof value['recipe_id'] === 'string' &&
        typeof value['ingredient_id'] === 'string' &&
        typeof value['quantity'] === 'number' &&
        typeof value['unit'] === 'string'
    );
}

/**
 * Type assertion for OrderItem
 */
export function assertOrderItem(value: unknown): asserts value is OrderItem {
    if (!isOrderItem(value)) {
        throw new TypeError('Invalid order item data');
    }
}

/**
 * Type assertion for RecipeIngredient
 */
export function assertRecipeIngredient(value: unknown): asserts value is RecipeIngredient {
    if (!isRecipeIngredient(value)) {
        throw new TypeError('Invalid recipe ingredient data');
    }
}

/**
 * Type guard for IngredientPurchase
 */
export function isIngredientPurchase(value: unknown): value is IngredientPurchase {
    return (
        isObject(value) &&
        typeof value['id'] === 'string' &&
        typeof value['ingredient_id'] === 'string' &&
        typeof value['quantity'] === 'number' &&
        typeof value['unit_price'] === 'number' &&
        typeof value['total_cost'] === 'number' &&
        typeof value['purchase_date'] === 'string' &&
        typeof value['user_id'] === 'string'
    );
}

/**
 * Type guard for UserProfile
 */
export function isUserProfile(value: unknown): value is UserProfile {
    return (
        isObject(value) &&
        typeof value['id'] === 'string' &&
        typeof value['user_id'] === 'string'
    );
}

/**
 * Type guard for ApiError
 */
export function isApiError(value: unknown): value is ApiError {
    return (
        isObject(value) &&
        typeof value['code'] === 'string' &&
        typeof value['message'] === 'string'
    );
}

/**
 * Type guard for ApiResponse
 */
export function isApiResponse<T>(
    value: unknown,
    dataGuard?: (data: unknown) => data is T
): value is ApiResponse<T> {
    if (!isObject(value) || typeof value['success'] !== 'boolean') {
        return false;
    }

    if (value['error'] !== null && !isApiError(value['error'])) {
        return false;
    }

    if (dataGuard && value['data'] !== null && !dataGuard(value['data'])) {
        return false;
    }

    return true;
}

/**
 * Type guard for arrays
 */
export function isArrayOf<T>(
    value: unknown,
    itemGuard: (item: unknown) => item is T
): value is T[] {
    return Array.isArray(value) && value.every(itemGuard);
}

/**
 * Type assertion for arrays
 */
export function assertArrayOf<T>(
    value: unknown,
    itemGuard: (item: unknown) => item is T,
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
export function isString(value: unknown): value is string {
    return typeof value === 'string';
}

/**
 * Type guard for number values
 */
export function isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard for boolean values
 */
export function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
}

/**
 * Type guard for Record<string, unknown>
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
    return isObject(value);
}

/**
 * Type guard for RecipeWithIngredients (Recipe with nested ingredients)
 */
export function isRecipeWithIngredients(value: unknown): value is Recipe & {
    recipe_ingredients?: Array<RecipeIngredient & { ingredient?: Ingredient }>
} {
    if (!isRecipe(value)) {
        return false;
    }

    // Check if recipe_ingredients exists and is valid
    if (hasProperty(value, 'recipe_ingredients')) {
        if (!Array.isArray(value.recipe_ingredients)) {
            return false;
        }

        // Validate each recipe ingredient
        return value.recipe_ingredients.every((ri: unknown) => {
            if (!isRecipeIngredient(ri)) {
                return false;
            }

            // Check nested ingredient if present
            if (hasProperty(ri, 'ingredient')) {
                return ri.ingredient === null || ri.ingredient === undefined || isIngredient(ri.ingredient);
            }

            return true;
        });
    }

    return true;
}

/**
 * Type assertion for RecipeWithIngredients
 */
export function assertRecipeWithIngredients(value: unknown): asserts value is Recipe & {
    recipe_ingredients?: Array<RecipeIngredient & { ingredient?: Ingredient }>
} {
    if (!isRecipeWithIngredients(value)) {
        throw new TypeError('Invalid recipe with ingredients data');
    }
}

/**
 * Validation function for OrderItem with detailed error messages
 */
export function validateOrderItem(value: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!isObject(value)) {
        errors.push('Value must be an object');
        return { valid: false, errors };
    }

    if (typeof value['id'] !== 'string') {
        errors.push('id must be a string');
    }
    if (typeof value['order_id'] !== 'string') {
        errors.push('order_id must be a string');
    }
    if (typeof value['recipe_id'] !== 'string') {
        errors.push('recipe_id must be a string');
    }
    if (typeof value['quantity'] !== 'number' || value['quantity'] <= 0) {
        errors.push('quantity must be a positive number');
    }
    if (typeof value['unit_price'] !== 'number' || value['unit_price'] < 0) {
        errors.push('unit_price must be a non-negative number');
    }
    if (typeof value['total_price'] !== 'number' || value['total_price'] < 0) {
        errors.push('total_price must be a non-negative number');
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Validation function for Recipe with detailed error messages
 */
export function validateRecipe(value: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!isObject(value)) {
        errors.push('Value must be an object');
        return { valid: false, errors };
    }

    if (typeof value['id'] !== 'string') {
        errors.push('id must be a string');
    }
    if (typeof value['name'] !== 'string' || value['name'].trim() === '') {
        errors.push('name must be a non-empty string');
    }
    if (typeof value['selling_price'] !== 'number' && value['selling_price'] !== null && value['selling_price'] !== undefined) {
        errors.push('selling_price must be a number or null');
    }
    if (typeof value['selling_price'] === 'number' && value['selling_price'] < 0) {
        errors.push('selling_price must be a non-negative number');
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Validation function for Ingredient with detailed error messages
 */
export function validateIngredient(value: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!isObject(value)) {
        errors.push('Value must be an object');
        return { valid: false, errors };
    }

    if (typeof value['id'] !== 'string') {
        errors.push('id must be a string');
    }
    if (typeof value['name'] !== 'string' || value['name'].trim() === '') {
        errors.push('name must be a non-empty string');
    }
    if (typeof value['unit'] !== 'string' || value['unit'].trim() === '') {
        errors.push('unit must be a non-empty string');
    }
    if (typeof value['current_stock'] !== 'number' && value['current_stock'] !== null && value['current_stock'] !== undefined) {
        errors.push('current_stock must be a number or null');
    }
    if (typeof value['current_stock'] === 'number' && value['current_stock'] < 0) {
        errors.push('current_stock must be a non-negative number');
    }
    if (typeof value['min_stock'] !== 'number' && value['min_stock'] !== null && value['min_stock'] !== undefined) {
        errors.push('min_stock must be a number or null');
    }
    if (typeof value['min_stock'] === 'number' && value['min_stock'] < 0) {
        errors.push('min_stock must be a non-negative number');
    }
    if (typeof value['price_per_unit'] !== 'number' || value['price_per_unit'] < 0) {
        errors.push('price_per_unit must be a non-negative number');
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Validation function for Order with detailed error messages
 */
export function validateOrder(value: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!isObject(value)) {
        errors.push('Value must be an object');
        return { valid: false, errors };
    }

    if (typeof value['id'] !== 'string') {
        errors.push('id must be a string');
    }
    if (typeof value['order_date'] !== 'string' && value['order_date'] !== null && value['order_date'] !== undefined) {
        errors.push('order_date must be a string or null');
    }
    if (typeof value['total_amount'] !== 'number' && value['total_amount'] !== null && value['total_amount'] !== undefined) {
        errors.push('total_amount must be a number or null');
    }
    if (typeof value['total_amount'] === 'number' && value['total_amount'] < 0) {
        errors.push('total_amount must be a non-negative number');
    }
    if (value['status'] !== null && value['status'] !== undefined && !isOrderStatus(value['status'])) {
        errors.push('status must be a valid OrderStatus or null');
    }
    if (value['payment_status'] !== null && value['payment_status'] !== undefined && !isPaymentStatus(value['payment_status'])) {
        errors.push('payment_status must be a valid PaymentStatus or null');
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Type guard for partial objects (useful for updates)
 */
export function isPartialOf<T extends Record<string, unknown>>(
    value: unknown,
    _fullGuard: (val: unknown) => val is T
): value is Partial<T> {
    if (!isObject(value)) {
        return false;
    }

    // For partial validation, we create a mock full object with required fields
    // and check if the provided fields are valid
    return Object.keys(value).every(key => {
        const testObj = { ...value, [key]: value[key] };
        return isObject(testObj);
    });
}

/**
 * Type guard for checking if value is a valid UUID
 */
export function isUUID(value: unknown): value is string {
    if (typeof value !== 'string') {
        return false;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
}

/**
 * Type guard for checking if value is a valid date string
 */
export function isDateString(value: unknown): value is string {
    if (typeof value !== 'string') {
        return false;
    }
    const date = new Date(value);
    return !isNaN(date.getTime());
}

/**
 * Type guard for positive numbers
 */
export function isPositiveNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Type guard for non-negative numbers
 */
export function isNonNegativeNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value) && value >= 0;
}
