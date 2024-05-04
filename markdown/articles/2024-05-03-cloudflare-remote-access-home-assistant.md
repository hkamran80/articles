If you want to access your Home Assistant instance outside your local network, you
have a few options. You could try port-forwarding port 8123 or whatever port you
use, expose your reverse proxy, or you could sign up for Nabu Casa's subscription
service. But what about Cloudflare Tunnels?

## Prerequisites

Before we begin, there are two things you'll need:

1. A Cloudflare account
2. A domain linked to that Cloudflare account

## Set up the tunnel

### Create the tunnel

First, connect the tunnel from your server to Cloudflare. If you have not already
done so, create a new tunnel in the [Zero Trust dashboard](https://one.dash.cloudflare.com)
by going to Networks > Tunnels. Give your tunnel a name that means something to you
(only you will be able to see it in this dashboard). Select the Docker tab and copy
the `docker run` command because we will need it in a second. Next, let's configure
traffic routing from the tunnel to the service. Enter the domain and subdomain, then
select the type of service. Since this is for Home Assistant, set the type to `HTTP`.
Assuming that you followed [the instructions on setting Home Assistant up with Compose](https://www.home-assistant.io/installation/alternative/#docker-compose),
your Home Assistant container's `network_mode` is `host`, therefore, the service
URL should be `host.docker.internal:8123`.

### Connect the tunnel

Because this guide assumes you are using Docker Compose, add a new service for the
tunnel connector in your `compose.yml` or `docker-compose.yml` file that you are
using for Home Assistant. Make sure to replace `[your token here]`
with the token from the `docker run` command you copied earlier.

```yaml
tunnel:
  image: cloudflare/cloudflared:latest
  command: tunnel --no-autoupdate run --token [your token here]
  depends_on:
    - homeassistant # or whatever the Home Assistant service (not the container name!) is named in the Compose file
  environment:
    TZ: "[your timezone]"
  restart: always
  extra_hosts:
    - "host.docker.internal:host-gateway" # Required to use `host.docker.internal`
```

Once the Compose file has been updated, run `docker compose up -d` or the equivalent
in whatever container system is running on your system. This will pull the `cloudflared`[^1]
image and then establish a tunnel to Cloudflare. If all is well, you should be able
to reload the Zero Trust dashboard and see that the tunnel status is healthy. Try
visiting your site in a new tab and see if it is accessible. If you get a 400 Bad
Request error, you may need to update the [`http.trusted_proxies` array](https://www.home-assistant.io/integrations/http/#reverse-proxies)
in your `configuration.yaml` file. For more information on `host.docker.internal`,
check out [this Stack Overflow answer](https://stackoverflow.com/a/72828318).

## Secure the tunnel

At this point, your tunnel is set up and you can use Home Assistant from outside
your network, but right now it is very insecure.

There are two parts to this step. Part one allows connections from any browser or
device, as long as it is not the mobile apps. Part two allows connections exclusively
from the mobile apps. For the best experience, follow both parts.

### Part One: Cloudflare Access

Cloudflare Access is part of Cloudflare's Zero Trust offering. It is designed to
secure apps by placing an identity portal in front. To configure it, go to the Zero
Trust dashboard, then Access > Applications. Ensure you have configured an identity
provider in Settings > Authentication first. Click "Add an application", then select
the "Self-hosted" option. Choose an application name, and be aware that this will
be visible to those who visit the public URL. I set mine to "Home Assistant". After
that, enter the same domain and subdomain that you configured for the tunnel. Then
click "Next" to advance to the policy configuration page.

The policy configuration page is where you configure who can access the site. If
you have previously created [Access Groups](https://developers.cloudflare.com/cloudflare-one/identity/users/groups/),
you can select those here. Regardless of whether you use a group or not, you still
have to enter a policy name and add your rules. For example, I configured my policies
to only allow users who have specific emails and are in the United States. I did
this by going to the "Include" section, setting the selector to "Emails", then adding
comma-separated emails in the value field. I then added a "Require" rule that ensures
the visitor is in the U.S.

Finally, click "Next" and then "Add application". Your Home Assistant instance is
now secured. Try visiting your site again from a normal browser window and also from
a private window.

The downside to using Access is that the Home Assistant mobile apps cannot handle
it right now,[^2] but there is another way to secure the tunnel and allow the mobile
apps to work.

### Part Two: mTLS Certificates

[mTLS certificates](https://www.cloudflare.com/learning/access-management/what-is-mutual-tls/),
or mutual TLS certificates, are a way of securely connecting to services without
credentials. Cloudflare has support for this through the Zero Trust dashboard, but
that requires an Enterprise plan. Instead, we will use their client certificates
offering.

> [!NOTE]  
> The iOS companion app does not support mTLS. See the discussion in [#1788](https://github.com/home-assistant/iOS/discussions/1788)
> and the comment from Franck Nijhof (one of the Home Assistant maintainers) on
> [PR #2144](https://github.com/home-assistant/iOS/pull/2144#issuecomment-1992395096)
> for more information.

To get started, one change needs to be made to the tunnel configuration. Go to Access
\> Tunnels, and select the tunnel you created earlier and click the "Configure" button.
Under the "Public Hostname" tab, add another hostname. The service options should
be set to the same thing you have set for the existing hostname. I recommend using
the same domain and subdomain as the main hostname with `-mobile` added to the subdomain.
For example, if the main subdomain is `ha`, then use `ha-mobile` as the subdomain
for this hostname.

Next, go to the main Cloudflare dashboard and open the [Client Certificates page](https://dash.cloudflare.com/?to=/:account/:zone/ssl-tls/client-certificates)
(under SSL/TLS). Click "Create Certificate" and ensure the private key type is set
to "RSA (2048)". I left the certificate validity at 10 years. Then create the certificate.

Ensure the key format is `PEM`, then copy the certificate into a file called `cf-client.pem`,
and the private key into `cf-client.key`. You can change these filenames, but I recommend
keeping the extensions. **Make sure you make a backup** as you will not be
able to see this certificate again. Under the "Hosts" header, click the "Edit" button
next to "None", then type in the second URL you created for the tunnel, e.g.
`ha-mobile.yourdomain.com`. Click "Save". This ensures that the subdomain can be
used with mTLS.

Now that the certificate has been created, it needs to be transferred to a device
running the mobile app. But before that, it needs to be converted into a [PKCS #12](https://en.wikipedia.org/wiki/PKCS_12)
(`PFX`) archive. Assuming your computer has OpenSSL installed, it's easy to generate
a `PFX` file. In the same directory as the `.pem` and `.key` files you created earlier,
run the following command, replacing `cf-client.key` and `cf-client.pem` with your
filenames:

```bash
openssl pkcs12 -export -out cf-client.pfx -inkey cf-client.key -in cf-client.pem
```

A prompt for an export password will appear. Android failed to install the `PFX`
I generated without a password, so make sure to add one. After that, you should have
a `PFX` file that is ready to be installed. Transfer it securely to your device and
install it by tapping the file. Enter the export password you created, then select
"VPN & app user certificate" in the pop-up. Your certificate is now installed and
ready for use.

Open the Home Assistant app, select your server, and set your external URL (the
"Home Assistant URL") to the URL you set up for mTLS authentication. If you are
connected to your local network, disconnect and try accessing Home Assistant. You
should be able to use Home Assistant outside your local network now.

## Conclusion

If you have any questions, need any help, or have any suggestions, feel free to contact
me on [Twitter](https://twitter.com/hkamran80), [Mastodon](https://vmst.io/@hkamran),
or [Bluesky](https://bsky.app/profile/hkamran.com), or leave a comment.

If you have any improvements to any of my articles or notes, please leave a comment
or [submit a pull request](https://github.com/hkamran80/articles#contributions).

[^1]: The name `cloudflared` comes from the Unix tradition of naming servers with a "-d" suffix standing for "daemon". (text adapted from [Cloudflare](https://blog.cloudflare.com/workerd-open-source-workers-runtime))

[^2]: The Home Assistant maintainers have rejected all attempts to add additional authentication methods to the companion app, as evidenced by [PR #3510](https://github.com/home-assistant/android/pull/3510#issuecomment-1927928037), [PR #4160](https://github.com/home-assistant/android/pull/4160#issuecomment-1927929682), [PR #2144](https://github.com/home-assistant/iOS/pull/2144#issuecomment-1992395096) and [issue #167](https://github.com/home-assistant/android/issues/167#issuecomment-566918860). The official guidance from them is to use a browser instead.
