I was recently asked to create a series of visualizers and thumbnails for an ongoing series of YouTube videos. Given that I did not want to spend a lot of time retiming compositions, messing around wihh animations, or dealing with editing multiple text fields per render, I decided to automate the generation with TypeScript. My first task was to find a tool that would help me, so naturally, I did a search for "create a youtube video with javascript" (I used JavaScript because it tends to have more results than TypeScript, and most of the results are usually easy enough to convert to TypeScript). One of the results that drew my attention was a Fireship video titled ["This was video was made with code. But how?"](https://www.youtube.com/watch?v=deg8bOoziaE), which spotlighted [Remotion](https://www.remotion.dev/).

> The basic idea behind Remotion is that we'll give you a frame number and a blank canvas, and the freedom to render anything you want using React.js.
>
> *&mdash; Remotion*

Before we get started, just a heads up that I'm using [`pnpm`](https://pnpm.io) (**p**erformant **npm**), but you can use whatever package manager tickles your fancy.

First, I created the project using `pnpm create video`, as listed by Remotion's [Getting Started page](https://www.remotion.dev/docs). With the sample Hello World project ready, I opened it up in Visual Studio Code (my text editor of choice) via the interactive prompt's "open in VS Code" option.

## Configuration

Next, I opened the main files: `src/Video.tsx` and `src/HelloWorld.tsx`. I renamed the `HelloWorld.tsx` file to `Visualizer.tsx`, and removed both the preexisting code and the `HelloWorld` directory, leaving only a blank component.

At this point, I got annoyed with the base formatting (e.g. `import {Config} from 'remotion'` as opposed to `import { Config } from "remotion"`), and so I installed my personal Prettier config ([@hkamran/prettier-config](https://www.npmjs.com/package/@hkamran/prettier-config)), Prettier, and the [Prettier ESLint config](https://github.com/prettier/eslint-config-prettier) (`eslint-config-prettier`). I then renamed the `.eslintrc` file to `.eslintrc.json`, changed the `extends` key to a list, and added `prettier` to the list.

```json
{
    "extends": ["@remotion", "prettier"]
}
```

After that, I added ignore files for ESLint and Prettier (`.eslintignore` and `.prettierignore` respectively), which omitted the `node_modules` directory, the `.gitignore` file, and all Markdown files. I also added two package scripts, `lint` and `format` which ran ESLint and Prettier.

```json
"scripts": {
    "lint": "eslint --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier . --write"
}
```

## Visualizer

To create the visualizer, I created a layout using HTML and CSS in JSX. Now, to connect everything and make it dynamic.

### Changing the Duration

To set the duration of the video, you manually adjust the `durationInFrames` prop on the Remotion `Composition` component.

```tsx
<Composition
    id="visualizer"
    component={Visualizer}
    durationInFrames={FPS * 5} // FPS multiplied by the number of seconds, 5 seconds at 30 fps = 150 frames
    fps={FPS}
    width={1920}
    height={1080}
    defaultProps={{
        title,
        author,
        chapter,
        duration,
    }}
/>
```

*The variables `title`, `author`, and `chapter` are from a separate TypeScript file imported here.*

But how do you do make it so that the video's length dynamically changes based on the length of an audio file's duration? That's one problem solved, but how to solve the other two problems: loading the audio file and dynamically adjusting the duration? Remotion provides a `getAudioDurationInSeconds` function which is part of `@remotion/media-utils`. It takes a single parameter: the path to an audio file. It can use the source path from an `import` statement, a remote URL, or a static file on the system itself. To use a static file, which is what I did, you have to use the `staticFile` function, which allows you to load files from the `public` directory. I copied one of the audio files into the `public` directory, which I had to create, then used `await getAudioDurationInSeconds(staticFile("audio.mp3"))` to get the audio duration. Perfect, right? Well, no. TypeScript threw an error saying that `'await' expressions are only allowed within async functions and at the top levels of modules.`, and recommended that I change the `Video` component to be asynchronous. I did that, but then another error was thrown, this time saying that:

```text
Type '() => Promise<JSX.Element>' is not assignable to type 'FC<{}>'.
  Type 'Promise<Element>' is missing the following properties from type 'ReactElement<any, any>': type, props, key
```

This is because the `registerRoot` function (in `src/index.tsx`) takes a `React.FC<{}>`, but the asynchronous `Video` component was returning a `Promise`. So back to the drawing board. On Remotion's [Dynamic duration, FPS, & dimensions page](https://www.remotion.dev/docs/dynamic-metadata#change-metadata-based-on-asynchronous-information), I found the use of a `useEffect` hook, combined with a `delayRender` and a `continueRender` function from Remotion. I placed the `await getAudioDurationInSeconds(...)` function in the `useEffect` hook, and added a `handle` variable (based on the example provided), but it threw the same error regarding async functions and at the top levels of modules. React doesn't like `useEffect` hooks containing top-level asynchronous functions ([read more on Robin Wieruch's site](https://www.robinwieruch.de/react-hooks-fetch-data/)), so I wrapped it in a function and came up with the following:

```typescript
const [handle] = useState(() => delayRender());
const [duration, setDuration] = useState(1);

useEffect(() => {
    const getDuration = async () => {
        const duration = await getAudioDurationInSeconds(
            staticFile("audio.mp3"),
        );

        setDuration(duration);
        continueRender(handle);
    };

    getDuration();
}, [handle]);
```

Then, I was able to substitute the `durationInFrames` prop for `durationInFrames={FPS * (Math.ceil(duration) + 2)}` (the `+ 2` is there so that the video doesn't end immediately after the audio finishes).

### Connecting the Progress Bar

In the visualizer, there is a progress bar. But how would one go about connecting the progress bar to the duration? I passed the true duration through the `defaultProps` object via a key named `duration`, then set the progress bar's width to the seconds elapsed divided by the duration multiplied by 100 to get a percentage. To calculate the seconds elapsed, I utilized the `getCurrentFrame` function (provided by Remotion) to get the current frame, then divided that by the frames per second (which I saved as a constant integer in a separate file) to get the seconds elapsed. I stored that in a React `useState` variable with the following code:

```typescript
const frame = useCurrentFrame();

useEffect(() => {
    setSecondsElapsed(frame / FPS);
}, [frame]);
```

The progress bar code is as follows:

```jsx
<div
    style={{
        marginTop: "1rem",
        width: "100%",
        backgroundColor: "#4D4D4D",
        borderRadius: "60px",
        overflow: "hidden",
    }}
>
    <span
        style={{
            width: `${(secondsElapsed / rawTime) * 100}%`,
            display: "block",
            height: "36px",
            backgroundColor: "#FBBF24",
            borderRadius: "60px",
        }}
    />
</div>
```

### Adding Audio

With the video's length dynamically changing depending on the length of the audio provided and the progress bar linked to the visualizer, I needed a way to actually play the audio. Fortunately, Remotion makes this very easy with the `<Audio />` tag. To utilize this, I wrapped the base `<AbsoluteFill />` tag with the shorthand for React Fragments, then add the `<Audio />` tag with the `src` prop set to use `staticFile`.

```jsx
<>
    <AbsoluteFill>
        ...
    </AbsoluteFill>

    <Audio src={staticFile("audio.mp3")} />
</>
```

## Thumbnail

To create the thumbnail, I copied the `Visualizer.tsx` file's content over to `Thumbnail.tsx`, a file I had just created, with the modifications being that the progress bar and `<Audio />` element were removed. I also copied the contents of `Video.tsx` over to `Still.tsx`, changing `<Composition />` to `<Still />`. The code for the new composition is as follows:

```tsx
<Still
    id="thumbnail"
    component={Thumbnail}
    width={1920}
    height={1080}
    defaultProps={{
        title,
        author,
        chapter,
    }}
/>
```

I also needed to create another index file, because the way Remotion chooses to render media, is via their command-line interface, which is patched into a package script. This pre-made `build` shows how the Remotion `render` command is structured.

```json
"scripts": {
    "build": "remotion render src/index.tsx visualizer out/video.mp4"
}
```

The first parameter is the index file, or the file with the `registerRoot` function. The second parameter is the composition ID, which is passed via the `id` prop. The third and final parameter is the output destination. I changed the name of the default `build` script to `render:video`, then duplicated it with a new key of `render:thumbnail`. In the thumbnail script, I changed the index file to a new file, `thumbnailIndex.tsx`, which registers the root for the thumbnail, instead of the video. I also needed to change the compositon ID (to `thumbnail`) and the output destination, which I changed to `out/video.png`. I also changed the image format in `remotion.config.ts` to `png`.


```json
"scripts": {
    "render": "pnpm render:video && pnpm render:thumbnail",
    "render:video": "remotion render src/index.tsx visualizer out/video.mp4",
    "render:thumbnail": "remotion render src/thumbnailIndex.tsx thumbnail out/video.png"
}
```

I decided to add a new script as well, this one simply called `render`, that called both `render:video` and `render:thumbnail`. This allows me to simply call `pnpm render` (or `pnpm run render`) and save time by having the renderings run sequentially, instead of me manually triggering them.

## Conclusion

Now you have a (hopefully) fully-functioning visualizer and thumbnail! Hopefully this was a helpful guide to you! If you have any questions, contact me on Twitter.

Until next time, see you later!
