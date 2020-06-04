<!--Kicker-->Development
# <!--Title-->Using Local Storage to Store Vuetify's Dark Theme State
## <!--Subtitle-->Ever wondered how to use Vuetify's `this.$vuetify.theme.dark` with a button and local storage? You've come to the right place.

I've been working on a project for a while, and it needed a redesign. I chose to go with Material Design. But it wasn't a seamless integration. After failing to use Material Components, and not wanting to learn React or Angular, I went with [Vue.js](https://vuejs.org). They had an amazing plugin called [Vuetify](https://vuetifyjs.com), which allows Vue developers to use Material Design.

After getting the main layout of my project complete, I went on to my next task, dark theme support. Vuetify has built-in functionality for setting the theme! There are two ways of setting the theme. We're going to set it using the theme variable because it's easier than the other way, which is setting it in your Vuetify initalizer. My initalizer was in `<PROJECT_ROOT>/src/plugins/vuetify.js`, but yours may be different:
```javascript
export default new Vuetify({
    theme: {
        dark: true,
    }
});
```

You can use both methods together, but I prefer to not use the `dark: true` parameter, favoring the `this.$vuetify.theme.dark` variable.

Go to your main `.vue` file (mine is `App.vue`), and add a button (this will toggle dark mode). Specifically, I added an icon button into my app bar. My app bar's code now looks like this:
```html
<v-app-bar app>
    <v-toolbar-title>Project Name</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn icon v-on:click="toggle_dark_mode">
        <v-icon>mdi-theme-light-dark</v-icon>
    </v-btn>
    <v-btn icon>
        <v-icon>mdi-logout</v-icon>
    </v-btn>
</v-app-bar>
```

The icon button's code is in the above snippet, but here's a standalone version:
```html
<v-btn icon v-on:click="toggle_dark_mode">
    <v-icon>mdi-theme-light-dark</v-icon>
</v-btn>
```

Notice the `v-on:click="toggle_dark_mode"`? That's an onclick parameter on the `v-btn` element that will call the `toggle_dark_mode` Vue method. If we look further down in our `.vue` file, you should see something like:
```html
<script>
    export default {
      name: 'App',
      data: () => ({}),
    };
</script>
```

Let's add that method. Under the `data: () => ({}),` line, add the following:
```javascript
methods: {
    toggle_dark_mode: function () {
        this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
        localStorage.setItem("dark_theme", this.$vuetify.theme.dark.toString());
    }
},
```

This adds a method called `toggle_dark_mode`, which is a function that toggles the `this.$vuetify.theme.dark` variable (a boolean) to the opposite. So if the variable is `true`, it'll set it to `false` and vice versa. The line under it saves the result of the variable to the local storage, but as a String (see the ""s). Local storage is saved in a key-value pair (in this case, [String: String]. If you want to learn more about local storage, check out [this article from the MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). Here, we're saving the dark mode value to the key `dark_theme`, as a String.

Our `export default` should now look similar to the following:
```javascript
export default {
    name: 'App',
    data: () => ({}),
    methods: {
        toggle_dark_mode: function () {
            this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
            localStorage.setItem("dark_theme", this.$vuetify.theme.dark.toString());
        }
    },
};
```

Next, we have to add a function that will load the theme value from local storage when the page is loaded. Underneath the closing curly brace for the `methods` object, add:
```javascript
mounted() {
    const theme = localStorage.getItem("dark_theme");
    if (theme) {
        if (theme == "true") {
            this.$vuetify.theme.dark = true;
        } else {
            this.$vuetify.theme.dark = false;
        }
    }
},
```
`mounted()` is a Vue lifecycle hook ([this](https://michaelnthiessen.com/call-method-on-page-load/) is a good article that explains Vue lifecycle hooks) that is called when the DOM (Document Object Model) is mounted. It's really just a function that's called at a certain point in time.

Our function starts by fetching the theme value from local storage with `localStorage.getItem("dark_theme")`. Remember, `dark_theme` is the key we assigned our dark theme value to. Next, we check if the variable actually contains anything, which can happen if the local storage item has not yet been written to. After that check, we then check whether the variable contains `"true"`. Notice the quotation marks around it. That means it's a string, not a boolean. This is because, when we saved the value, we converted it to a string with `this.$vuetify.theme.dark.toString()`. If the variable is `"true"`, we set the Vuetify theme variable to `true` with `this.$vuetify.theme.dark = true;`. If the variable is `"false"`, the Vuetify theme variable is set to `false` with `this.$vuetify.theme.dark = false;`.

The final `export default` should look like:
```javascript
export default {
    name: 'App',
    data: () => ({}),
    methods: {
        toggle_dark_mode: function () {
            this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
            localStorage.setItem("dark_theme", this.$vuetify.theme.dark.toString());
        }
    },
    mounted() {
        const theme = localStorage.getItem("dark_theme");
        if (theme) {
            if (theme == "true") {
                this.$vuetify.theme.dark = true;
            } else {
                this.$vuetify.theme.dark = false;
            }
        }
    },
};
```

That's it. Your Vue app now has dark theme support via a button!

*All snippets available at: https://gist.github.com/hkamran80/aa50b5c55519ee1bbc0d3dd7310d435d*
