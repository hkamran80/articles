As my servers run Ubuntu, I decided to implement the rules through [UFW](https://help.ubuntu.com/community/UFW), the Uncomplicated Firewall.
After doing some research, the general consensus seemed to be to use [IP sets](https://ipset.netfilter.org/) through `ipset`.

I installed `ipset` from `apt` with `apt install ipset`, then modified the script I found from [Me Forgetful](https://blog.miragewebstudio.com/2025/08/03/how-to-block-all-ips-from-a-specific-country/) to be more generic.
My [changes](https://github.com/hkamran80/sysadmin-utilities/blob/1a4a79cb9e5b861056781dc74c387608e6230a14/ufw-geoblocking/generate-country-ipset.sh) include specifying the [ISO-3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) country code to set the name and URL automatically[^1], using `flush` instead of `destroy`, and saving IP sets to `/var/lib/ipset`.

```diff
# --- Configuration ---
+ # The ISO-3166-1 alpha-2 code
+ COUNTRY=$1
# The name for our ipset
- IPSET_NAME="china"
+ IPSET_NAME="gb-country-$COUNTRY"
- # The URL to the China IP list from ipdeny.com
- IP_LIST_URL="http://www.ipdeny.com/ipblocks/data/countries/cn.zone"
+ # The URL to the IP list from ipdeny.com
+ IP_LIST_URL="https://www.ipdeny.com/ipblocks/data/countries/$COUNTRY.zone"
# Temporary file to store the downloaded list
TEMP_FILE="/tmp/${IPSET_NAME}.zone"
+ # Folder to write ipset save files to
+ IPSET_DIR="/var/lib/ipset"
# --- End Configuration ---
```

I used China as my test by running `./generate-country-ipset.sh cn` which successfully generated an IP set.
To see which IP sets exists, I used `sudo ipset -t list` (`-t` is the shorthand for `-terse`).

```
Name: gb-country-cn
Type: hash:net
Revision: 7
Header: family inet hashsize 4096 maxelem 65536 bucketsize 12 initval 0x138e1715
Size in memory: 257136
References: 6
Number of entries: 8702
```

Before I applied the IP set, I wanted to make sure that it would actually work. I used `curl` to make a request to `https://baidu.cn`.

```
*   Trying 39.156.70.37:443...
* Connected to baidu.cn (39.156.70.37) port 443
```

I then applied the rule using Me Forgetful's line, `sudo ufw insert 1 deny from "ipset:gb-country-cn"`, but received an error code: `ERROR: Bad source address`.
I did a search and found the still-open [Bug #1571579](https://bugs.launchpad.net/ufw/+bug/1571579): "Support for ipset".

To get around that, I found Niels Gandraß's [`ufw-ipset-blocklist-autoupdate`](https://github.com/ngandrass/ufw-ipset-blocklist-autoupdate).
His repository is designed to add arbitrary blocklists, but the `after.init` file, which UFW [runs during `ufw-init`](https://manpages.debian.org/bullseye/ufw/ufw-framework.8.en.html#BOOT_INITIALIZATION), applies IP sets from `/var/lib/ipset` that match a glob.
I [modified his `after.init`](https://github.com/hkamran80/sysadmin-utilities/blob/1a4a79cb9e5b861056781dc74c387608e6230a14/ufw-geoblocking/after.init) to use a different glob (`*.save` instead of `*-inet.save`) and to apply rules on both [the `INPUT` and `OUTPUT` chains](https://superuser.com/a/1267800).

```diff
start)
    for f in $savefiles; do
        # ...
        iptables -I INPUT -m set --match-set "$listname" src -j DROP
        iptables -I INPUT -m set --match-set "$listname" src -j LOG --log-prefix "[UFW BLOCK $listname] "
+       iptables -I OUTPUT -m set --match-set "$listname" dst -j DROP
+       iptables -I OUTPUT -m set --match-set "$listname" dst -j LOG --log-prefix "[UFW BLOCK $listname] "

# ...

stop)
    for f in $savefiles; do
        # ...
        iptables -D INPUT -m set --match-set "$listname" src -j DROP || true
        iptables -D INPUT -m set --match-set "$listname" src -j LOG --log-prefix "[UFW BLOCK $listname] " || true
+       iptables -D OUTPUT -m set --match-set "$listname" dst -j DROP || true
+       iptables -D OUTPUT -m set --match-set "$listname" dst -j LOG --log-prefix "[UFW BLOCK $listname] " || true
```

I ran `sudo ufw reload` then ran the `curl` command again.

```
*   Trying 39.156.70.37:443...
* connect to 39.156.70.37 port 443 failed: Connection timed out
*   Trying 220.181.7.203:443...
* After 85207ms connect time, move on!
* connect to 220.181.7.203 port 443 failed: Connection timed out
* Failed to connect to baidu.cn port 443: Connection timed out
* Closing connection 0
curl: (28) Failed to connect to baidu.cn port 443: Connection timed out
```

The UFW logs show corresponding entries:

```
[UFW BLOCK gb-country-cn] ... DST=39.156.70.37 LEN=60 TOS=0x00 PREC=0x00 TTL=64 ID=44931 DF PROTO=TCP SPT=46940 DPT=443 WINDOW=64240 RES=0x00 SYN URGP=0
[UFW BLOCK gb-country-cn] ... DST=220.181.7.203 LEN=60 TOS=0x00 PREC=0x00 TTL=64 ID=44931 DF PROTO=TCP SPT=46940 DPT=443 WINDOW=64240 RES=0x00 SYN URGP=0
```

Now that I knew the IP sets were working, I searched for a list of countries that host cybercrime in their borders.
I found a paper from Oxford, UNSW, Monash, and Sciences Po researches, [*Mapping the global geography of cybercrime with the World Cybercrime Index*](https://doi.org/10.1371/journal.pone.0297312), which contained a table of the top 15 countries on the World Cybercrime Index, "a global metric of cybercriminality organised around five types of cybercrime".

![The top 15 countries on the World Cybercrime Index](https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fjournals.plos.org%2Fplosone%2Farticle%2Ffigure%2Fimage%3Fsize%3Dlarge%26id%3D10.1371%2Fjournal.pone.0297312.t001)

The paper has a [complete list in the supporting information](https://doi.org/10.1371/journal.pone.0297312.s001).
I took the top 25 countries, excluded the U.S., UK, Germany, the Netherlands, and Canada, then ran the IP set generation script for each of the 20 countries.
I ran `sudo ufw reload` again and tested a domain from each country and all failed to connect with corresponding entries in the UFW logs.

I wrote [a script to regenerate](https://github.com/hkamran80/sysadmin-utilities/blob/1a4a79cb9e5b861056781dc74c387608e6230a14/ufw-geoblocking/regenerate-country-ipsets.sh) the country IP sets that can be run via a cron job that uses the save files in `/var/log/ipset`, and added it to my crontab to run every day at 03:00.

```sh
0 3 * * * /home/hkamran/networking/geoblocking/regenerate-country-ipsets.sh
```

## Resources

- [How to block all IPs from a specific country](https://blog.miragewebstudio.com/2025/08/03/how-to-block-all-ips-from-a-specific-country/) (Me Forgetful)
- Niels Gandraß, [`ufw-ipset-blocklist-autoupdate`](https://github.com/ngandrass/ufw-ipset-blocklist-autoupdate)
- Bruce, Miranda, Jonathan Lusthaus, Ridhi Kashyap, Nigel Phair, and Federico Varese. "Mapping the Global Geography of Cybercrime with the World Cybercrime Index." *PLOS ONE* 19, no. 4 (2024): e0297312. [https://doi.org/10.1371/journal.pone.0297312](https://doi.org/10.1371/journal.pone.0297312).

## See Also

- poddmo, [`ufw-blocklist`](https://github.com/poddmo/ufw-blocklist)

[^1]: The `gb` in the IP set name stands for "geoblock".
