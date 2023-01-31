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

I added four stages to the workflow: evaluation, compilation, merging, and revalidation.
The evaluation stage determines if any files that would warrant a revalidation have
been updated. These include all the Markdown files in `markdown` folder or the
`contents.json` file, also in the Markdown folder.
