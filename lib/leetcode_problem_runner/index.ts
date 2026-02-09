import { readFileSync, existsSync } from "fs";
import { pathToFileURL } from "url";
import { resolve } from "path";

interface TestCase {
  input: unknown[];
  expected: unknown;
  description?: string;
}

interface TestConfig {
  functionName: string;
  cases: TestCase[];
}

interface TestResult {
  passed: boolean;
  input: unknown[];
  expected: unknown;
  actual: unknown;
  timeMs: number;
  error?: string;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => deepEqual(val, b[i]));
  }
  if (typeof a === "object" && typeof b === "object") {
    const aKeys = Object.keys(a as object);
    const bKeys = Object.keys(b as object);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) =>
      deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
    );
  }
  return false;
}

function formatValue(val: unknown): string {
  return JSON.stringify(val);
}

async function runTests(
  solutionPath: string,
  testPath?: string
): Promise<void> {
  const absoluteSolutionPath = resolve(solutionPath);

  if (!existsSync(absoluteSolutionPath)) {
    console.error(`❌ Solution file not found: ${solutionPath}`);
    process.exit(1);
  }

  // Determine test file path
  const testFilePath = testPath || solutionPath.replace(/\.ts$/, ".test.json");
  const absoluteTestPath = resolve(testFilePath);

  if (!existsSync(absoluteTestPath)) {
    console.error(`❌ Test file not found: ${testFilePath}`);
    console.log("Create a test file with format:");
    console.log(`{
  "functionName": "yourFunction",
  "cases": [
    { "input": [...args], "expected": result }
  ]
}`);
    process.exit(1);
  }

  // Load test config
  const testConfig: TestConfig = JSON.parse(
    readFileSync(absoluteTestPath, "utf-8")
  );

  // Import solution module
  const solutionUrl = pathToFileURL(absoluteSolutionPath).href;
  const solutionModule = await import(solutionUrl);
  const solutionFn = solutionModule[testConfig.functionName];

  if (typeof solutionFn !== "function") {
    console.error(
      `❌ Function "${testConfig.functionName}" not found in solution`
    );
    console.log("Available exports:", Object.keys(solutionModule));
    process.exit(1);
  }

  console.log(`\nRunning: ${testConfig.functionName}`);
  console.log("━".repeat(50));

  const results: TestResult[] = [];

  for (let i = 0; i < testConfig.cases.length; i++) {
    const testCase = testConfig.cases[i];
    const result: TestResult = {
      passed: false,
      input: testCase.input,
      expected: testCase.expected,
      actual: undefined,
      timeMs: 0,
    };

    try {
      const start = performance.now();
      result.actual = solutionFn(...testCase.input);
      result.timeMs = performance.now() - start;
      result.passed = deepEqual(result.actual, testCase.expected);
    } catch (err) {
      result.error = err instanceof Error ? err.message : String(err);
    }

    results.push(result);

    const status = result.passed ? "✓ PASS" : "✗ FAIL";
    const statusColor = result.passed ? "\x1b[32m" : "\x1b[31m";
    const reset = "\x1b[0m";

    console.log(
      `\nTest ${i + 1}: ${statusColor}${status}${reset} (${result.timeMs.toFixed(2)}ms)`
    );

    if (testCase.description) {
      console.log(`  ${testCase.description}`);
    }

    console.log(`  Input: ${formatValue(testCase.input)}`);
    console.log(`  Expected: ${formatValue(testCase.expected)}`);
    console.log(`  Got: ${formatValue(result.actual)}`);

    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
  }

  console.log("\n" + "━".repeat(50));

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const totalTime = results.reduce((sum, r) => sum + r.timeMs, 0);

  const summaryColor = passed === total ? "\x1b[32m" : "\x1b[31m";
  const reset = "\x1b[0m";

  console.log(`Results: ${summaryColor}${passed}/${total} passed${reset}`);
  console.log(`Total time: ${totalTime.toFixed(2)}ms\n`);

  process.exit(passed === total ? 0 : 1);
}

// CLI entry point
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: npm run leetcode -- <solution.ts> [tests.json]");
  console.log("\nExample:");
  console.log("  npm run leetcode -- solution.ts");
  console.log("  npm run leetcode -- solution.ts custom-tests.json");
  process.exit(1);
}

runTests(args[0], args[1]).catch(console.error);
