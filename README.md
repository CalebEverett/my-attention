## Installation
>Make sure you have latest **NodeJs** version installed

Clone repo

```
git clone https://github.com/CalebEverett/my-attention
```
Go to `my-attention` directory run

```
yarn install
```
Now build the extension using
```
yarn build
```
You will see a `build` folder generated inside `[PROJECT_HOME]`

To avoid running `yarn build` after updating any file, you can run

```
yarn watch
```

which listens to any local file changes, and rebuilds automatically.

## Adding extension to Chrome

In Chrome browser, go to chrome://extensions page and switch on developer mode. This enables the ability to locally install a Chrome extension.

<img src="https://cdn-images-1.medium.com/max/1600/1*OaygCwLSwLakyTqCADbmDw.png" />

Now click on the `LOAD UNPACKED` and browse to `[PROJECT_HOME]\build` ,This will install the React app as a Chrome extension.

When you go to any website and click on extension icon, injected page will toggle.

<img src="https://cdn-images-1.medium.com/max/1600/1*bXJYfvrcHDWKwUZCrPI-8w.png" />

## Using SASS

Boilerplate contains [sass-loader](https://github.com/webpack-contrib/sass-loader), so you can use SASS instead of pure CSS in your project. To do so:
1. Rename ```src/App.css``` file to ```src/App.scss``` 
2. Change import line in ```src/app.js``` from 
 ```import './App.css';```  to ```import './App.scss';```

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/satendra02/react-chrome-extension/. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.


## License

The repo is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).

## Starter Boilerplate
Thank you https://github.com/satendra02/react-chrome-extension/
