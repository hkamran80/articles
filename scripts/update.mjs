import { slugify } from "@hkamran/utility-strings";
import { exec } from "child_process";
import { promisify } from "util";

/**
 * Executes a shell command and returns the result as a Promise.
 * @typedef {Object} ExecResult
 * @property {string} stdout - The standard output from the command.
 * @property {string} stderr - The standard error from the command.
 */

/**
 * @typedef {Object} Post A post from the repository
 * @property {string} id The post ID
 * @property {string} title The post title
 * @property {string} description The post description
 * @property {string[]} tags The post tags
 * @property {string} published The post published time
 * @property {string} [updated] The post updated time
 * @property {string} filename The Markdown filename of the post
 * @property {string} [branchName] The branch the post is on, should only be set for unpublished posts
 */

/**
 * @typedef {Object} PostWithoutID A post from the repository without an ID
 * @property {string} title The post title
 * @property {string} description The post description
 * @property {string[]} tags The post tags
 * @property {string} published The post published time
 * @property {string} [updated] The post updated time
 * @property {string} filename The Markdown filename of the post
 * @property {string} [branchName] The branch the post is on, should only be set for unpublished posts
 */

/**
 * @typedef {Object} PostDifferenceSummary A post from the repository with an ID and tags only
 * @property {string} id The post ID
 * @property {string[]} tags The post tags
 * @property {string} published The post published time
 */

/**
 * The path to the `contents.json` file
 * @constant {string}
 */
const CONTENTS_FILE = "markdown/contents.json";

/**
 * A promise version of `exec`
 *
 * @param {string} command The command to run
 * @return {Promise<ExecResult>} A promise of the result
 */
const execAsync = promisify(exec);

/**
 * Get a list of changed files
 *
 * @return {Promise<string[]>} Changed Markdown and JSON files
 */
const getChangedFiles = async () => {
    try {
        const { stdout } = await execAsync("git diff --name-only HEAD^ HEAD");
        if (!stdout) process.exit(1);

        const files = stdout.split("\n").filter(Boolean);

        const relevantFiles = files.filter(
            (file) =>
                file.startsWith("markdown/articles/") ||
                file.startsWith("markdown/notes/") ||
                file.endsWith(".json"),
        );

        return relevantFiles;
    } catch (error) {
        console.error("Error getting changed files:", error);
        process.exit(1);
    }
};

/**
 * Safely parse a JSON string
 *
 * @param {string} jsonString The JSON string
 * @return {Object|Array|null} The JSON or `null`
 */
const safeParse = (jsonString) => {
    try {
        return JSON.parse(jsonString);
    } catch {
        return null;
    }
};

/**
 * @typedef {Object} ArrayDifferenceChanges Changes between two arrays
 * @property {string} id The post ID
 * @property {PostWithoutID} old The old post
 * @property {PostWithoutID} new The new post
 */

/**
 * @typedef {Object} ArrayDifferences Differences between two arrays
 * @property {Post[]} added The additions
 * @property {Post[]} removed The removals
 * @property {ArrayDifferenceChanges} changed The changes
 */

/**
 * Check for differences in two post arrays
 *
 * @param {Post[]} oldPosts The old posts array
 * @param {Post[]} newPosts The new posts array
 * @return {ArrayDifferences} The differences in the arrays
 */
const diffPostArrays = (oldPosts, newPosts) => {
    const oldPostMap = new Map(oldPosts.map((item) => [item.id, item]));
    const newPostMap = new Map(newPosts.map((item) => [item.id, item]));

    const added = [];
    const removed = [];
    const changed = [];

    // Added and modified items
    for (const [id, newItem] of newPostMap) {
        if (!oldPostMap.has(id)) {
            added.push({ id: newItem.id, ...newItem });
        } else {
            const oldItem = oldPostMap.get(id);
            if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
                changed.push({
                    id,
                    old: { id: oldItem.id, ...oldItem },
                    new: { id: newItem.id, ...newItem },
                });
            }
        }
    }

    // Removed items
    for (const [id, oldItem] of oldPostMap) {
        if (!newPostMap.has(id)) {
            removed.push({ id: oldItem.id, ...oldItem });
        }
    }

    return { added, removed, changed };
};

/**
 * Check if the last published article has changed
 *
 * @param {Post[]} oldArticles The old articles array
 * @param {Post[]} newArticles The new articles array
 * @return {boolean} Whether the last published article has changed
 */
