I've been moving a few [utilities](https://github.com/hkamran80/utilities-js) that
I use in multiple projects to npm libraries. But I needed an easy, reliable way
to generate TypeScript declarations, since I primarily use TypeScript.

1. Open your project and ensure you have a `package.json`

2. Install the `typescript` library as a development dependency

    - With `pnpm`: `pnpm i -D typescript`
    - With `npm`: `npm i -D typescript`
    - With `yarn`: `yarn add typescript -D`

3. Add [JSDoc tags](https://jsdoc.app/) to your functions, variables, classes, etc.

   For example, here's a snippet from [one of my utilities](https://www.npmjs.com/package/@hkamran/utility-web):

   ```javascript
   /**
   * Apply classes that result in a true condition
   * @param {string[]} classes
   * @returns A list of classes
   *
   * @example
   * classNames("block truncate", selected ? "font-medium" : "font-normal")
   */
   export const classNames = (...classes) => {
       return classes.filter(Boolean).join(" ");
   };
   ```

4. Add the [`prepare` script](https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts)
   (or whichever one you want to use) to the `scripts` object in `package.json`

   For example, mine looks like this:

   ```json
   "scripts": {
       "prepare": "tsc --declaration --emitDeclarationOnly --allowJs index.js"
   },
   ```

    This command runs `tsc`, the TypeScript compiler, and tells it to only generate
    `.d.ts` files (declaration files). Be sure to replace `index.js` with your
    JavaScript files.

    The `prepare` script runs before a npm package is packed (typically with
    `npm publish` or `npm pack`, or the equivalents with other package managers).

5. Run your npm script

   - With `pnpm`: `pnpm prepare` or `pnpm run prepare`
   - With `npm`: `npm run prepare`
   - With `yarn`: `yarn run prepare`

Using the `classNames` function above, the TypeScript compiler generated the following
declaration:

```typescript
export function classNames(...classes: string[]): string;
```

If you have any questions, send a tweet my way. I hope that this guide comes in
handy for you, thanks for reading!
