<!--Kicker-->Development
# <!--Title-->Pushing to GitHub with Git
## <!--Subtitle-->Want to know how to push to GitHub? Read on.

I've been a heavy GitHub user for the past few years. One thing has always stumped me: pushing to GitHub. In this article, I'll cover how you can easily push to GitHub using the `git` command-line utility.

The following instructions are written assuming that the operating system being used is macOS. These instructions will work perfectly on Linux, but Windows may need some other configuration, prior to using the `git` utility.

Prior to any command-line instructions, make sure you have a GitHub repository already created. If not, go to [github.com/new](https://github.com/new) and create one.

Open a terminal, and navigate to the folder you want to push from. First, list and search the contents of the folder to see if there is an existing Git instance there. I used the command `ls -a | grep '.git'`.

The `ls` command on a \*nix system lists the contents of a directory, the default being the current one. The `-a` flag tells `ls` to show hidden files and directories. `grep` is, as [Wikipedia](https://en.wikipedia.org/wiki/Grep) puts it, "a command-line utility for searching plain-text data sets for lines that match a regular expression." The full command lists all the contents of a directory, visible and invisible, then searches for the term ".git", and prints out the results. When a Git instance is created, a `.git` folder is created. As StackOverflow user Avinash Ranjan says, "The .git folder contains all the information that is necessary for your project in version control and all the information about commits, remote repository address, etc," ([link to answer](https://stackoverflow.com/a/29220296/7313822)).

If you do find a `.git` folder, you can remove the folder with the destructive command `rm -r .git`. Unlike using a graphical file manager, **you cannot undo a deletion**! The `rm` command's `-r` flag means that it *will* remove all files and folders followed by the command.

When you have a folder without the `.git` folder, we can initalize the repository.
  1. Start by typing `git init`. This will create a `.git` folder that contains basic information.
  2. Add `.gitignore` file. A `.gitignore` tells Git not to add the files and directories that are listed in the file.
      * Examples include the `node_modules/` directory, a `.env`, etc. GitHub has a good list of premade `.gitignore` files [in this repository](https://github.com/github/gitignore).
  3. Type `git add .`. This will add all the files and directories, save for the ones from the `.gitignore` file, to the repository's commit.
  4. Add a commit message with `git commit -m "<COMMIT_MESSAGE_HERE>"`. Replace the `<COMMIT_MESSAGE_HERE>` with your commit message. The maximum length is fifty characters.
  5. Add the GitHub repository, as an upstream repository, to the local Git repository, with the command `git remote add origin <REPOSITORY_PATH>.git`. Be sure to replace `<REPOSITORY_PATH` with your repository's path. For example, if I were adding my [Schedules](https://github.com/hkamran80/schedules) repository, the command would be `git remote add origin https://github.com/hkamran80/schedules.git`. If previously unsigned in, the utility will ask you to sign in to GitHub.
  6. Push the changes with `git push -u origin master`. This pushes the changes to the `origin`'s `master` branch.
  
After the initial push, future pushes are as simple as:
  1. Re-add everything: `git add .`
  2. Add a commit message `git commit -m "<COMMIT_MESSAGE_HERE>"`
  3. Push the changes: `git push -u origin master`
  
Thanks for reading this quick little guide on pushing to GitHub with Git!
