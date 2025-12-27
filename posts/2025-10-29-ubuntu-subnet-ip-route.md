I recently set up a WireGuard VPN through my UDM Pro but was unable to connect to two of my servers.
My only clue to the issue was that they were both running Ubuntu Server, as the other machines I was able to access were running macOS.
After a week of trial and error (monkeying around UFW, iptables, and the general networking stack), I stumbled upon an Ask Ubuntu question, [ubuntu server not accepting connections from subnets](https://askubuntu.com/questions/1076372/ubuntu-server-not-accepting-connections-from-subnets), which had the same problem as I.

The answer, as described in that post, was to manually add an IP route.
My VPN clients are connected on the `192.168.2.0/24` subnet while I use a `10.90.100.0/24` subnet for my main network.
By default, Ubuntu tries to access the gateway for the `192.168.2.0` subnet at `192.168.2.1`, but since the gateway is actually `10.90.100.1`, all requests from my WireGuard clients were failing.

```bash
sudo ip route add 192.168.2.0/24 via 10.90.100.1
```

However, because this is not persistent through restarts, I also added it to my Netplan configuration.

```yaml
routes:
    - to: default
      via: 10.90.100.1
    - to: 192.168.2.0/24
      via: 10.90.100.1
```

For more information, check out [Netplan's routing documentation](https://netplan.readthedocs.io/en/stable/netplan-yaml/#routing).

After adding the route, it started working instantly.
Hopefully this will help someone save time debugging why their VPN clients are failing to connect to specific devices.
