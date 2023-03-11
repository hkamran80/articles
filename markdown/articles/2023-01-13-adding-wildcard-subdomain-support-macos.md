For several years now, I've been using IP addresses and ports to access services
that I run on my home server. However, I decided it was time to switch to using
a domain instead. I had heard about [Traefik](https://traefik.io/traefik/) and [Caddy](https://caddyserver.com/)
in [r/HomeServer](https://www.reddit.com/r/HomeServer/) and [r/homelab](https://www.reddit.com/r/homelab/)
and chose to try out Traefik, mainly because it had native support for Docker labels.

The first few steps involved installing Traefik with Docker, adding HTTPS support
through Let's Encrypt, and reconfiguring my web containers to use it. The next step
was to add a [dnsmasq](https://en.wikipedia.org/wiki/Dnsmasq) rule to my [Pi-hole](https://pi-hole.net/)
so that all requests would be redirected to the subdomain I chose (I used `servername.mydomain.com`
as the base host in Traefik). However, on my Mac, I'm not always using my Pi-hole's
DNS, usually when I need to circumvent the ad-blocking. I accomplish this through
macOS' native support for [network locations](https://support.apple.com/en-us/HT202480).

After doing a bit of research, I found out I could use dnsmasq on my Mac to do accomplish
wildcard subdomains, just like I did on the Pi-hole, but it worked wonderfully once
I got it to work.

I used [Homebrew](https://brew.sh/) to install and configure dnsmasq:
`brew install dnsmasq`. I then opened the configuration file for dnsmasq from its
place in `/usr/local/etc/dnsmasq.conf` and added the line below. If you changed
the location of your Homebrew install, run `brew --prefix`, then replace `/usr/local`
with the value.

```text
address=/servername.mydomain.com/10.90.100.1
```

This line configures the routing, and redirects all requests made to
`servername.mydomain.com` and its subdomains to `10.90.100.1`. Make sure to replace
`10.90.100.1` with the IP you want to redirect to. If you're interested in knowing
why dnsmasq redirects all redirects to both the base domain and its subdomains to
the IP, [this Stack Overflow answer](https://stackoverflow.com/a/37449551/7313822)
explains why.

To start dnsmasq, run `sudo brew services start dnsmasq`. Homebrew will handle autostarting
the daemon and ensuring it stays alive. I found this to be simpler than the common
method of copying the Homebrew launch daemon [plist](https://en.wikipedia.org/wiki/Property_list)
to `/Library/LaunchDaemons` and manually telling `launchctl` to load it.

If you were to try running a command such as `ping` to see if your wildcard subdomain
redirection worked, you'd be sorely disappointed, because there are two more steps.
Create a folder in `/etc` named `resolver`, and place a file in there. The file
can be named anything, but I like to use the hostname of my computer. In that file,
add `nameserver 127.0.0.1`. This tells macOS' DNS resolution to use your new dnsmasq
as a DNS server. For example, I would run `sudo mkdir /etc/resolver`, then
`sudo bash -c 'echo "nameserver 127.0.0.1" > /etc/resolver/my-computer-hostname'`.
Verify that the entry was added with `scutil --dns`. An output similar to the following
should be shown.

```text
resolver #8
  domain   : my-computer-hostname
  nameserver[0] : 127.0.0.1
  flags    : Request A records, Request AAAA records
  reach    : 0x00030002 (Reachable,Local Address,Directly Reachable Address)
```

After that, add the DNS server to macOS via the Network panel in System Preferences
or the Wi-Fi panel in System Settings. If your Mac is running Ventura or newer,
click "Details", otherwise click "Advanced". Then, navigate to the "DNS" tab. Click
the plus button and type in `127.0.0.1` and then hit enter. For more information
on `127.0.0.1`, check out [its Wikipedia article](https://en.wikipedia.org/wiki/Localhost).
Back to System Preferences, click the OK button, then click Apply. If you're running
Ventura or newer, just click the OK button and it will save and apply the settings.
Once the icon is disabled and greyed out, flush your DNS cache. You can do that
with `sudo dscacheutil -flushcache` and `sudo killall -HUP mDNSResponder`. Now,
try your `ping` command again, and you should get a response. If it does, try accessing
the service through your browser.

If you have any questions or need any help, feel free to contact me on
[Twitter](https://twitter.com/hkamran80) or [Mastodon](https://vmst.io/@hkamran).

I hope that this article is useful for you! Thank you for reading!
