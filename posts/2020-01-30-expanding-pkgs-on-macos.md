*Photo by: [seth schwiet](https://unsplash.com/@schwiet?utm_source=hkamran&amp;utm_medium=referral)
on [Unsplash](https://unsplash.com?utm_source=hkamran&amp;utm_medium=referral)*

Let's say you're on a computer where you don’t have administrative access, but you
really need to use this one piece of software. In my case, this was Apple’s SF Symbols
app. There’s a pretty simple way to extract the payload from the package (.PKG).

To get started, you first need two things. A macOS-equipped computer and a DMG with
a PKG inside, or just a PKG. This tutorial will detail both.

## Extracting the Package Contents

**If your PKG is inside a DMG, start here**

To extract the payload from a PKG inside a DMG, we need to mount the DMG. There
are two ways to do this. You can either use the Finder (double-click the DMG to
mount it) or use the terminal with the following command: `hdiutil attach [path
to your DMG]`. For example, `hdiutil attach ~/Downloads/SF\ Symbols.dmg`.

**PKG Extraction**

Now is where we have to use the terminal. In your terminal, navigate to the folder
just above where you want your PKG to be extracted. An example command is as follows:
`cd ~/Documents`.

You can then proceed to extract the PKG with:
`pkgutil --expand-full [package toPKG] [folder to extract to]`. For example,
`pkgutil --expand-full /Volumes/SFSymbols/SF\ Symbols.pkg extracted_package`.

The contents of the PKG are now available in the `extracted_package` folder. With
the `SF Symbols.pkg` extracted, it has three directories: `Distribution` and `Resources`,
`SFSymbols.pkg`.

The content of the PKG is stored in the (in my case) `SFSymbols.pkg` folder.

The folder hierarchy of the Payload folder (`extracted_package/[package name]/Payload`)
is very simple. The directories are the places to put the files. For example, the
directory `Applications` has `SF Symbols.app`, because that needs to be put in the
Applications folder on your computer.

Once you have extracted the Payload, you can eject the volume (if you are using
a DMG) or delete the PKG, as you no longer need it.
