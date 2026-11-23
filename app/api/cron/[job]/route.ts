import { spawn } from "node:child_process";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const JOBS: Record<string, [string, string]> = {
  openrouter: ["node", "scripts/fetch-openrouter.mjs"],
  "token-factory": ["node", "scripts/fetch-token-factory.mjs"],
  gpu: ["node", "scripts/fetch-gpu-pricing.mjs"],
  quote: ["node", "scripts/fetch-quote.mjs"],
  satellite: ["python3", "scripts/fetch_satellite.py"],
};

export async function GET(
  request: Request,
  context: { params: Promise<{ job: string }> },
) {
  const { job } = await context.params;
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const header = request.headers.get("authorization");
    if (header !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }
  const command = JOBS[job];
  if (!command) {
    return NextResponse.json({ ok: false, error: "unknown job" }, { status: 404 });
  }
  if (process.env.VERCEL) {
    return NextResponse.json({
      ok: false,
      job,
      reason:
        "Vercel serverless filesystem is read-only, so this route does not write data/. The scheduled GitHub Action commits refreshed JSON. Run the script locally if you want to update the files on this machine.",
    });
  }
  const output = await run(command[0], [command[1]]);
  return NextResponse.json({ ok: output.code === 0, job, ...output });
}

function run(cmd: string, args: string[]) {
  return new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve) => {
    const child = spawn(cmd, args, { cwd: process.cwd() });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("close", (code) => resolve({ code, stdout: stdout.slice(-4000), stderr: stderr.slice(-4000) }));
  });
}
