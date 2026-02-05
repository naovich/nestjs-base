#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import { parseFile } from './utils/typescript-parser.js';
import { buildMarkdown } from './utils/markdown-builder.js';
import { enrichWithAI } from './utils/ai-enricher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Check for --ai flag (from args or environment variable)
const useAI = process.argv.includes('--ai') || process.env.AI_MODE === 'true';

console.log('📚 Generating codebase map...');
if (useAI) {
  console.log('🤖 AI enrichment enabled (Claude Code will generate descriptions)');
}

/**
 * Check if file has any exports
 */
function hasExports(fileInfo) {
  const { exports } = fileInfo;
  return (
    exports.functions.length > 0 ||
    exports.components.length > 0 ||
    exports.types.length > 0 ||
    exports.constants.length > 0
  );
}

// Top-level await (ES modules)
try {
  // Find all TypeScript files (no TSX for NestJS)
  const files = await glob('src/**/*.ts', {
    cwd: rootDir,
    absolute: true,
    ignore: [
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/test/**',
      '**/__tests__/**',
      '**/dist/**',
      '**/coverage/**',
      '**/*.d.ts',
    ],
  });

  if (files.length === 0) {
    console.log('⚠️  No TypeScript files found in src/');
    process.exit(0);
  }

  console.log(`📂 Found ${files.length} files to analyze`);

  // Parse all files
  const fileInfos = files
    .map((file) => {
      const relativePath = path.relative(rootDir, file);
      const fileInfo = parseFile(file);
      if (fileInfo) {
        // Replace absolute path with relative path (normalized to forward slashes)
        fileInfo.path = relativePath.replaceAll('\\', '/');
      }
      return fileInfo;
    })
    .filter((info) => info !== null) // Remove failed parses
    .filter((info) => hasExports(info)); // Only files with exports

  console.log(`✅ Successfully parsed ${fileInfos.length} files`);

  // Enrich with AI if requested
  let finalFileInfos = fileInfos;
  if (useAI) {
    finalFileInfos = await enrichWithAI(fileInfos);
  }

  // Build markdown
  const markdown = buildMarkdown(finalFileInfos);

  // Write CODEBASE.md
  const outputPath = path.join(rootDir, 'CODEBASE.md');
  fs.writeFileSync(outputPath, markdown, 'utf-8');

  console.log(`✅ CODEBASE.md generated successfully`);
  console.log(`   Location: ${outputPath}`);
  console.log(`   Files documented: ${fileInfos.length}`);
} catch (error) {
  console.error('❌ Error generating codebase map:', error.message);
  process.exit(1);
}
