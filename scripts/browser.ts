// Which browser renders the PDF profile and the share image. This computer has Chrome; CI uses the
// Chromium that Playwright installs; Vercel's build machines have neither, so there it is a
// Chromium built to run on their Amazon Linux.
import type { LaunchOptions } from '@playwright/test';

export async function launchOptions(env: NodeJS.ProcessEnv = process.env): Promise<LaunchOptions> {
  if (env.VERCEL) {
    const { default: serverless } = await import('@sparticuz/chromium');
    return { executablePath: await serverless.executablePath(), args: serverless.args };
  }
  return env.CI ? {} : { channel: 'chrome' };
}
