I recently read Josh Müller's post on [subscribing to Mailchimp newsletters with RSS](https://joshmuller.ca/writings/2023/subscribe-to-mailchimp-newsletters-with-rss/).
I was inspired to make a utility, similar to [my Duck Compose utility](/utilities/duck-compose), that makes it as simple as pasting a URL to subscribe with RSS.

> As far as I can tell, every Mailchimp email list has a corresponding RSS feed associated with it.
> It's not always easy to find, but it seems like it's always there… even if you need to dig a little bit for it.
>
> ...
>
> There are 3 pieces we need in order to find this list’s RSS feed, and all of them we can find in this URL:
>
> 1. `us11` - This appears to be the Mailchimp *server location* associated with the mailing list's account
> 2. `u=00722345fc94fb4d4b323edc3` - I think this is a *user identification* code? Not sure. We need it, though!
> 3. `id=4ff553ba3e` - Again, not 100% sure what this is; possibly a *list id*? We need it too, regardless ¯\_(ツ)_/¯

My utility, creatively named ["Mailchimp RSS"](/utilities/mailchimp-rss), converts the `list-manage.com` profile and subscribe URLs to a `campaign-archive.com` feed URL by following Josh's instructions.
