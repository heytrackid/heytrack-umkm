import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import removeConsole from "vite-plugin-remove-console";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const isProd = mode === "production";

  // Keep logs if user forces or in development
  const keepLogs = env.VITE_FORCE_LOGS === "true" || !isProd;

  // Build-time info
  const buildId = `heytrack_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const commitHash = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'local';
  const buildTime = new Date().toISOString();

  console.log("🎯 [HEYTRACK VITE CONFIG]", {
    mode,
    isProd,
    keepLogs,
    buildId,
    commitHash: commitHash.slice(0, 8),
    buildTime
  });

  return {
    plugins: [
      react(),
      // Strip console only in production
      ...(isProd && !keepLogs
        ? [
            removeConsole({
              includes: ["log", "debug", "info", "warn", "trace"],
            }),
          ]
        : []
      ),
      // Bundle analyzer in production
      ...(isProd && env.VITE_ANALYZE === "true"
        ? [
            visualizer({
              filename: "dist/stats.html",
              open: true,
              gzipSize: true
            })
          ]
        : []
      )
    ],

    server: {
      port: 5174,
      strictPort: true,
      open: true,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    },
    
    preview: {
      port: 5175,
      strictPort: true,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    },

    define: {
      __DEV__: JSON.stringify(!isProd),
      __PROD__: JSON.stringify(isProd),
      __CONSOLE_ENABLED__: JSON.stringify(!(isProd && !keepLogs)),
      // Build information
      "import.meta.env.VITE_BUILD_ID": JSON.stringify(buildId),
      "import.meta.env.VITE_COMMIT_HASH": JSON.stringify(commitHash),
      "import.meta.env.VITE_BUILD_TIME": JSON.stringify(buildTime),
      "import.meta.env.VITE_APP_NAME": JSON.stringify("HeyTrack"),
      "import.meta.env.VITE_APP_VERSION": JSON.stringify("1.0.0")
    },

    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "src"),
        "@/components": path.resolve(process.cwd(), "components"),
        "@/services": path.resolve(process.cwd(), "services"),
        "@/types": path.resolve(process.cwd(), "types"),
        "@/hooks": path.resolve(process.cwd(), "hooks"),
        "@/database": path.resolve(process.cwd(), "database"),
      },
    },

    build: {
      target: "es2020",
      minify: isProd ? "esbuild" : false,
      sourcemap: !isProd,
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // Group heavy libs
              if (id.includes('recharts')) return 'charts';
              if (id.includes('@supabase/')) return 'supabase';
              if (id.includes('@radix-ui/')) return 'radix';
              return 'vendor';
            }
          },
          entryFileNames: isProd ? "assets/[name]-[hash].js" : "assets/[name].js",
          chunkFileNames: isProd ? "assets/[name]-[hash].js" : "assets/[name].js",
          assetFileNames: isProd ? "assets/[name]-[hash].[ext]" : "assets/[name].[ext]",
        },
      },
    },

    // Performance optimization
    cacheDir: "node_modules/.vite",
    
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react-router-dom",
        "@tanstack/react-query",
        "lucide-react",
        "@radix-ui/react-icons",
        "@radix-ui/react-dialog",
        "@radix-ui/react-select",
        "@supabase/supabase-js"
      ],
      force: true
    },
    
    // Asset handling
    assetsInclude: ['**/*.webp', '**/*.avif', '**/*.svg'],
    
    // CSS optimization
    css: {
      devSourcemap: !isProd
    }
  };
});