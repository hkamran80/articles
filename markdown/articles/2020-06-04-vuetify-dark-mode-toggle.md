*Photo: [Material.io](https://material.io/design/color/dark-theme.html)*

I use [Vue.js](https://vuejs.org) and [Vuetify](https://vuetifyjs.com) for almost all of my websites, and I’m a huge supporter of dark mode. One of the many reasons I chose Vuetify is because it has dark mode support out-of-the-box. So, without further ado, let me guide you through easily changing the dark mode state.

## Setting the Default Dark Mode State

In order to set the default dark mode state, we have to open the plugin file for Vuetify, which is available at `src/plugins/vuetify.js`. By default, the file should look like the following.

```javascript
import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({});
```

To set the default state, we have to create a new object in the constructor called `theme`, and inside that, set a variable called `dark` to `true`.

```javascript
export default new Vuetify({
    theme: {
        dark: true
    }
});
```

But if we want to change it from the user-facing interface, we have to use the variable provided by Vuetify.

## Setting the Dark Mode State From the Interface

*A copy of the final code is available at the bottom.*

Before even adding the theme state-changing code, you have to decide where to put the code. You only have to put it in one location, preferably a location that is persistent, such as your `App.vue` or a component that is present on all pages, such as a navigation bar. With that decided, we can actually get to work.

In your file (I’m using a component that I’ve called `NavigationBar`), go to the `script` tag. There should be an `export` statement present. If not, go ahead and create it. The contents of the `script` tag should look similar to this:

```javascript
export default {
    name: "NavigationBar"
}
```

First, we need to add the method that will be called when the user clicks on a button. Underneath the `name` parameter, add a new object called `methods`.

```javascript
export default {
    name: "NavigationBar",
    methods: {}
}
```

I’m going to call my method `toggleDarkMode`, but feel free to call it whatever you’d like. This method is going to set the dark mode variable (`this.$vuetify.theme.dark`) to the inverse of what it is currently set to (if the theme is currently light, then this variable will be `false`), then set a [local storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) variable called `darkTheme` to the value of that variable.

```javascript
methods: {
    toggleDarkMode: function() {
        this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
        localStorage.setItem("darkTheme", this.$vuetify.theme.dark.toString());
    }
}
```

With the function implemented, we now have to make it so that site will automatically pick up the theme state from the browser with the [`prefers-color-scheme` CSS media query](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) and/or the local storage state. The `prefers-color-scheme` state is set by your system.

To accomplish our task, we will use a [Vue lifecycle hook](https://michaelnthiessen.com/call-method-on-page-load/") called `mounted` which is called, as you may have guessed, when the component is mounted. We’ll add `mounted() {}` underneath the `methods` object.

```javascript
export default {
    name: "NavigationBar",
    methods: { ... },
    mounted() {}
}
```

We will first check what the value of our local storage variable is. If it exists, `this.$vuetify.theme.dark` is set to the value of the variable. If it doesn’t, we’ll check whether the user has dark mode enabled on their system, and set it to that.

```javascript
mounted() {
    const theme = localStorage.getItem("darkTheme");

    // Check if the user has set the theme state before
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
            "darkTheme",
            this.$vuetify.theme.dark.toString()
        );
    }
}
```

All that’s left is to add a button to toggle the state. In the `template` tag, add the following:

```html
<v-btn icon @click="toggleDarkMode">
    <v-icon>mdi-theme-light-dark</v-icon>
</v-btn>
```

The code above is simple. It creates a Vuetify icon button, tells it to use the [`theme-light-dark` icon from Material Design Icons](https://materialdesignicons.com/icon/theme-light-dark) and to add an event handler, which on click, calls the `toggleDarkMode` method.

That’s it. You’re finished! As I mentioned earlier, the final code is available on [this GitHub Gist](https://gist.github.com/hkamran80/9bba61e1d2f0c2cfae8209e7d8dca4f1).

Thanks for reading!
