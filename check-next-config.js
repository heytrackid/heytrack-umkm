#!/usr/bin/env node
 
/**
 * Script to inspect the Next.js ESLint plugin configuration
 */

import nextPlugin from "@next/eslint-plugin-next";

console.log("Recommended config keys:", Object.keys(nextPlugin.configs.recommended));
console.log("Recommended config plugins:", nextPlugin.configs.recommended.plugins);
console.log("Recommended config rules (first 5):", Object.entries(nextPlugin.configs.recommended.rules || {}).slice(0, 5));