# Article Process

## Definitions

- `ID` is the preliminary article ID

## Process

1. Create a branch named `new-article/ID`.
2. Amend the `contents.json` file in the `markdown` directory with a post object.

    ```json
    {
      "id": "ID",
      "title": "Preliminary article title",
      "description": "Preliminary article description",
      "tags": [],
      "published": "",
      "filename": "ID",
      "branchName": "article/ID"
    }
    ```

    The `title` and `description` properties should be set to the preliminary title and description.
    The `tags` array should be populated with a list of tags that best matches the article. The
    `published` property should be empty.

3. Commit that change and make a PR, but do not merge it yet.

   Assign the PR the `new-article` label and title it something along the lines of `Add the unpublished [brief description] article`.

   *See:* [PR #67](https://github.com/hkamran80/articles/pull/67) — Add the unpublished GDPR article

5. Create a branch named `article/ID` off `main`.
6. Create a file in `markdown/articles` named `ID.md` with the starting content.
7. Commit that file and push.
8. Merge the new article PR.
9. Create a draft PR for the article branch with the `new article` label.

   This allows for changes to be propagated to the site so they can be viewed.

10. Upon article completion, rebase atop `main` and update `contents.json` with the final post object.
11. Design an article image and upload to assets.
12. Merge the PR and announce.
