#!/usr/bin/env node

/**
 * Script to generate a file tree of the project
 * Usage: node scripts/generate-tree.js [options]
 *
 * Options:
 *   --output, -o    Output file path (default: FILE_TREE.md)
 *   --depth, -d     Maximum depth to traverse (default: unlimited)
 *   --help, -h      Show help
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folders and files to exclude from the tree
const EXCLUDED_PATTERNS = [
  // Dependencies and builds
  'node_modules',
  'dist',
  'dist-ssr',
  'build',

  // Test outputs
  'coverage',
  'playwright-report',
  'test-results',
  '.nyc_output',

  // Cache directories
  '.cache',
  '.parcel-cache',
  '.vite-temp',
  '.turbo',

  // Storybook
  'storybook-static',

  // Git
  '.git',

  // IDE and editor
  '.idea',

  // OS files
  '.DS_Store',
  'Thumbs.db',

  // Logs
  '*.log',
  '*storybook.log',

  // Lock files
  'package-lock.json',

  // Environment files
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  '.env.test',
];

/**
 * Check if a file/folder should be excluded
 * @param {string} name
 * @returns {boolean}
 */
function shouldExclude(name) {
  return EXCLUDED_PATTERNS.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(
        '^' + pattern.replaceAll('*', '.*').replaceAll('?', '.') + '$'
      );
      return regex.test(name);
    }
    return name === pattern;
  });
}

/**
 * Read directory and build tree structure
 * @param {string} dirPath
 * @param {number} currentDepth
 * @param {number} maxDepth
 * @returns {Array<{name: string, isDirectory: boolean, children?: Array}>}
 */
function buildTree(dirPath, currentDepth, maxDepth) {
  if (maxDepth > 0 && currentDepth >= maxDepth) {
    return [];
  }

  const entries = [];

  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    // Sort: directories first, then files, alphabetically
    const sorted = items.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

    for (const item of sorted) {
      if (shouldExclude(item.name)) continue;

      const entry = {
        name: item.name,
        isDirectory: item.isDirectory(),
      };

      if (item.isDirectory()) {
        const childPath = path.join(dirPath, item.name);
        entry.children = buildTree(childPath, currentDepth + 1, maxDepth);
      }

      entries.push(entry);
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
  }

  return entries;
}

/**
 * Generate ASCII tree representation
 * @param {Array} entries
 * @param {string} prefix
 * @param {boolean[]} isLast
 * @returns {string}
 */
function generateTreeString(entries, prefix = '', isLast = []) {
  let result = '';

  entries.forEach((entry, index) => {
    const isLastEntry = index === entries.length - 1;

    // Build the prefix for this line
    let linePrefix = '';
    for (const element of isLast) {
      linePrefix += element ? '    ' : '│   ';
    }

    // Add the branch character
    const branch = isLastEntry ? '└── ' : '├── ';
    const displayName = entry.isDirectory ? `${entry.name}/` : entry.name;

    result += `${linePrefix}${branch}${displayName}\n`;

    // Process children if directory
    if (entry.children && entry.children.length > 0) {
      result += generateTreeString(entry.children, prefix, [
        ...isLast,
        isLastEntry,
      ]);
    }
  });

  return result;
}

/**
 * Generate the complete file tree document
 * @param {string} rootName
 * @param {Array} tree
 * @returns {string}
 */
function generateDocument(rootName, tree) {
  const timestamp = new Date().toISOString().split('T')[0];
  const treeContent = generateTreeString(tree);

  return `# File Tree - ${rootName}

> Auto-generated on ${timestamp}
>
> Run \`npm run tree\` to regenerate this file.

## Project Structure

\`\`\`
${rootName}/
${treeContent}\`\`\`

## Excluded Patterns

The following patterns are excluded from this tree:

${EXCLUDED_PATTERNS.map(p => `- \`${p}\``).join('\n')}
`;
}

/**
 * Parse command line arguments
 * @returns {{outputPath: string, maxDepth: number, rootPath: string}}
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    outputPath: 'FILE_TREE.md',
    maxDepth: 0, // 0 = unlimited
    rootPath: path.resolve(__dirname, '..'),
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: node scripts/generate-tree.js [options]

Options:
  --output, -o <path>   Output file path (default: FILE_TREE.md)
  --depth, -d <number>  Maximum depth to traverse (default: unlimited)
  --help, -h            Show this help message

Examples:
  npm run tree
  npm run tree -- -o docs/structure.md
  npm run tree -- -d 3
`);
      process.exit(0);
    }

    if (arg === '--output' || arg === '-o') {
      options.outputPath = args[++i] || options.outputPath;
    }

    if (arg === '--depth' || arg === '-d') {
      const depth = Number.parseInt(args[++i], 10);
      options.maxDepth = Number.isNaN(depth) ? 0 : depth;
    }
  }

  return options;
}

/**
 * Main function
 */
function main() {
  const options = parseArgs();
  const rootName = path.basename(options.rootPath);

  console.log(`Generating file tree for: ${rootName}`);
  console.log(`Output: ${options.outputPath}`);
  if (options.maxDepth > 0) {
    console.log(`Max depth: ${options.maxDepth}`);
  }

  // Build the tree
  const tree = buildTree(options.rootPath, 0, options.maxDepth);

  // Generate document
  const document = generateDocument(rootName, tree);

  // Write to file
  const outputFullPath = path.join(options.rootPath, options.outputPath);
  fs.writeFileSync(outputFullPath, document, 'utf-8');

  console.log(`\nFile tree generated successfully!`);
  console.log(`Saved to: ${outputFullPath}`);
}

main();
