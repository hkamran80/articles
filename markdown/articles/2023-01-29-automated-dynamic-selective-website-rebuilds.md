Up until a few weeks ago, I had to fully rebuild my website to update an article
or note. While this didn't take along after switching to [Next.js](https://nextjs.org/),
it was a minor peeve. After searching through the Next.js docs, I came across a
concept known as [Incremental Static Regeneration](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration).
I opted to use on-demand revalidation, which uses an API route to trigger a revalidation
via the `res.revalidate` function which takes the path of the route you want to update.

To get started, I created the API route at `/api/revalidate`, then added a few checks
in line with the example. I implemented a HTTP method check to ensure that all requests
were `POST` requests, and to ensure that all requests were authenticated against
a secret key I generated. The source code for the API route is [available on GitHub](https://github.com/hkamran80/website/blob/redesign-nextjs/pages/api/revalidate.ts).

After testing the revalidation route with [Hoppscotch](https://hoppscotch.io/),
I embarked on the important part: automatically triggering revalidation. Since my
articles and notes are all stored in a [GitHub repository](https://github.com/hkamran80/articles),
I decided to use GitHub Actions configured with a `push` event to the `main` branch,
as well as a `workflow_dispatch` trigger for testing.

## Overview

I added four stages to the workflow: evaluation, compilation, merging, and revalidation.
The evaluation stage determines if any files that would warrant a revalidation have
been updated. These include all the Markdown files in the [`markdown` folder](https://github.com/hkamran80/articles/tree/main/markdown)
or the [`contents.json` file](https://github.com/hkamran80/articles/blob/main/markdown/contents.json),
also in the Markdown folder. The compilation stage has two substages: one for Markdown
files and one for the JSON file. These substages retrieve changes from the files,
then compile the paths needed to revalidate. The merge stage merges the output from
both compilation substages. And finally, the revalidation stage actually sends revalidation
requests to Vercel.

## Implementation

### Evaluation Stage

The evaluation stage is the simplest stage, because it simply generates a list of
files changed in the last commit. [Both evaluation checks](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L24-L25)
use the [`git diff`](https://git-scm.com/docs/git-diff) command with two options,
`--name-only` and `--diff-filter=ACMRT`, to check for differences between the current
commit and the previous commit.

The [first parameter](https://git-scm.com/docs/git-diff#Documentation/git-diff.txt---name-only)
tells `git diff` to only return the filenames that were changed, as opposed to the
line-level differences. The [second parameter](https://git-scm.com/docs/git-diff#Documentation/git-diff.txt---diff-filterACDMRTUXB82308203)
filters the search for files by checking if they were added (`A`), copied (`C`),
modified (`M`), renamed (`R`), or had their type changed (`T`). Then, the commands
use [`grep`](https://www.gnu.org/software/grep/manual/grep.html#Introduction) to
filter the file extensions (`.md$` and `.json$` respectively). In the case of Markdown
files, an additional `grep` command is in place to verify that all the files found
are in the `markdown` folder: `grep '^markdown/'`. Finally, [`xargs`](https://man7.org/linux/man-pages/man1/xargs.1.html)
compiles the returned files into a single line.

### Compilation Stage

The compilation stage is the next stage, and is split into two substages.

#### Markdown Compilation

The first substage deals with Markdown files. It first
checks whether any of the Markdown files were changed by checking the evaluation
stage's output. If it does not contain any Markdown files, the substage outputs
`[]`.

If there is a changed Markdown file, the substage starts by replacing the
spaces in the evaluation stage's output with new line characters via the [`tr`](https://en.wikipedia.org/wiki/Tr_(Unix))
command. At this point, if the
[Changing Google Docs' Default Styles](https://hkamran.com/article/changing-google-docs-default-styles)
and [Adding Wildcard Subdomain Support to macOS](https://hkamran.com/article/adding-wildcard-subdomain-support-macos)
articles were edited, the output would be the following.

```text
markdown/articles/2022-04-19-changing-google-docs-default-styles.md
markdown/articles/2023-01-13-adding-wildcard-subdomain-support-macos.md
```

To convert this into a path, the `markdown/`, date, and file extension have to go.
The [workflow accomplishes this](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L39)
by using [`sed`](https://www.gnu.org/software/sed/manual/sed.html#Introduction),
a stream editor "used to perform basic text transformations on an input stream
(a file or input from a pipeline)". By passing the `-E` flag, `sed` enables extended
regular expressions, a full description of which can be found in the [documentation](https://www.gnu.org/software/sed/manual/sed.html#ERE-syntax).
The output is now as follows.

```text
articles/changing-google-docs-default-styles
articles/adding-wildcard-subdomain-support-macos
```

Two more steps remain before finishing the Markdown compilation. One of those steps
is to change `articles` (the folder name) to `article` (the path name), which the
workflow does through [another `sed` expression](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L40).
The last step is to convert the output to a JSON array. The workflow takes advantage
of GitHub Actions' [included software](https://github.com/actions/runner-images/blob/main/images/linux/Ubuntu2204-Readme.md#tools),
specifically [`jq`](https://stedolan.github.io/jq/), a self-described "`sed` for
JSON data" to do this. It [passes two flags](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L41):
`-R`, which tells `jq` to not parse the input as JSON, and the `-c`, which minifies
the output. In addition to the two flags, the workflow also passes a filter:
[`'split(" ")'`](https://stedolan.github.io/jq/manual/#split(str)), which `jq`
interprets as splitting the input on the spaces. The final output is the following.

```json
["/article/changing-google-docs-default-styles","/article/adding-wildcard-subdomain-support-macos"]
```

#### JSON Compilation

The second substage, which deals with the `contents.json` file, is a lot more complicated.
As with the Markdown substage, this substage first checks the evaluation stage's
output to see if the `contents.json` file was updated. If it was not, it outputs
an empty JSON array.

If it was updated, the [substage begins](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L60-L66)
by installing [`jd`](https://github.com/josephburnett/jd), a Go command-line utility
and library for diffing and patching JSON and YAML files, through SupplyPike Engineering's
[`setup-bin` action](https://github.com/supplypike/setup-bin). The workflow then
[outputs the previous commit's version](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L72)
of the `contents.json` file, and [compares it to the current version](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L73)
using `jd`'s `patch` diff format, which is based upon [IETF RFC 6902](https://datatracker.ietf.org/doc/html/rfc6902).
The substage uses the `patch` format because it outputs a JSON array with objects
to describe each change. To parse this array, `jq` is [called](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L74)
with the `.[].path` filter, which gets all the JSON paths that were changed. For
example, if I were to change the
[Generate TypeScript Declaration Files for JavaScript Files](https://hkamran.com/article/generate-typescript-declarations-js-files)
title from `Generate TypeScript Declaration Files for JavaScript Files` to
`Generate TypeScript Declaration Files for JS Files`, `jd` would output the following.

```json
[{"op":"test","path":"/articles/4/title","value":"Generate TypeScript Declaration Files for JS Files"},{"op":"remove","path":"/articles/4/title","value":"Generate TypeScript Declaration Files for JS Files"},{"op":"add","path":"/articles/4/title","value":"Generate TypeScript Declaration Files for JavaScript Files"}]
```

And `jq` would then extract the `path` key from each object, returning the following.

```text
"/articles/4/title"
"/articles/4/title"
"/articles/4/title"
```

The next step that the substage does is to remove any duplicates, leaving only one
entry. The substage uses [`awk`](https://www.gnu.org/software/gawk/manual/gawk.html)
to do this, using the [`! seen[$0]++` rule](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L75).
In the example, using this rule results in the following.

```text
"/articles/4/title"
```

After this, the substage strips the quotes [using `tr`](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L76),
then [extracts the path](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L77)
to the object in the `articles` or `notes` array using [`cut`](https://en.wikipedia.org/wiki/Cut_(Unix)).
These two commands change the `awk` output to the following.

```text
articles/4
```

To convert this path into a `jq` filter, [two `sed` commands are used](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L78-L79),
which converts the above path to the following.

```text
.articles | nth(4) .id
```

This filter tells `jq` to open the `articles` object, find the fourth object, and
output the ID. The next part [iterates over each filter](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L80),
if there are multiple. It uses a [`while read` function](https://linuxhint.com/while_read_line_bash/)
to do so. The first command in the loop is [`jq` using the generated filter](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L81),
which outputs the following.

```text
"generate-typescript-declarations-for-js-files"
```

After `jq`, `tr` [strips the quotes](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L82),
followed by a [nested set of `sed` and `awk` commands](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L83-L87).
These commands take the generated filter (stored in the `filter` variable), extract
the base object (in this case, it's `articles`), then convert it to a path prefix,
then prefix the path with a slash, to make it compatible with the Next.js revalidation
function. Finally, just like the Markdown substage, the substage takes all the IDs,
and [runs them through](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L89)
`jq`'s `split` filter, which outputs the following.

```json
["/article/generate-typescript-declarations-for-js-files"]
```

This is not the end of the JSON compilation substage, however. There are two secondary
tasks that run concurrently with the primary task. One of these tasks is to update
all pages where the hero image (also known as a thumbnail) and the publish date
are shown. This does the exact same thing as the primary task, but has two differences.
The first difference is that there is a [filter is in place](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L101-L103)
to make sure only entries where the `heroImage` or `published` elements have changed
are added, and the [second](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L115)
is to add the [homepage](https://hkamran.com) and the [articles page](https://hkamran.com/articles).

The other secondary task is to update the tag pages. This has a [filter](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L128-L130)
for the hero image, publish date, and tags, as well as generating a
[list of changed tag pages](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L136-L138).

### Merge Stage

The third stage is the merge stage, which merges the four arrays of paths: Markdown,
JSON, JSON (hero image and publish dates), and JSON (tags). The stage uses `jq`,
[passing in the arrays](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L183-L186)
via the [`--argjson` parameter](https://stackoverflow.com/a/42576771/7313822). The
`-n`, or `--null-input` flag, is also passed, and it tells `jq` to use `null` as
the input. It's useful when constructing JSON data from scratch. Finally, a
[filter is passed](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L187)
which merges the four arrays, then uses the [`unique` filter](https://stedolan.github.io/jq/manual/#unique,unique_by(path_exp))
to remove duplicate paths.

### Revalidation Stage

The final stage is the revalidation stage, where the paths are sent to the Next.js
for revalidation. This stage does not run if the output of the merge stage is an
empty JSON array. In terms of the logic, it's quite simple. It [outputs](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L200)
the merge stage's output, [runs it through `jq`](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L201)
to get each path on a different line, then [iterates over each line](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L202)
to use [`cURL`](https://curl.se/) to [make a `POST` request](https://github.com/hkamran80/articles/blob/main/.github/workflows/revalidate.yml#L203)
to the revalidation API route with the appropriate header and secret key.

## Conclusion

If you have any questions or need any help, feel free to contact me on
[Twitter](https://twitter.com/hkamran80) or [Mastodon](https://vmst.io/@hkamran).

If you have any improvements to any of my articles, notes, or this revalidation
workflow, please [submit a pull request](https://github.com/hkamran80/articles#contributions).

Thank you for reading!
