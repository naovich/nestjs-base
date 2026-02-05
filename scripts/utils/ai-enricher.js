#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

/**
 * Enrich file info with AI-generated descriptions using Claude Code CLI
 * @param {Array} fileInfos - Array of parsed file information
 * @returns {Promise<Array>} - Enriched file information
 */
export async function enrichWithAI(fileInfos) {
  console.log(`🤖 Enriching ${fileInfos.length} files with AI descriptions...`);

  const enrichedInfos = [];
  let successCount = 0;

  for (const fileInfo of fileInfos) {
    try {
      console.log(`   Analyzing ${fileInfo.path}...`);
      const enriched = await enrichFile(fileInfo);
      enrichedInfos.push(enriched);
      successCount++;
    } catch (error) {
      console.warn(`   ⚠️  Failed to enrich ${fileInfo.path}: ${error.message}`);
      enrichedInfos.push(fileInfo); // Keep original
    }
  }

  if (successCount === 0) {
    console.log('⚠️  AI enrichment skipped (Claude Code not available)');
  } else if (successCount < fileInfos.length) {
    console.log(`✅ AI enrichment complete (${successCount}/${fileInfos.length} files enriched)`);
  } else {
    console.log('✅ AI enrichment complete');
  }
  
  return enrichedInfos;
}

/**
 * Enrich a single file using Claude Code
 */
async function enrichFile(fileInfo) {
  // Resolve absolute path
  const absolutePath = path.isAbsolute(fileInfo.path)
    ? fileInfo.path
    : path.join(rootDir, fileInfo.path);

  const fileContent = fs.readFileSync(absolutePath, 'utf-8');

  const prompt = `Analyze this TypeScript/React file and provide brief descriptions.

File: ${fileInfo.path}

\`\`\`typescript
${fileContent}
\`\`\`

Respond with JSON only (no markdown code blocks):
{
  "fileDescription": "Brief file purpose (1 sentence)",
  "functions": {
    "functionName": "What it does (1 sentence)"
  },
  "components": {
    "ComponentName": "What it renders (1 sentence)"
  }
}`;

  try {
    // Write prompt to temp file to avoid shell escaping issues
    const tmpFile = path.join(rootDir, '.tmp-ai-prompt.txt');
    fs.writeFileSync(tmpFile, prompt, 'utf-8');

    // Call Claude Code CLI (assumes 'claude' is in PATH)
    const isWindows = process.platform === 'win32';
    const catCommand = isWindows ? 'type' : 'cat';
    
    const result = execSync(`${catCommand} "${tmpFile}" | claude --print`, {
      encoding: 'utf-8',
      timeout: 30000,
      cwd: rootDir,
    });

    // Clean up temp file
    fs.unlinkSync(tmpFile);

    // Parse response - look for JSON
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in response');
    }

    const descriptions = JSON.parse(jsonMatch[0]);

    // Apply descriptions
    if (descriptions.fileDescription && !fileInfo.description) {
      fileInfo.description = descriptions.fileDescription;
    }

    fileInfo.exports.functions.forEach((func) => {
      if (descriptions.functions?.[func.name] && !func.description) {
        func.description = descriptions.functions[func.name];
      }
    });

    fileInfo.exports.components.forEach((comp) => {
      if (descriptions.components?.[comp.name] && !comp.description) {
        comp.description = descriptions.components[comp.name];
      }
    });

    return fileInfo;
  } catch (error) {
    // Check if Claude Code is not in PATH
    if (error.message.includes('not found') || error.message.includes('is not recognized')) {
      throw new Error('Claude Code CLI not available (not in PATH)');
    }
    throw new Error(`Claude Code failed: ${error.message}`);
  }
}
