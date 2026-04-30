Up until a few months ago, I had been using a self-hosted instance of [ChangeDetection.io](https://changedetection.io)
to monitor sites like Home Assistant, Troy Hunt, FedScoop's Login.gov tag, and a few FOIA requests
on MuckRock for new entries. ChangeDetection was not the best solution for me as it lacked a good
filter system and it was somewhat tedious to keep up with the many changes that websites receive on
a regular basis. For example, Cloudflare changed their press releases page to use Astro and changed
some class names which broke my ChangeDetection monitor.

## My Reader of Choice

One thing I noticed as I was browsing through my monitors is that many had an RSS or Atom feed, so
I started looking into RSS readers. I came across a few in [awesome-selfhosted](https://awesome-selfhosted.net/tags/feed-readers.html)
and ended up going with FreshRSS after I read [Neil's blog post about FreshRSS CSS selectors](https://neilzone.co.uk/2024/05/using-css-selectors-in-freshrss-to-automatically-retrieve-the-full-text-of-partial-text-rss-feeds).

### Setup

It was pretty easy to set up, thanks to [their documentation](https://freshrss.github.io/FreshRSS/en/).
I created a Docker Compose file based on their [Docker instructions](https://github.com/FreshRSS/FreshRSS/tree/edge/Docker),
then deployed it.

One additional benefit for me is that it supports [OpenID Connect](https://freshrss.github.io/FreshRSS/en/admins/16_OpenID-Connect.html),
which allowed me to tie the account management into my self-hosted single-sign-on solution,
[Authentik](https://goauthentik.io). This took a bit of trial and error to configure, but I was able
to set it up after looking at the [`mod_auth_openidc`](https://github.com/OpenIDC/mod_auth_openidc)
repository.

My Compose file ended up like this (some elements have been removed and the environment variables
have been placed into the `environment` object):

```yaml
services:
  freshrss:
    image: freshrss/freshrss:latest
    restart: unless-stopped
    environment:
      CRON_MIN: 1,31
      FRESHRSS_ENV: development

      OIDC_ENABLED: 1
      OIDC_PROVIDER_METADATA_URL: https://auth.mydomain.com/application/o/freshrss/.well-known/openid-configuration
      OIDC_CLIENT_ID: replacethis
      OIDC_CLIENT_SECRET: replacethis
      OIDC_X_FORWARDED_HEADERS: X-Forwarded-Port X-Forwarded-Proto X-Forwarded-Host
      OIDC_CLIENT_CRYPTO_KEY: replacethis
      OIDC_REMOTE_USER_CLAIM: preferred_username
      OIDC_SCOPES: openid email profile
    volumes:
      - ./data:/var/www/FreshRSS/data
      - ./extensions:/var/www/FreshRSS/extensions
    labels:
      caddy: freshrss.mydomain.com
      caddy.reverse_proxy: "{{upstreams 80}}"
```

### Configuration

After deploying the service, I went about configuring FreshRSS to my liking. For example, I switched
to the Dark theme by AD and enabled API access. Once configured, I moved all the monitors I could
from ChangeDetection to FreshRSS. I was able to move almost all of them over, with the exceptions
being Firefox addons, Cloudflare and GSA press releases, and a few White House categories, like
Presidential Actions.

<!-- NOTE: Should the exceptions be linked? -->

## Updating My Feeds

After adding [my own feed](https://assets.hkamran.com/website/feed.atom), I realized how incomplete
it was in comparison to others. It also required a site rebuild to update the feeds, something that
I don't do regularly. Instead, I moved the feed generation to my assets repository, where I store
a lot of the content that my site uses.

The main changes I made were [adding the tags](https://github.com/hkamran80/assets/blob/9eccfec156e9db6375a714d464a6630f25a59e93/lib/feed.js#L68)
from my posts to the feeds, fixing the image links in RSS feeds by using an enclosure instead of
`feed`'s [string-to-enclosure method](https://github.com/jpmonette/feed/blob/8ca7f3e4e8e421e2a2632bb9524385e86f30744c/src/rss2.ts#L215-L223),
and then updating the JSON feeds to [use a string for the `image` property](https://github.com/hkamran80/assets/blob/9eccfec156e9db6375a714d464a6630f25a59e93/lib/feed.js#L88-L91).

I also removed the feed generation from my site and updated all the links.
