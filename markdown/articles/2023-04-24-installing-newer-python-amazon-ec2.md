I recently worked on a Python project that used Python 3.11 and Poetry. When I went
to deploy it on [Amazon's Elastic Compute Cloud](https://aws.amazon.com/ec2/), better
known by its moniker EC2, I ran to a major hurdle. EC2, running Amazon Linux 2,
had Python 3.7.11. The project required 3.11, so I was forced to figure out a way
to install it.

## Dependencies

I needed to build Python from source, so I started by updating packages
in [`YUM`](https://en.wikipedia.org/wiki/Yum_(software)), the package manager for
Red Hat Enterprise Linux, CentOS, Fedora, and Amazon Linux 2, repositories with
`sudo yum update`. Then I installed some development dependencies, namely the aptly-named
"Development Tools" group and a few others, with the following.

```bash
sudo yum groupinstall "Development Tools"
sudo yum install libffi-devel bzip2-devel
```

One more dependency is needed: OpenSSL. If one was to try and install the `openssl-devel`
package, they would be installing 1.0.7, but Python 3 currently requires 1.1.1 or
newer. To install this version, `openssl-devel` must be uninstalled first, then
replaced with `openssl11-devel`.

```bash
sudo yum uninstall openssl-devel
sudo yum install openssl11-devel
```

## Compilation

With the development dependencies installed, the next step was to download Python's
source code. The Python Software
Foundation^[Learn more about the PSF on [their website](https://www.python.org/psf-landing/)]
maintains tarballs of every Python version released, and they've made them available
through [this user-friendly page](https://www.python.org/downloads/source/) or
[their plain directory listing](https://www.python.org/ftp/python/). Either way,
find the Python version your project needs, then download the file that ends in
`.tgz`, which is the gzipped tarball. With the link to the Python source in hand,
I downloaded it with `wget`, then extracted the archive.

```bash
sudo wget https://www.python.org/ftp/python/3.11.1/Python-3.11.1.tgz
sudo tar xzf Python-3.11.1.tgz
cd Python-3.11.1
```

Next, run the `configure` script, which will check to ensure that the necessary
dependencies are installed: `sudo ./configure --enable-optimizations`. The `--enable-optimizations`
flag optimizes the binary. After that finishes, there will be a `Makefile`. Before
proceeding, decide whether this new version should replace the system version, or
if it should be installed alongside. I recommend the latter, and that's what I used.
If you decided to replace the system version, use `sudo make install`. If you decided
to install it alongside, use `sudo make altinstall`. On my [t2.micro instance](https://aws.amazon.com/ec2/instance-types/t2/),
it took about 35 minutes to build.

## Shell Configuration

You might find yourself disappointed if you tried to run `python3.11`, or whatever
your version is. Python installs to `/usr/local/bin`, but Amazon Linux 2 doesn't
have that path in the `PATH` by default. Add the following to the end of the `.bashrc`
file to add the directory to the `PATH`.

```bash
export PATH=/usr/local/bin:$PATH
```

Reload the `.bashrc` file by running `source ~/.bashrc`, then test Python. Because
I used the alongside method, I used `python3.11` instead of `python3` as the executable.

## Conclusion

If you have any questions or need any help, feel free to contact me on
[Twitter](https://twitter.com/hkamran80) or [Mastodon](https://vmst.io/@hkamran).

If you have any improvements to any of my articles or notes, please
[submit a pull request](https://github.com/hkamran80/articles#contributions).

Thank you for reading!