const checkLastPublishedArticle = (oldArticles, newArticles) => {
    const oldPublishedArticles = oldArticles.filter(
        (article) => article.published !== "",
    );
    const newPublishedArticles = newArticles.filter(
        (article) => article.published !== "",
    );

    const oldLastPublishedArticle =
        oldPublishedArticles[oldPublishedArticles.length - 1];
    const newLastPublishedArticle =
        newPublishedArticles[newPublishedArticles.length - 1];

    if (!oldLastPublishedArticle || !newLastPublishedArticle) return false;

    if (oldLastPublishedArticle.id !== newLastPublishedArticle.id) return true;

    return false;
};

/**
 * @typedef {Object} JsonChanges
 * @property {PostDifferenceSummary[]} articles The articles that have been modified in some way
 * @property {PostDifferenceSummary[]} notes The notes that have been modified in some way
 * @property {boolean} lastPublishedArticleChanged Whether the last published article has changed
 */

/**
 * Get the changed posts from the contents file
 *
 * @returns {Promise<JsonChanges>} The changes from the contents file
 */
const getContentsChanges = async () => {
    try {
        const { stdout: oldContent } = await execAsync(
            `git show HEAD^:${CONTENTS_FILE}`,
        );
        const { stdout: newContent } = await execAsync(
            `git show HEAD:${CONTENTS_FILE}`,
        );

        const oldJson = safeParse(oldContent);
        const newJson = safeParse(newContent);

        if (!oldJson || !newJson)
            throw new Error("Failed to parse JSON content.");

        const articlesDiff = diffPostArrays(oldJson.articles, newJson.articles);
        const notesDiff = diffPostArrays(oldJson.notes, newJson.notes);

        const articleARChanges = ["added", "removed"]
            .map((change) => articlesDiff[change])
            .flatMap((changes) =>
                changes.map((article) => ({
                    id: article.id,
                    tags: article.tags,
                    published: article.published,
                })),
            );
        const articleModifications = articlesDiff["changed"].flatMap(
            (change) => ({
                id: change.id,
                tags: [...new Set([...change.old.tags, ...change.new.tags])],
                published: change.published,
            }),
        );

        const noteARChanges = ["added", "removed"]
            .map((change) => notesDiff[change])
            .flatMap((changes) =>
                changes.map((note) => ({
                    id: note.id,
                    tags: note.tags,
                    published: note.published,
                })),
            );
        const noteModifications = notesDiff["changed"].flatMap((change) => ({
            id: change.id,
            tags: [...new Set([...change.old.tags, ...change.new.tags])],
            published: change.published,
        }));

        const lastPublishedArticleChanged = checkLastPublishedArticle(
            oldJson.articles,
            newJson.articles,
        );

        return {
            articles: [...articleARChanges, ...articleModifications],
            notes: [...noteARChanges, ...noteModifications],
            lastPublishedArticleChanged,
        };
    } catch (error) {
        console.error(
            `Error analyzing JSON changes for ${CONTENTS_FILE}:`,
            error,
        );
        process.exit(2);
    }
};

/**
 * Get the website path for a Markdown file
 *
 * @param {string} filename A Markdown file path, starting with `markdown/`
 * @returns {string} A site path
 */
const getSitePath = (filename) => {
    const [_, folder, file] = filename.split("/");
    return `/${folder.slice(0, -1)}/${file.slice(11).slice(0, -3)}`;
};

async function main() {
    const files = await getChangedFiles();

    let paths = new Set(
        files
            .filter((file) => file.endsWith(".md"))
            .map((file) => getSitePath(file)),
    );

    if (files.includes(CONTENTS_FILE)) {
        const changes = await getContentsChanges();
        const articleCount = Object.keys(changes.articles).length;
        const noteCount = Object.keys(changes.notes).length;

        if (
            articleCount > 1 ||
            (articleCount === 1 && changes.articles[0].published !== "")
        )
            paths.add("/articles");

        changes.articles.forEach((article) => {
            paths.add(`/article/${article.id}`);

            if (article.published !== "")
                article.tags.forEach((tag) =>
                    paths.add(`/tag/${slugify(tag)}`),
                );
        });

        if (
            noteCount > 1 ||
            (noteCount === 1 && changes.notes[0].published !== "")
        )
            paths.add("/notes");
        changes.notes.forEach((note) => {
            paths.add(`/note/${note.id}`);

            if (note.published !== "")
                note.tags.forEach((tag) => paths.add(`/tag/${slugify(tag)}`));
        });

        if (changes.lastPublishedArticleChanged) paths.add("/");
    }

    const sortedPaths = [...paths].sort();
    const request = await fetch(
        `https://hkamran.com/api/revalidate?path=${sortedPaths.join(",")}`,
        {
            method: "POST",
            headers: new Headers({
                "x-api-key": process.env.REVALIDATION_TOKEN,
            }),
        },
    );

    console.log(request.status);
    console.log(await request.json());

    if (!request.ok) process.exit(3);
}

await main();
