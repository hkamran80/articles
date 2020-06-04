# Using Local Storage to Store Vuetify's Dark Mode State
## Ever wondered how to use Vuetify's `this.$vuetify.theme.dark` with a button and local storage? You've come to the right place.

I've been working on a project for a while, and it needed a redesign. I chose to go with Material Design. After failing to use 
Material Components, and not wanting to learn React or Angular, I went with [Vue.js](https://vuejs.org). They had an amazing 
plugin called [Vuetify](https://vuetifyjs.com), which allowed Vue developers to use Material Design.

After getting the main layout of my project complete, I went on to my next task, dark mode support. Vuetify has dark mode support 
built-in, and there are two ways of setting it.

### Option One: Declare it in the Vuetify initalizer
```javascript
export default new Vuetify({
});
```
Mine was located at `<PROJECT_ROOT>/src/plugins/vuetify.js` on lines six and seven. Between the curly braces, add:
```javascript
theme: {
    dark: true,
}
```
The final code should be something like the following:
```javascript
export default new Vuetify({
    theme: {
        dark: true,
    }
});
```

### Option Two: Use the `this.$vuetify.theme.dark` property

