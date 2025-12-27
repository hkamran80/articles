# Article Process

## Definitions

- `ID` is the preliminary article ID
- `type` is either `article` (long-form with hero image) or `note` (short-form)

Replace any contents in square brackets (`[]`) with the appropriate variable as defined.

## Process

1. Create a branch named `new-[type]/[ID]`.
2. Amend `index.json` with [a post object](./posts.schema.json#L9-L118).

    ```json
    {
      "id": "[ID]",
      "title": "[Preliminary article title]",
      "description": "[Preliminary article description]",
      "tags": [],
      "type": "[type]",
      "status": "draft"
    }
    ```

    The `title` and `description` properties should be set to the preliminary title and description.
    The `tags` array should be populated with a list of tags that best matches the post.

3. Commit and make a PR.

   Title it `Add draft [type]: [brief description]`.
   Assign the PR the `new [type]` label.

   *See:* [PR #67](https://github.com/hkamran80/articles/pull/67) — Add the unpublished GDPR article

5. Create a branch named `[type]/[ID]` off `main`.
6. Create a file in `posts` named `[ID].md` with the initial content.
7. Commit and push.
8. Merge the new draft post PR.
9. Create a draft PR for the post branch with the `new [type]` label titled `Add final [type]: [brief description]`.
10. Write the post.
11. Upon completion, rebase atop `main` and update `index.json` with the final post object.
12. If the post is an article, design an image and upload to assets.
13. Merge the PR and announce.

## Schema Property Order

1. `id`
2. `title`
3. `description`
4. `tags`
5. `type`
6. `status`
7. `published` (if applicable)
8. `updated` (if applicable)
9. `imgAlt` (if applicable)
10. `toc` (optional)
11. `oldNotice` (optional)
12. `filename` (optional)
13. `branch` ()
