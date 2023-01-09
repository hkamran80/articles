For several years now, I've been using IP addresses and ports to access services
that I run on my home server. However, I wanted to access my services via a domain
instead. I had heard about [Traefik](https://traefik.io/traefik/) and [Caddy](https://caddyserver.com/)
in [r/HomeServer](https://www.reddit.com/r/HomeServer/) and [r/homelab](https://www.reddit.com/r/homelab/)
and chose to try out Traefik, mainly because it had native support for Docker labels.

After installing Traefik with Docker, adding HTTPS support through Let's Encrypt,
and then reconfiguring my web containers to use it, I added a [dnsmasq](https://en.wikipedia.org/wiki/Dnsmasq)
rule to my [Pi-hole](https://pi-hole.net/) to redirect all requests to the subdomain
I chose (I used `servername.mydomain.com` as the base host in Traefik). However,
on my Mac, I'm not always using my Pi-hole's DNS, usually when I need to circumvent
the ad-blocking. I accomplish this through macOS' native support for
[network locations](https://support.apple.com/en-us/HT202480).

After doing a bit of research, I realized I could use dnsmasq on my Mac to do accomplish
wildcard subdomains, just like I did on the Pi-hole. It took a few tries to set
it up properly, but once set up, it worked wonderfully.

I used [Homebrew](https://brew.sh/) to install and configure dnsmasq:
`brew install dnsmasq`. Then, I opened the configuration file for dnsmasq from its
place in `/usr/local/etc/dnsmasq.conf`. If you changed the location of your Homebrew
install, run `brew --prefix`, then replace `/usr/local` with the value.

I added one line to the bottom:

```text
address=/servername.mydomain.com/10.90.100.1
```

This line actually configures the routing, and redirects all requests made to
`servername.mydomain.com` and its subdomains to `10.90.100.1`. Make sure to replace
`10.90.100.1` with the IP you want to redirect to. If you're interested in why
dnsmasq redirects all redirects to both the base domain and its subdomains to the
IP, [this Stack Overflow answer](https://stackoverflow.com/a/37449551/7313822) explains
why.

To start dnsmasq, run `sudo brew services start dnsmasq`. Homebrew will handle autostarting
the daemon and ensuring it stays alive. I found this to be easier than the method
that most solutions I found used: copying the Homebrew launch daemon [plist](https://en.wikipedia.org/wiki/Property_list)
to `/Library/LaunchDaemons` and manually telling `launchctl` to load it.

If you were to try running a command such as `ping` to see if your wildcard subdomain
redirection worked, you'd be sorely disappointed, because there's one more step.
I found it easiest to use the GUI for this. Open the Network panel in System Preferences,
click "Advanced", and go to the "DNS" tab. Click the plus button and type in `127.0.0.1`
and then hit enter. For more information on `127.0.0.1`, check out
[its Wikipedia article](https://en.wikipedia.org/wiki/Localhost). Back to System
Preferences, click the OK button, then click Apply. Once the icon is disabled and
greyed out, flush your DNS cache. You can do that with
`sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`. Now, try your
`ping` command again, and you should get a response. If it does, try accessing the
service through your browser.

If you have any questions or need any help, feel free to contact me on
[Twitter](https://twitter.com/hkamran80) or [Mastodon](https://vmst.io/@hkamran).

I hope that this article comes in handy for you. Thank you for reading!
