#!/usr/bin/env node

/**
 * Build markdown documentation from parsed files
 * @param {Array} fileInfos - Array of parsed file information
 * @returns {string} - Markdown content
 */
export function buildMarkdown(fileInfos) {
  const sections = [];

  // Header
  sections.push('# CODEBASE.md');
  sections.push('');
  sections.push('*Auto-generated - Do not edit manually*');
  sections.push(`*Last updated: ${new Date().toISOString().split('T')[0]}*`);
  sections.push('');
  sections.push('---');
  sections.push('');

  // Group files by directory
  const grouped = groupByDirectory(fileInfos);

  // Generate sections
  Object.entries(grouped).forEach(([dir, files]) => {
    sections.push(`## 📁 ${dir}/`);
    sections.push('');

    files.forEach((fileInfo) => {
      sections.push(buildFileSection(fileInfo));
    });

    sections.push('---');
    sections.push('');
  });

  return sections.join('\n');
}

/**
 * Group files by directory
 */
function groupByDirectory(fileInfos) {
  const grouped = {};

  fileInfos.forEach((fileInfo) => {
    // Normalize path to use forward slashes (cross-platform)
    const normalizedPath = fileInfo.path.replaceAll('\\', '/');
    const parts = normalizedPath.split('/');
    const dir = parts.slice(0, -1).join('/');
    const dirKey = dir || 'root';

    if (!grouped[dirKey]) {
      grouped[dirKey] = [];
    }
    grouped[dirKey].push(fileInfo);
  });

  return grouped;
}

/**
 * Build section for a single file
 */
function buildFileSection(fileInfo) {
  const sections = [];
  // Normalize path to use forward slashes (cross-platform)
  const normalizedPath = fileInfo.path.replaceAll('\\', '/');
  const fileName = normalizedPath.split('/').pop();

  sections.push(`### ${fileName}`);
  sections.push('');

  // File description
  if (fileInfo.description) {
    sections.push(`**Description:** ${fileInfo.description}`);
    sections.push('');
  }

  // Functions
  if (fileInfo.exports.functions.length > 0) {
    sections.push('**Functions:**');
    fileInfo.exports.functions.forEach((func) => {
      sections.push(buildFunctionDoc(func));
    });
    sections.push('');
  }

  // Components
  if (fileInfo.exports.components.length > 0) {
    sections.push('**Components:**');
    fileInfo.exports.components.forEach((comp) => {
      sections.push(buildComponentDoc(comp));
    });
    sections.push('');
  }

  // Types
  if (fileInfo.exports.types.length > 0) {
    sections.push('**Types:**');
    fileInfo.exports.types.forEach((type) => {
      sections.push(buildTypeDoc(type));
    });
    sections.push('');
  }

  // Constants
  if (fileInfo.exports.constants.length > 0) {
    sections.push('**Constants:**');
    fileInfo.exports.constants.forEach((constant) => {
      sections.push(buildConstantDoc(constant));
    });
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * Build function documentation
 */
function buildFunctionDoc(func) {
  const sections = [];
  const signature = `${func.isAsync ? 'async ' : ''}${func.name}(${func.params.join(', ')}): ${func.returns}`;

  sections.push(`- \`${signature}\`${func.isDefault ? ' *(default export)*' : ''}`);

  if (func.description) {
    sections.push(`  - ${func.description}`);
  }

  return sections.join('\n');
}

/**
 * Build component documentation
 */
function buildComponentDoc(comp) {
  const sections = [];
  const signature = comp.props ? `${comp.name}(props: ${comp.props})` : comp.name;

  sections.push(`- \`${signature}\`${comp.isDefault ? ' *(default export)*' : ''}`);

  if (comp.description) {
    sections.push(`  - ${comp.description}`);
  }

  return sections.join('\n');
}

/**
 * Build type documentation
 */
function buildTypeDoc(type) {
  const sections = [];
  sections.push(`- \`${type.name}\` (${type.kind})`);

  if (type.description) {
    sections.push(`  - ${type.description}`);
  }

  return sections.join('\n');
}

/**
 * Build constant documentation
 */
function buildConstantDoc(constant) {
  const sections = [];
  sections.push(`- \`${constant.name}\``);

  if (constant.description) {
    sections.push(`  - ${constant.description}`);
  }

  return sections.join('\n');
}
