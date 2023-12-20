If you want to access your Home Assistant instance outside your local network, you
have a few options. You could use the insecure method of port-forwarding port 8123
or whatever port you use, you could expose Nginx or Traefik or something and use
that as a proxy, or you could sign up for Nabu Casa's subscription service. But what
about Cloudflare Tunnels?

## Prerequisites

Before we begin, there are two things you'll need.

1. A Cloudflare account
2. A domain linked to that Cloudflare account

## Set up the tunnel

### Create the tunnel

The first step is to connect the tunnel from your server to Cloudflare. Create a
new tunnel, if you have not already done so, in the [Zero Trust dashboard](https://one.dash.cloudflare.com)
by going to Access > Tunnels. Give your tunnel a name that means something to you.
You will be the only one to see it in this dashboard. Next, select how you're setting
up the tunnel. This guide will assume you are using the Docker method with Compose.
Copy the `docker run` command — we will need it in a second. This is the important
part: routing traffic. Enter the domain and subdomain, then select the type of service.
Since this is for Home Assistant, set the type to `HTTP`. Assuming that you followed
[the instructions on setting Home Assistant up with Compose](https://www.home-assistant.io/installation/alternative/#docker-compose),
your container's `network_mode` is `host`. Therefore, the service URL is `127.0.0.1:8123`.

### Connect the tunnel

In your `docker-compose.yml` or `compose.yml` file that you are using for Home Assistant,
add a new container for Cloudflare. Make sure to replace `[your token here]` with
the token from the `docker run` command you copied earlier.

```yaml
tunnel:
  image: cloudflare/cloudflared:latest
  depends_on:
    - home-assistant
  environment:
    TZ: "America/Los_Angeles" # Replace this with your timezone
  restart: unless-stopped
  command: tunnel --no-autoupdate run --token [your token here]
  network_mode: host # Required if your `network_mode` for Home Assistant is `host`
```

Once the Compose file has been updated, run `docker compose up -d` or the equivalent
in whatever container system is running on your system. This will pull the `cloudflared`
container, then establish a tunnel to Cloudflare. If all is well, you should be able
to reload the Zero Trust dashboard and see that the tunnel status is "healthy". Try
visiting your site in a new tab and confirm it works.

## Secure the tunnel

At this point, your tunnel is set up and you can use Home Assistant from outside
your network. But this is very insecure.

There are two parts to this step. Part one allows connections from any browser or
device, as long as it is not the mobile apps. Part two allows connections exclusively
from the mobile apps.[^1] For the best experience, follow both parts.

### Part One: Cloudflare Access

Cloudflare Access is part of the Zero Trust offering. It is designed to secure apps
by placing an identity portal in front. To configure it, go to the Zero Trust dashboard,
then Access > Applications. Click "Add an application", then select the "Self-hosted"
option. The application name will only visible to people who visit the public URL.
For example, I set the name to "Home Assistant". The domain and subdomain must match
the values set for the tunnel. Click "Next" to advance to the policy configuration
page.

The policy configuration page is where you configure the accessibility. If you have
previously created Access Groups (more on that later), you can select those here.
Regardless, enter a policy name, then add your rules. For example, you may want to
only allow users who have specific emails or are in the United States. Under the
"Include" section, set the selector to "Emails", then add comma-separated emails
in the value field. Then click "Add require" (you could also do "Add include"), set
the selector to "Country", then select the United States from the dropdown in the
value field.

Finally, click "Next" and then "Add application". Your Home Assistant instance is
now secured. Try visiting your site again from your normal browser window and from
a private window.

The downside to using Access is that the Home Assistant mobile apps cannot handle
it right now, but there is another way.

### Part Two: mTLS Certificates

[mTLS certificates](https://www.cloudflare.com/learning/access-management/what-is-mutual-tls/),
or mutual TLS certificates, are a way of securely connecting to services without
credentials. Cloudflare has support for this, but not through the Zero Trust dashboard.

To get started, one change needs to be made to the tunnel configuration. Go to Access
\> Tunnels, and select the tunnel you created earlier and click the "Configure" button.
Select the "Public Hostname" tab and click "Add a public hostname". The service options
should be set to the same thing you have set for the existing hostname. I recommend
using the same domain and subdomain as the main hostname with `-mobile` added to
the subdomain. For example, if the main subdomain is `ha`, then use `ha-mobile` as
the subdomain for this hostname.

Next, go to the main Cloudflare dashboard and open [the Client Certificates page](https://dash.cloudflare.com/?to=/:account/:zone/ssl-tls/client-certificates)
(under SSL/TLS). Click "Create Certificate". Ensure the private key type is set to
"RSA (2048)". I left the certificate validity at 10 years. Click "Create".

Ensure the key format is `PEM`, then copy the certificate into a file called `cf-client.pem`,
and the private key into `cf-client.key`. You can change these filenames, but do
not change the extensions. You will not be able to see this certificate again from
the dashboard. Click "OK". Under the "Hosts" header, click the "Edit" button next
to "None", then type in the new URL you created for the tunnel. For example,
`ha-mobile.yourdomain.com`. Click "Save".

Now that the certificate has been created, it needs to be transferred to a device
running the mobile app. But before that, it needs to be converted into a format that
the OS can read. This format is a `PFX` file, a [PKCS #12](https://en.wikipedia.org/wiki/PKCS_12)
archive. Assuming your computer has OpenSSL installed, it's trivial to generate a
`PFX` file. In the same directory as the `.pem` and `.key` files you created earlier,
run the following command:

```bash
openssl pkcs12 -export -out cf-client.pfx -inkey cf-client.key -in cf-client.pem
```

A prompt for an export password will appear. Android failed to install the `PFX`
I originally generated without a password, so make sure to add one. After that, you
should have a `PFX` file, ready to be installed! Transfer it securely to your device,
then install it. Just tapping it is enough to install it. Enter the export password
you created, then select "VPN & app user certificate" in the pop-up. Your certificate
is now installed and ready for usage!

Open the Home Assistant mobile app and set your external URL (the "Home Assistant
URL") to the URL you set up for mTLS authentication. If you are connected to your
local network, disconnect. You should now be able to use Home Assistant outside your
local network!

## Conclusion

If you have any questions, need any help, or have any suggestions, feel free to contact
me on [Twitter](https://twitter.com/hkamran80) or [Mastodon](https://vmst.io/@hkamran),
or leave a comment.

If you have any improvements to any of my articles or notes, please
[submit a pull request](https://github.com/hkamran80/articles#contributions).

[^1]: Part two has only been tested on Android, and this guide reflects that.
