export function getErrorStack(error: unknown): string {
  return error instanceof Error && error.stack ? error.stack : String(error);
}
