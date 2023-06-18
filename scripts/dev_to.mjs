import { exec as cpExec } from "child_process";
import { promisify } from "util";
import { readFile } from "fs/promises";
import writings from "../markdown/contents.json" assert { type: "json" };

const exec = promisify(cpExec);

/**
 * Merge the paragraphs of a Markdown file
 *
 * Designed to undo [MD013](https://github.com/markdownlint/markdownlint/blob/main/docs/RULES.md#md013---line-length)
 * @param {string} postId The ID of the post (should match the `id` in `contents.json`)
 * @param {string} type Must match either `article` or `note`
 * @returns {Promise<string>} The merged paragraphs
 */
const mergeParagraphs = async (postId, type) => {
    const { filename } = writings[`${type}s`].find(({ id }) => id === postId);
    const file = await readFile(`markdown/${type}s/${filename}.md`);
    const lines = file.toString().split("\n");

    const indexes = [
        -1,
        ...lines.reduce((array, element, index) => {
            if (element === "") {
                array.push(index);
            }

            return array;
        }, []),
    ];

    return indexes
        .slice(1)
        .map((index) => {
            const paragraph = lines.slice(
                indexes[indexes.indexOf(index) - 1] + 1,
                index
            );

            if (
                !paragraph[0].trim().startsWith("```") &&
                !paragraph[0].trim().startsWith("[^") &&
                !paragraph[0].trim().startsWith("-")
            ) {
                return paragraph.join(" ");
            } else {
                return paragraph.join("\n");
            }
        })
        .join("\n\n");
};

/**
 * A list of tags to exclude from the front matter
 * @constant
 */
const excludedTags = ["Development", "Google Docs"];

/**
 * Generate front matter for a post
 * @param {string} postId The ID of the post (should match the `id` in `contents.json`)
 * @param {string} type Must match either `article` or `note`
 * @returns {string} The front matter for the given post
 */
const generateFrontMatter = (postId, type) => {
    const { title, description, tags } = writings[type].find(
        ({ id }) => id === postId
    );

    return `---
title: "${title}"
description: "${description}"
published: false
tags: ${tags.filter((tag) => !excludedTags.includes(tag)).join(",")}
canonical_url: https://hkamran.com/article/${postId}
cover_image: https://assets.hkamran.com/graphics/article/${postId}
---`;
};

const newFiles = (
    await exec(
        `git diff --name-only --diff-filter=A ${process.env.GITHUB_SHA}^1 ${process.env.GITHUB_SHA} | grep .md$ | grep '^markdown/' | xargs`
    )
).stdout;

if (newFiles.trim().replace("\n", "") !== "") {
    for (let file of newFiles.trim().split("\n")) {
        const [type, id] = file
            .replace(/(^markdown\/)|(.md$)|(([0-9]{4}-([0-9]{2}-){2}))/g, "")
            .split("/");

        const frontMatter = generateFrontMatter(id, type);
        const body = await mergeParagraphs(id, type.slice(0, type.length - 1));

        const content = `${frontMatter}\n\n${body}`;

        console.log(`Uploading ${id}...`);

        const request = await fetch("https://dev.to/api/articles", {
            method: "POST",
            headers: new Headers({
                "api-key": process.env.DEV_API_KEY,
                "Content-Type": "application/json",
            }),
            body: JSON.stringify({ article: { body_markdown: content } }),
        });

        console.log(request.status);
        if (request.ok) {
            console.log(`Uploaded ${id}!`);
        } else {
            console.error(`Error uploading ${id}.`);
            console.error(await request.json());
        }
    }
} else {
    console.log("No files to upload.");
}
