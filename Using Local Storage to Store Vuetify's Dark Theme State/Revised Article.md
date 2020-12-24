# Add a Dark Mode Toggle for Vue.js Apps with Vuetify
## A simple way to set Vuetify's dark mode state and make it user-configurable

I use [Vue.js](https://vuejs.org) and [Vuetify](https://vuetifyjs.com) for almost all of my websites and I'm a huge supporter of dark mode. I chose Vuetify for many reasons, and out-of-the-box dark mode support is one of them. So, without further ado, let me guide you through changing the dark mode state -- easily.

## Setting the Default Dark Mode State
In order to set the default dark mode state, we have to open the plugin file for Vuetify, which is available at `src/plugins/vuetify.js`. By default, the file should look like the following.

```javascript
import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({});
```

From here, all we need to do is set the `dark` parameter to `true` within the `theme` object. So our `export default` statement will become:

```javascript
export default new Vuetify({
    theme: {
        dark: true
    }
});
```

But if we want to change it from the user-facing interface, like a toggle or something, we have to use a variable that Vuetify provides.

## Setting the Dark Mode State From the Interface
*A copy of the final code is available at the bottom.*

Before we even add the theme state-changing code, we have to decide where to put the code. You only have to put it in one location, preferably one that is persistent -- such as your `App.vue`, or a component that is present on all pages like a navigation bar. With that decided, we can actually get to work.

In your file (I'm using a component that I've called `NavigationBar`), go to the `script` tag. There should be an `export default` statement present. If not, go ahead and create it. Your `script` should look similar to this:
```html
<script>
export default {
    name: "NavigationBar"
}
</script>
```

First, we need to add the method that will be called when the user clicks on a button. Underneath the `name` parameter, add a `methods` object, like so:
```javascript
export default {
    name: "NavigationBar",
    methods: {}
}
```

I'm going to call my method `toggle_dark_mode`, but feel free to call it whatever you'd like. This method is going to:
1. Set the dark mode variable (`this.$vuetify.theme.dark`) to the opposite of whatever it is currently set to (so `true` if it's `false`, `false` if it's `true`)
2. Set a local storage variable called `dark_theme` to the value of that variable. If you'd like to learn more about local storage, check out this [article](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) from the MDN Web Docs. <!-- I usually remove "this" from links, makes it a bit cleaner... I prefer links with 2 or less words also -->

Replace `methods: {}` with the following:

```javascript
methods: {
    toggle_dark_mode: function() {
        this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
        localStorage.setItem("dark_theme", this.$vuetify.theme.dark.toString());
    }
}
```

With the function implemented, we now need to read it. We can have the site automatically pick up the theme state from the browser with the `prefers-color-scheme` CSS media query ([read more](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)) and/or the local storage state. The `prefers-color-scheme` state is set by your system -- to set the dark mode state on your computer, check out the following guides for [macOS](https://support.apple.com/en-us/HT208976) or [Windows](https://blogs.windows.com/windowsexperience/2019/04/01/windows-10-tip-dark-theme-in-file-explorer/).

To do this, we will use a Vue [lifecycle hook](https://michaelnthiessen.com/call-method-on-page-load) named `mounted` which is called, you guessed it (I hope), when the page is mounted. We'll add `mounted() {}` underneath the `methods` object.

```javascript
export default {
    name: "NavigationBar",
    methods: {...},
    mounted() {}
}
```

We will first check what the value of our local storage variable is. If it exists, we'll set `this.$vuetify.theme.dark` to the value of the variable. If it doesn't, we'll check whether the user has dark mode enabled on their system, and set it to that.

```javascript
mounted() {
    const theme = localStorage.getItem("dark_theme");
    if (theme) {
        if (theme === "true") {
            this.$vuetify.theme.dark = true;
        } else {
            this.$vuetify.theme.dark = false;
        }
    } else if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
        this.$vuetify.theme.dark = true;
        localStorage.setItem(
            "dark_theme",
            this.$vuetify.theme.dark.toString()
        );
    }
}
```

All that's left is to add a button to toggle the state. I'll use the Material Design icon [`theme-light-dark`](https://materialdesignicons.com/icon/theme-light-dark). In my `template` tag, add the following:

```html
<v-btn icon @click="toggle_dark_mode">
    <v-icon>mdi-theme-light-dark</v-icon>
</v-btn>
```

The code above is simple. It creates a Vuetify icon button, tells it to use the `theme-light-dark` icon -- and also to, on click, call the `toggle_dark_mode` method.

That's it. You're finished! If you want to see an example, check out [Reprint](https://reprint.hkamran.com) (unless you're already reading this article there), or check out [my personal website](https://hkamran.com). As I mentioned earlier, the final code is available at [this GitHub Gist](https://gist.github.com/hkamran80/9bba61e1d2f0c2cfae8209e7d8dca4f1).

Thanks for reading!
