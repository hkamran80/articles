import { readFile } from "fs/promises";
import writings from "../markdown/contents.json" assert { type: "json" };

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
    const { title, description, tags } = writings[`${type}s`].find(
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