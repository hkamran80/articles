I wanted to use my [YubiKey](https://www.yubico.com/products/) for [SSH](https://en.wikipedia.org/wiki/Secure_Shell)
authentication, however, to implement [FIDO2](https://fidoalliance.org/fido2/) credential
support, I needed OpenSSH 8.2 or newer. Unfortunately, macOS Big Sur ships with
OpenSSH 8.1.

To solve this problem, I used [Homebrew](https://brew.sh/) to install a newer version
of OpenSSH, version 9.2 at the time of writing: `brew install openssh`. After the
installation completed, I disabled macOS' default `ssh-agent`:

```bash
launchctl disable user/$UID/com.openssh.ssh-agent
```

Next, I added my own launch agent at `~/Library/LaunchAgents/com.hkamran.ssh_agent.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.hkamran.ssh_agent</string>

    <key>ProgramArguments</key>
    <array>
        <string>sh</string>
        <string>-c</string>
        <string>/usr/local/bin/ssh-agent -D -a ~/.ssh/agent</string>
    </array>

    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
```

The `-D` option passed to `ssh-agent` prevents it from forking, and the `-a ~/.ssh/agent`
tells `ssh-agent` to bind to `~/.ssh/agent`.

I also added the following line to my `.zshrc` file, which ensures that the bind
address is set to `~/.ssh/agent`.

```bash
SSH_AUTH_SOCK="~/.ssh/agent"
```

Finally, either open a new shell (new tab, new window, etc.) or type `exec $SHELL`
which relaunches the shell. Run `ssh -V` or `which ssh` to check that you are using
the new version from Homebrew.

## Continuation

If you'd like to read about how to use FIDO2 SSH keys, I've written a
[companion article](https://hkamran.com/article/fido2-ssh-keys) on the topic.

## Conclusion

If you have any questions or need any help, feel free to contact me on
[Twitter](https://twitter.com/hkamran80) or [Mastodon](https://vmst.io/@hkamran).

If you have any improvements to any of my articles or notes, please
[submit a pull request](https://github.com/hkamran80/articles#contributions).

Thank you for reading!
