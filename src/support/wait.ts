export default async (
  fn: () => Promise<boolean>,
  delayMs: number = 1000,
  maxRetries: number = 20,
) => {
  let successful = false;
  for (let i = 0; i < maxRetries; i++) {
    const done = await fn();
    if (done) {
      successful = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return successful;
};
