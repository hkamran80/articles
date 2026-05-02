For the last couple of years, my website was built in either Vue.js or Next.js.
Both of them are JavaScript frameworks that either require JavaScript to be enabled or deliver heavy websites.
I also got tired of working with them and wanted to try something new, so I redesigned my website in Astro.

[Astro](https://astro.build) is also a JavaScript framework, but it can generate much lighter websites that do not require JavaScript.
I first learned about it by reading a Cloudflare blog post on optimizing their documentation site.

My hope for this redesigned site is more frequent updates, whether it's on the new [now](/now) or [ideas](/ideas) pages, new [posts](/posts), new [bill analyses](/bill-analyses), or whatever it may be.
I want to start writing more, which was another piece of inspiration to rebuild this website because [content collections](https://docs.astro.build/en/guides/content-collections/) are making it easier for me to have draft posts.
I also finally implemented branch-based posts (using different branches for draft posts without requiring any merges to the main branch), which should make it easier to write.

One of the changes I made was simplifying the routes.
On the Next.js site, I had separate singular and plural paths for different things.
For example, my posts were divided into articles and notes, which used `/articles` and `/notes` for the indexes and `/article/` and `/note/` for the individual posts.
On the Astro site, I'm now using `/posts` across the board.
Same thing goes for tags: previously, I used `/tags` and `/tag/`, now everything uses `/tags`.

This required updating my comments system, [Giscus](https://giscus.app), which I have configured to match based on pathname, so I figured that updating the discussions with the new pathnames would be enough.
Nope.
I forgot that I had [`data-strict`](https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md#data-strict) enabled, which uses a SHA-1 hash of the discussion title (the pathname) in the discussion body.
After updating the hash, it just worked.

The feeds are now generated during the website build, so they are once again available on the main domain, rather than a subdomain.
I kept the post IDs the same, so hopefully feed readers pick it up properly.
In addition to the posts feed, there is now a [bill analyses](/bill-analyses) feed for my new bill analyses.
I also added a dedicated page for my [web feeds](/feeds).

I also updated the font.
I previously used Nunito Sans for everything, but I recently began finding it too spacious.
I settled on [Fustat](https://fonts.google.com/specimen/Fustat) after a bit of searching.

Because I'm not using a heavy JavaScript framework anymore, I was able to tighten up my Content Security Policy more than I previously could.

This site also now uses Shiki...which you probably won't be able to tell at the time of writing because [Shiki is not CSP-compatible](https://github.com/shikijs/shiki/issues/671), unless you turn on `unsafe-inline`.
However, because I'm using Astro's CSP which [always includes hashes](https://github.com/withastro/astro/issues/14798), it doesn't work at the moment.

I've also moved back to Netlify for hosting because of Vercel's support for [war criminals](https://dbushell.com/2025/10/02/not-my-cup-of-tea) and [fascism](https://dbushell.com/2025/09/22/cost-of-freedom).

I added a photos page instead of just linking out to Unsplash.
