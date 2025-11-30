I started by installing Podman from Ubuntu's repositories, but the latest version is 3.4.4.
As I wanted to use [Quadlets](https://www.redhat.com/en/blog/quadlet-podman), I needed [version 4.4 (released in February 2023)](https://blog.podman.io/2023/02/podman-v4-4-buildah-v1-29-released/).

I decided to install Podman with [Homebrew](https://brew.sh): `brew install podman`.
At the time of writing, Homebrew has Podman 5.7.0.
The first issue I ran into was that Podman's systemd generator wasn't picking up my Quadlets in [rootless mode](https://github.com/containers/podman/blob/main/docs/tutorials/rootless_tutorial.md).
I came across [a bug report](https://github.com/containers/podman/issues/17679) in the Podman repository that described the same problem and a solution: missing symlinks.
I manually symlinked `/home/linuxbrew/.linuxbrew/opt/podman/libexec/podman/quadlet` to `/usr/lib/systemd/system-generators/podman-system-generator` and `/usr/lib/systemd/user-generators/podman-user-generator`.
My Quadlets were now being picked up, but then I was getting an error from systemd when I ran `systemctl --user start`.

The systemd error was because Podman was reporting `could not find a working conmon binary`.
After trying (and failing) to get Podman to pick up the `conmon` binary by placing a [`containers.conf` file](https://github.com/containers/common/blob/main/docs/containers.conf.5.md) in [`$HOME/.config/containers/containers.conf`](https://docs.podman.io/en/latest/markdown/podman.1.html#configuration-files), I symlinked the binary from Homebrew's path (`/home/linuxbrew/.linuxbrew/bin/conmon`) to `/usr/local/bin`:

```bash
sudo ln -s $(which conmon) /usr/local/bin/conmon
```

I reloaded the daemon, stopped the service, and started it again, only to get another error: `could not find pasta, the network namespace can't be configured: exec: "pasta": executable file not found in $PATH`.
I symlinked the `pasta` binary to `/usr/local/bin` as well:

```bash
sudo ln -s $(which pasta) /usr/local/bin/pasta
```

After reloading the daemon and restarting the service, it worked!
I hope this helps someone else installing Podman onto a Ubuntu LTS system.
