If you're on macOS, you'll first need to upgrade OpenSSH, which I've detailed in a
[separate article](https://hkamran.com/article/upgrade-openssh-macos).

Plug in your security key, then generate a `ed25519-sk` or `ecdsa-sk` public key.
The `-sk` stands for "security key". If your YubiKey is running firmware version
5.2.3 or newer, use the `ed25519-sk` key type. Otherwise, use the `ecdsa-sk` key
type.

Additionally, choose whether you want to use the security key as a resident key,
or a non-resident key. A resident key stores the private key on the security key,
which may not be supported by all security keys and may also be limited in capacity
(the YubiKey 5 series is limited to 25 — [source](https://docs.yubico.com/hardware/yubikey/yk-5/tech-manual/yk5-apps.html#fido2)).
A resident key can also reduce the security of your SSH key if the security key
is stolen. Ensure you have a good PIN set. A non-resident key requires you to send
the key to the hosts you would like to authenticate to.

To generate a non-resident key, use one of the following:

```bash
ssh-keygen -t ed25519-sk -f ~/.ssh/ed25519_sk
```

```bash
ssh-keygen -t ecdsa-sk -f ~/.ssh/ecdsa_sk
```

To generate a resident key, use one of the following:

```bash
ssh-keygen -t ed25519-sk -O resident -f ~/.ssh/ed25519_sk
```

```bash
ssh-keygen -t ecdsa-sk -O resident -f ~/.ssh/ecdsa_sk
```

The `-f` parameter tells `ssh-keygen` to store the key in a specific place.

If you generated a non-resident key, use `ssh-copy-id` to transfer the key to the
host you would like to access:

```bash
ssh-copy-id -i ~/.ssh/key-name user@host
```

## Usage

To connect to one of your hosts after sending your SSH key over, use `ssh` with
the `-i` option.

```bash
ssh -i ~/.ssh/key-name user@host
```

You should see a message like the following:

```text
Confirm user presence for key ED25519-SK SHA256:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Click the button on your security key. Then, you should see "User presence confirmed",
at which point you should be logged in.

## Conclusion

If you have any questions or need any help, feel free to contact me on
[Twitter](https://twitter.com/hkamran80) or [Mastodon](https://vmst.io/@hkamran).

If you have any improvements to any of my articles or notes, please
[submit a pull request](https://github.com/hkamran80/articles#contributions).

Thank you for reading!
