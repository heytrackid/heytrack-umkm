'use client'

import { memo, useMemo, useCallback } from 'react'
import type { ComponentType } from 'react'

/**
 * Higher-order component for memoization with custom comparison
 */
export function withMemo<P extends object>(
    Component: ComponentType<P>,
    propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) {
    return memo(Component, propsAreEqual)
}

/**
 * Memoize expensive calculations
 */
export function useMemoizedValue<T>(
    factory: () => T,
    deps: React.DependencyList
): T {
    return useMemo(factory, deps)
}

/**
 * Memoize callback functions
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: React.DependencyList
): T {
    return useCallback(callback, deps) as T
}

/**
 * Shallow comparison for props
 */
export function shallowEqual<T extends object>(objA: T, objB: T): boolean {
    if (Object.is(objA, objB)) {
        return true
    }

    if (
        typeof objA !== 'object' ||
        objA === null ||
        typeof objB !== 'object' ||
        objB === null
    ) {
        return false
    }

    const keysA = Object.keys(objA)
    const keysB = Object.keys(objB)

    if (keysA.length !== keysB.length) {
        return false
    }

    for (const key of keysA) {
        if (
            !Object.prototype.hasOwnProperty.call(objB, key) ||
            !Object.is(objA[key as keyof T], objB[key as keyof T])
        ) {
            return false
        }
    }

    return true
}

/**
 * Deep comparison for complex objects
 */
export function deepEqual(objA: any, objB: any): boolean {
    if (Object.is(objA, objB)) {
        return true
    }

    if (
        typeof objA !== 'object' ||
        objA === null ||
        typeof objB !== 'object' ||
        objB === null
    ) {
        return false
    }

    const keysA = Object.keys(objA)
    const keysB = Object.keys(objB)

    if (keysA.length !== keysB.length) {
        return false
    }

    for (const key of keysA) {
        if (
            !Object.prototype.hasOwnProperty.call(objB, key) ||
            !deepEqual(objA[key], objB[key])
        ) {
            return false
        }
    }

    return true
}

/**
 * Memoize component with shallow comparison
 */
export function memoShallow<P extends object>(Component: ComponentType<P>) {
    return memo(Component, shallowEqual)
}

/**
 * Memoize component with deep comparison
 */
export function memoDeep<P extends object>(Component: ComponentType<P>) {
    return memo(Component, deepEqual)
}
