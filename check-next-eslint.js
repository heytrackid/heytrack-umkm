#!/usr/bin/env node
 
/* global console */
/**
 * Script to check the structure of the Next.js ESLint plugin
 */

import nextPlugin from "@next/eslint-plugin-next";

console.log("Next.js ESLint Plugin Structure:");
console.log("Type of plugin:", typeof nextPlugin);
console.log("Plugin keys:", Object.keys(nextPlugin));
console.log("Configs:", nextPlugin.configs ? Object.keys(nextPlugin.configs) : "No configs property");
if (nextPlugin.configs) {
  console.log("Recommended config:", nextPlugin.configs.recommended ? "exists" : "doesn't exist");
  console.log("TypeScript config:", nextPlugin.configs.typescript ? "exists" : "doesn't exist");
  console.log("All configs:", Object.keys(nextPlugin.configs));
}