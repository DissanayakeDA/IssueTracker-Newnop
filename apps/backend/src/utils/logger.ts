const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }
  return String(error);
};

const logger = {
  error: (context: string, error?: unknown): void => {
    if (error !== undefined) {
      console.error(`[ERROR] ${context}\n${formatError(error)}`);
    } else {
      console.error(`[ERROR] ${context}`);
    }
  },

  info: (message: string): void => {
    console.log(`[INFO] ${message}`);
  },
};

export default logger;
