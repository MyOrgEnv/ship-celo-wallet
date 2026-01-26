import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'react-docgen-typescript';

type ComponentDoc = ReturnType<typeof parse>[number];

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DOCS = path.join(ROOT, 'docs');
const VERSION = getVersion();
const OUT = path.join(DOCS, `v${VERSION}`);
const SEARCH_INDEX: { title: string; path: string; headings: string[] }[] = [];

function getVersion(): string {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  return pkg.version || '0.0.0';
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(p: string, content: string) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content, 'utf8');
}

function mdEscape(s: string) {
  return s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function addToIndex(title: string, relPath: string, headings: string[]) {
  SEARCH_INDEX.push({ title, path: relPath, headings });
}

function generatePropTable(doc: ComponentDoc): string {
  const rows = Object.entries(doc.props).map(([name, prop]) => {
    const type = mdEscape(prop.type.name || '');
    const required = prop.required ? 'Yes' : 'No';
    const defaultValue = prop.defaultValue?.value ? `\`${  mdEscape(prop.defaultValue.value)  }\`` : '-';
    const description = mdEscape(prop.description || '');
    return `| ${name} | ${type} | ${required} | ${defaultValue} | ${description} |`;
  });
  return [
    '| Prop | Type | Required | Default | Description |',
    '|------|------|----------|---------|-------------|',
    ...rows
  ].join('\n');
}

function exampleBlock(name: string, importPath: string, propsExample: string): string {
  const code = `import React from 'react';\nimport { ${name} } from '${importPath}';\n\nexport default function Example() {\n  return <${name} ${propsExample} />;\n}`;
  return [
    '```tsx',
    code,
    '```',
    '',
    '<!-- copy-paste-ready -->'
  ].join('\n');
}

function integrationGuide(name: string): string {
  return [
    '### Integration Guide',
    '- Install dependencies: `npm i wagmi @walletconnect/modal @celo`',
    '- Wrap your app with required providers (Wagmi, Celo).',
    `- Use ${name} in pages where wallet interactions are needed.`,
    '- Persist session state and handle disconnect gracefully.'
  ].join('\n');
}

function troubleshooting(): string {
  return [
    '### Troubleshooting',
    '- Modal not opening: Check WalletConnect projectId and network config.',
    '- No balance shown: Ensure RPC endpoint is reachable and correct chainId.',
    '- Type errors: Run `npm run typedoc` to validate exported types.'
  ].join('\n');
}

function hookSection(name: string, hooks: string[]): string {
  if (!hooks.length) {return '';}
  return [
    '### Hooks',
    ...hooks.map(h => `- ${h} — usage and return types.`)
  ].join('\n');
}

function discoverComponents(): string[] {
  const dir = path.join(SRC, 'components');
  if (!fs.existsSync(dir)) {return [];}
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.tsx'))
    .map(f => path.join(dir, f));
}

function parseComponent(file: string): ComponentDoc | null {
  try {
    const docs = parse(file, { savePropValueAsString: true, shouldRemoveUndefinedFromOptional: true });
    if (docs.length) {return docs[0];}
  } catch (error) {
    console.error('Failed to parse component:', error);
  }
  return null;
}

function propsExampleFromDoc(doc: ComponentDoc): string {
  const pairs = Object.entries(doc.props).map(([name, prop]) => {
    const t = prop.type.name;
    if (t.includes('string')) {return `${name}="example"`;}
    if (t.includes('number')) {return `${name}={42}`;}
    if (t.includes('boolean')) {return `${name}={true}`;}
    return `${name}={` + '/* see docs */' + '}';
  });
  return pairs.join(' ');
}

function generate() {
  ensureDir(OUT);
  const indexMd = [
    '# Ship Celo Wallet Documentation',
    `Version: v${VERSION}`,
    '',
    '- Interactive Playground: See Storybook build in ./storybook-static',
    '- API Reference: ./api',
    '- Components: ./components',
    '- Guides: ./guides'
  ].join('\n');
  writeFile(path.join(OUT, 'index.md'), indexMd);
  addToIndex('Home', `v${VERSION}/index.md`, ['Interactive Playground', 'API Reference', 'Components', 'Guides']);

  const compOut = path.join(OUT, 'components');
  ensureDir(compOut);
  discoverComponents().forEach(file => {
    const doc = parseComponent(file);
    const name = path.basename(file, path.extname(file));
    const relImport = path.relative(SRC, file).replace(/\\/g, '/').replace(/\.tsx$/, '');
    const headings: string[] = [];
    let content = `# ${name}\n`;
    headings.push(name);

    if (doc) {
      content += `\n${doc.description || 'Component documentation.'}\n`;
      content += '\n## Props\n';
      headings.push('Props');
      content += `${generatePropTable(doc)  }\n`;

      content += '\n## Example\n';
      headings.push('Example');
      content += `${exampleBlock(name, `./${relImport}`, propsExampleFromDoc(doc))  }\n`;

      content += `\n${integrationGuide(name)}\n`;
      headings.push('Integration Guide');

      content += `\n${troubleshooting()}\n`;
      headings.push('Troubleshooting');

      content += `\n${hookSection(name, [])}\n`;
    } else {
      content += '\nNo props detected. Ensure the component is exported and uses TypeScript.\n';
    }

    const outFile = path.join(compOut, `${name}.md`);
    writeFile(outFile, content);
    addToIndex(name, `v${VERSION}/components/${name}.md`, headings);
  });

  const guidesOut = path.join(OUT, 'guides');
  ensureDir(guidesOut);
  const gettingStarted = [
    '# Getting Started',
    '1. Run Storybook: `npm run storybook`',
    '2. Generate API docs: `npm run typedoc`',
    '3. Generate component docs: `npm run docs:generate`',
    '4. Serve docs: `npm run docs:serve`'
  ].join('\n');
  writeFile(path.join(guidesOut, 'getting-started.md'), gettingStarted);
  addToIndex('Getting Started', `v${VERSION}/guides/getting-started.md`, ['Run Storybook', 'Generate API docs', 'Serve docs']);

  writeFile(path.join(DOCS, 'search-index.json'), JSON.stringify(SEARCH_INDEX, null, 2));
}

generate();
console.log(`Docs generated at ${OUT}`);
