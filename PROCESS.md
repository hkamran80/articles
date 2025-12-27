# Article Process

## Definitions

- `ID` is the preliminary article ID
- `type` is either `article` (long-form with hero image) or `note` (short-form)

Replace any contents in square brackets (`[]`) with the appropriate variable as defined.

## Process

1. Create a branch named `new-[type]/[ID]`.
2. Amend the `contents.json` file in the `markdown` directory with [a post object](markdown/posts.schema.json#L9-L118).

    ```json
    {
      "id": "[ID]",
      "title": "Preliminary article title",
      "description": "Preliminary article description",
      "tags": [],
      "type": "[type]",
      "status": "draft"
    }
    ```

    The `title` and `description` properties should be set to the preliminary title and description.
    The `tags` array should be populated with a list of tags that best matches the article.

3. Commit and make a PR.

   Assign the PR the `new-[type]` label and title it `Add the unpublished [brief description] [type]`.

   *See:* [PR #67](https://github.com/hkamran80/articles/pull/67) — Add the unpublished GDPR article

5. Create a branch named `[type]/[ID]` off `main`.
6. Create a file in `markdown/[type]s` named `[ID].md` with the initial content.
7. Commit and push.
8. Merge the new post PR.
9. Create a draft PR for the post branch with the `new [type]` label.
10. Upon completion, rebase atop `main` and update `contents.json` with the final post object.
11. If the post is an article, design an image and upload to assets.
12. Merge the PR and announce.
