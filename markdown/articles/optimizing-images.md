As a maintainer of the [2FA Directory](https://2fa.directory) and the [Passkeys Directory](https://passkeys.2fa.directory),
I submit and review many pull requests to keep our content up-to-date. To do so, I have to ensure
that our SVGs and PNGs are as small as possible to ensure a quick loading time when a user visits
our sites. For both file types, my process starts by finding the logo. If I am reviewing a PR, I will
download the logo attached if it is suitable enough. If it is not or if I am submitting a PR, I find
the highest quality logo I can. I first try to find an SVG from the website or service, or failing
that, a source like Wikipedia/Wikimedia or some other brand logo repository. If I cannot find an SVG,
I will find a PNG.

## SVGs

For SVGs, I first check if there is padding. If so, I take the SVG into Inkscape, select the logo,
then use the Command+Shift+R (Control+Shift+R for non-macOS users) shortcut to crop the view box to
those dimensions. If there is not, I skip right to the next step.

My next step is to minify it as much as possible using [SVGOMG](https://jakearchibald.github.io/svgomg/).
I have all the global settings turned off, except for "Show original", which I use to compare the
minified SVG to the original input. I have every feature turned on except for "Remove xmlns", because
that breaks the rendering. If the colours are off or nonexistent, I also experiment with the "Remove
style elements" feature. The most common elements I play around with are the precision sliders. I
start with a transform precision of zero and a number precision of one. If that looks fine, I decrease
the number precision, check again and revert if necessary. If one is too low, I also raise the number
precision until the image is clear enough to be identifiable at a small size without any noticeable
blemishes (e.g. very flattened curves).

Finally, I manually check the generated markup for further minification after downloading it. I use
our [SVG test](https://github.com/2factorauth/twofactorauth/blob/868bc7dd3e8bca7d8d844eba13664ffb870cac6d/tests/svg.js#L57-L74)
as my guidelines. A `xml:space` declaration is the first to go, followed by `fill-opacity`, `style`
elements, and unnecessary `fill: #000` and `fill: #000000`.

## PNGs

PNGs are a lot simpler. After finding a logo that is high-resolution enough, I use Preview, macOS'
built-in document viewer, to crop it if need be and then resize it to an acceptable size. Our
[contribution guidelines](https://github.com/2factorauth/twofactorauth/blob/868bc7dd3e8bca7d8d844eba13664ffb870cac6d/CONTRIBUTING.md?plain=1#L17-L20)
have three sizes for PNGs: 32x32, 64x64, and 128x128. Once a logo is resized, I upload it to
[TinyPNG](https://tinypng.com) to compress it.
