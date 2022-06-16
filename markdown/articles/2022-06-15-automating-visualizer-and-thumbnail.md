I recently was asked to create a set of visualizers and thumbnails for a series of YouTube videos. As the number of videos was about ten, I decided to automate the task with TypeScript. I began my search for a library or tool that could help me by doing a search for "create a youtube video with javascript". This returned a link to a [Fireship YouTube video](https://www.youtube.com/watch?v=deg8bOoziaE) that led to [Remotion](https://www.remotion.dev/). Remotion uses React to render content, then renders it out. To quote Remotion,

> The basic idea behind Remotion is that we'll give you a frame number and a blank canvas, and the freedom to render anything you want using React.js.

**Note: I used [`pnpm`](https://pnpm.io/) instead of `npm`, but you can use whatever you want**

First, I created the project using `pnpm create video`, as listed by Remotion's [Getting Started page](https://www.remotion.dev/docs). With the sample Hello World project ready, I opened it up in Visual Studio Code (my text editor of choice) via the interactive prompt's "open in VS Code" option.

## Configuration

Next, I opened the main files: `src/Video.tsx` and `src/HelloWorld.tsx`. I renamed the `HelloWorld.tsx` file to `Visualizer.tsx`, and removed both the preexisting code and the `HelloWorld` directory, leaving only a blank component.

At this point, I got annoyed with the base formatting, and so I installed my personal Prettier config ([@hkamran/prettier-config](https://www.npmjs.com/package/@hkamran/prettier-config)), Prettier, and the [Prettier ESLint config (`eslint-config-prettier`)](https://github.com/prettier/eslint-config-prettier). I then renamed the `.eslintrc` file to `.eslintrc.json`, changed the `extends` key to a list, and added `prettier` to the list.

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

To create the visualizer, I utilized the `getCurrentFrame` function (provided by Remotion) to get the current frame, then divided that by the frames per second (which I saved as a constant integer in a separate file) to get the seconds elapsed. I stored that in a React `useState` variable with the following code:

```typescript
const frame = useCurrentFrame();

useEffect(() => {
    setSecondsElapsed(frame / FPS);
}, [frame]);
```

### Changing the Duration

But here's where I ran into a problem: how to dynamically change the length of the video with an audio file's duration? To set the duration of the video, you adjust the `durationInFrames` prop on the Remotion `Composition` component. That's one problem solved, but how to solve the other two problems: loading the audio file and dynamically adjusting the duration?

```tsx
<Composition
    id="visualizer"
    component={Visualizer}
    durationInFrames={150} // FPS multiplied by the number of seconds
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{
        title,
        author,
        chapter,
    }}
/>
```

Remotion provides a `getAudioDurationInSeconds` function which is part of `@remotion/media-utils`. It takes a single parameter: the path to an audio file. It can use the source path from an `import` statement, a remote URL, or a static file on the system itself. To use a static file, which is what I did, you have to use the `staticFile` function, which "turns a file in your public/ folder into an URL which you can then load into your project." I copied one of the audio files into the `public` directory, which I had to create, then used `await getAudioDurationInSeconds(staticFile("audio.mp3"))` to get the audio duration. Perfect, right? Well, no. TypeScript threw an error saying that `'await' expressions are only allowed within async functions and at the top levels of modules.`, and recommended that I change the `Video` component to be asynchronous. I did that, but then another error was thrown, this time saying that:

```text
Type '() => Promise<JSX.Element>' is not assignable to type 'FC<{}>'.
  Type 'Promise<Element>' is missing the following properties from type 'ReactElement<any, any>': type, props, key
```

This is because the `registerRoot` function (in `src/index.tsx`) takes a `React.FC<{}>`, but the asynchronous `Video` component was returning a `Promise`. So back to the drawing board. On Remotion's [Dynamic duration, FPS, & dimensions page](https://www.remotion.dev/docs/dynamic-metadata#change-metadata-based-on-asynchronous-information), I found the use of a `useEffect` hook, combined with a `delayRender` and a `continueRender` function from Remotion. I placed the `await getAudioDurationInSeconds(...)` function in the `useEffect` hook, and added a `handle` variable (based on the example provided), but it threw the same error regarding async functions and at the top levels of modules. React doesn't like `useEffect`s containing `async` functions, so I wrapped it in a function and came up with the following:

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

In the visualizer, there is a progress bar. But how would one go about connecting the progress bar to the duration? I passed the true duration through the `defaultProps` object via a key named `duration`, then set the progress bar's width to the seconds elapsed divided by the duration multiplied by 100 to get a percentage. The progress bar code is as follows:

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

With the video's length dynamically changing depending on the length of the audio provided and the progress bar linked to the visualizer, we need a way to actually play the audio. Fortunately, Remotion makes this very easy with the `<Audio />` tag. To utilize this, we wrap the base `<AbsoluteFill />` tag with the shorthand of React Fragments, then add the `<Audio />` tag with the `src` prop set to use `staticFile`.

```jsx
<>
    <AbsoluteFill>
        ...
    </AbsoluteFill>

    <Audio src={staticFile("audio.mp3")} />
</>
```

## Thumbnail

TBA
