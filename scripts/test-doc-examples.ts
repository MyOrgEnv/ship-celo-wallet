import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');

function findCodeBlocks(md: string): string[] {
  const regex = /```tsx([\s\S]*?)```/g;
  const blocks: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(md)) !== null) {blocks.push(m[1]);}
  return blocks;
}

function compileSnippet(code: string) {
  const tmpFile = path.join(ROOT, '.tmp', `example-${Date.now()}.tsx`);
  fs.mkdirSync(path.dirname(tmpFile), { recursive: true });
  fs.writeFileSync(tmpFile, code, 'utf8');
  try {
    execSync(`tsx ${tmpFile}`, { stdio: 'ignore' });
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

function main() {
  const files = walk(DOCS).filter(f => f.endsWith('.md'));
  let failures = 0;
  for (const file of files) {
    const md = fs.readFileSync(file, 'utf8');
    const blocks = findCodeBlocks(md);
    for (const b of blocks) {
      try {
        compileSnippet(b);
      } catch (e) {
        console.error(`Example failed in ${file}:`, e instanceof Error ? e.message : e);
        failures++;
      }
    }
  }
  if (failures > 0) {
    console.error(`${failures} documentation examples failed to compile.`);
    process.exit(1);
  } else {
    console.log('All documentation examples compiled successfully.');
  }
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {out.push(...walk(full));} else {out.push(full);}
  }
  return out;
}

main();
