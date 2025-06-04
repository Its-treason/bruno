export class UserScriptError extends Error {
  constructor(originalError: unknown, script: string) {
    let formattedError = String(originalError);
    if (originalError instanceof Error) {
      const stack = originalError.stack?.split('\n');
      if (stack) {
        formattedError = '';
        for (const line of stack) {
          formattedError += `${line}\n`;
          // "LAZER_SCRIPT_WRAPPER" is the function wrapping the user script.
          // Everything after that, will be unessacry for the user.
          if (line.includes('LAZER_SCRIPT_WRAPPER')) {
            break;
          }
        }
      }
    }

    const fullMessage = `
UserScriptError: This error occurred inside your script!

=== Error ===
${formattedError.trim()}
=== Error ===

=== Script ===
${script.trim()}
=== Script ===
        `.trim();

    super(fullMessage);
  }
}
