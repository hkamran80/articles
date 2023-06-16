import { exec as cpExec } from "child_process";
import { promisify } from "util";
import writings from "../markdown/contents.json" assert { type: "json" };
import { readFile } from "fs/promises";

const exec = promisify(cpExec);

/**
 * Execute simple shell command (async wrapper).
 * @param {String} cmd
 * @return {Object} { stdout: String, stderr: String }
 */
async function execIgnoreErrors(cmd) {
    return new Promise(function (resolve, reject) {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                resolve({ stdout, stderr });
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

/**
 * Generate a "slugified" version of a string
 *
 * Strips a string of non-alphanumeric characters, and replaces spaces with dashes
 *
 * Source: [@hkamran80/utilities-js](https://github.com/hkamran80/utilities-js/blob/main/packages/strings/index.js#L30-L41)
 * @param {string} string - The string to "slugify"
 * @returns {string} The "slugified" string
 */
export const slugify = (string) =>
    string
        .replace(/[^A-Za-z0-9\s]/gm, "")
        .replace(/ /gm, "-")
        .toLowerCase();

const markdownChanges = (
    await exec(
        "git diff --name-only --diff-filter=ACMRT ${{ github.sha }}^1 ${{ github.sha }} | grep .md$ | grep '^markdown/' | xargs"
    )
).stdout;

const deletedMarkdown = (
    await exec(
        "git diff --name-only --diff-filter=D ${{ github.sha }}^1 ${{ github.sha }} | grep .md$ | grep '^markdown/' | xargs"
    )
).stdout;

const jsonChanges = (
    await exec(
        "git diff --name-only --diff-filter=ACMRT ${{ github.sha }}^1 ${{ github.sha }} | grep .json$ | xargs"
    )
).stdout;

const paths = new Set();

if (markdownChanges) {
    for (let file of markdownChanges.trim().split("\n")) {
        const [type, id] = file
            .replace(/(^markdown\/)|(.md$)|(([0-9]{4}-([0-9]{2}-){2}))/g, "")
            .split("/");

        paths.add(`/${type.slice(0, type.length - 1)}/${id}`);
    }
}

if (deletedMarkdown) {
    await exec(
        "git show ${{ github.sha }}^1:markdown/contents.json > contents.old.json"
    );

    for (let file of deletedMarkdown.trim().split("\n")) {
        const [type, id] = file
            .replace(/(^markdown\/)|(.md$)|(([0-9]{4}-([0-9]{2}-){2}))/g, "")
            .split("/");

        paths.add(`/${type.slice(0, type.length - 1)}/${id}`);
        paths.add(`/${type.slice(0, type.length - 1)}s`);
        paths.add("/");

        const oldWritings = JSON.parse(
            (await readFile("contents.old.json")).toString()
        );
        oldWritings[type]
            .find(({ id: writingId }) => writingId === id)
            .tags.forEach((tag) => paths.add(`/tag/${slugify(tag)}`));
    }
}

if (jsonChanges) {
    const changes = JSON.parse(
        (
            await execIgnoreErrors(
                "git show ${{ github.sha }}^1:markdown/contents.json | jd -f patch markdown/contents.json"
            )
        ).stdout
    );

    [
        ...new Set(
            changes.map((change) =>
                change.path.split("/").slice(1, 4).join("/")
            )
        ),
    ]
        .map((change) => {
            const split = change.split("/");
            const [type, index] = split;

            const revalidateList = [];
            if (split.length > 2) {
                const extra = split[2];
                if (!["filename", "branchName"].includes(extra)) {
                    revalidateList.push(
                        "/",
                        "/articles",
                        ...writings[type][index].tags.map(
                            (tag) => `/tag/${slugify(tag)}`
                        )
                    );
                }
            }

            revalidateList.push(
                `/${type.slice(0, type.length - 1)}/${writings[type][index].id}`
            );

            return revalidateList;
        })
        .forEach((revalidation) => {
            if (Array.isArray(revalidation)) {
                for (let revalidatePath of revalidation) {
                    paths.add(revalidatePath);
                }
            } else {
                paths.add(revalidation);
            }
        });
}

console.log(paths);

const request = await fetch(
    `https://hkamran.com/api/revalidate?path=${[...paths].sort().join(",")}`,
    {
        method: "POST",
        headers: new Headers({ "x-api-key": process.env.REVALIDATION_TOKEN }),
    }
);

console.log(request.status)
console.log(await request.json())