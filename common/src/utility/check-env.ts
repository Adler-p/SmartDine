// Utility function to check required environment variables
export const checkEnvVariables = (vars: string[]) => {
    vars.forEach((v) => {
      if (!process.env[v]) {
        throw new Error(`${v} must be defined`);
      }
    });
  };