// Fallback for `@rhysd/actionlint` (not installable in this environment):
// validates GitHub Actions workflow YAML with a small Node script using the `yaml` package.
// Checks: files parse as YAML, have `on` and `jobs`, every job has a non-empty `steps` array,
// and every step has either `uses` or `run`. Exits non-zero on any problem.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const dir = '.github/workflows';
if (!existsSync(dir)) {
  console.log('lint-workflows: no .github/workflows directory, nothing to validate');
  process.exit(0);
}

const files = readdirSync(dir).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
if (files.length === 0) {
  console.log('lint-workflows: no workflow files found, nothing to validate');
  process.exit(0);
}

let failed = false;
for (const file of files) {
  const path = join(dir, file);
  const problems = [];
  let doc;
  try {
    doc = parse(readFileSync(path, 'utf8'));
  } catch (err) {
    console.error(`✗ ${path}: YAML parse error: ${err.message}`);
    failed = true;
    continue;
  }
  if (doc === null || typeof doc !== 'object') {
    problems.push('document is not a mapping');
  } else {
    if (doc.on === undefined) problems.push('missing top-level "on"');
    if (doc.jobs === null || typeof doc.jobs !== 'object' || Array.isArray(doc.jobs)) {
      problems.push('missing or invalid top-level "jobs" mapping');
    } else {
      for (const [jobName, job] of Object.entries(doc.jobs)) {
        if (job === null || typeof job !== 'object') {
          problems.push(`job "${jobName}" is not a mapping`);
          continue;
        }
        if (!Array.isArray(job.steps) || job.steps.length === 0) {
          problems.push(`job "${jobName}" has no steps`);
          continue;
        }
        job.steps.forEach((step, i) => {
          if (step === null || typeof step !== 'object' || (!step.uses && !step.run)) {
            problems.push(`job "${jobName}" step ${i + 1} has neither "uses" nor "run"`);
          }
        });
      }
    }
  }
  if (problems.length) {
    failed = true;
    for (const p of problems) console.error(`✗ ${path}: ${p}`);
  } else {
    console.log(`✓ ${path}`);
  }
}
process.exit(failed ? 1 : 0);
