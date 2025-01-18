import { type ExecOptions, execFile } from "node:child_process";

interface ExecuteParams {
  command: string;
  args: string[];
  options?: ExecOptions;
}

export async function execute({ command, args, options = {} }: ExecuteParams): Promise<string> {
  console.log(`${command} ${args.join(" ")}`); // TODO: Replace with Logger

  return new Promise((resolve) =>
    execFile(
      command,
      args,
      { ...options, encoding: "utf8" },
      (error, stdout, stderr): void => {
        if (error || stderr) {
          console.error(error || stderr); // TODO: Replace with Logger
          resolve("");
        } else {
          resolve(stdout.trim());
        }
      }
    )
  );
}
