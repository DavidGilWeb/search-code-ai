import { extensions } from "vscode";
import { GitExtension, GitLog } from "./types/git";
import { execute } from "./util/execute";
import { dirname } from "node:path";

export class GitUtils {
  filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  // TODO: git log -S "text" --pretty=format:%H --source --all

  async getGitLog(): Promise<GitLog[]> {
    const logOutput = await this.runGitCommand(
      "log",
      "--pretty=format:%H%n%an%n%ae%n%ad%n%s%n",
      this.filePath
    );
    const commits = logOutput.split("\n\n").map((commit) => {
      const [hash, authorName, authorEmail, date, ...message] =
        commit.split("\n");
      return {
        hash,
        authorName,
        authorEmail,
        date: new Date(date),
        message: message.join("\n"),
      };
    });
    return commits;
  }

  /**
   * Function to get the root of the git repository
   * where the file is located
   *
   * @returns root of the git repository
   * @throws error if the file is not in a git repository
   */
  async getRepositoryRoot(): Promise<string> {
    return this.runGitCommand("rev-parse", "--show-toplevel", this.filePath);
  }

  /**
   * Utility function to check if the file is in a git repository
   *
   * @returns true if the file is in a git repository, false otherwise
   */
  async isGitRepository(): Promise<boolean> {
    if (await this.getRepositoryRoot()) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Function to run a git command for a specific file
   *
   * @param filePath path to the file
   * @param args arguments to pass to the git command
   */
  async runGitCommand(...args: string[]): Promise<string> {
    return execute({
      command: this.getGitCommand(),
      args,
      options: {
        cwd: dirname(this.filePath),
        env: { ...process.env, LC_ALL: "C" },
      },
    });
  }

  /**
   * Function to get git command, be it
   * from the vscode extension or the system
   */
  private getGitCommand(): string {
    const vscodeGit = extensions.getExtension<GitExtension>("vscode.git");

    if (vscodeGit?.exports.enabled) {
      return vscodeGit.exports.getAPI(1).git.path;
    }

    return "git";
  }
}
