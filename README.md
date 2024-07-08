# develex-core
develex-core is a npm library for gaze data processing. It provides a set of functions for gaze data input, controlling remote eye-trackers and gaze data processing. The library is built with Svelte Kit and is published to the GitLab package registry.

The library is a part of the develex software, which aims to provide a set of tools for gaze data processing for dyslexia interventions. Its parts can be used separately for other purposes as well, from collecting gaze data on a webpage for research to controlling maps with gaze.

We use Svelte Kit to build the library and showcase it on a webpage. Learn more about [packaging with Svelte Kit](https://kit.svelte.dev/docs/).

## Testing eye-trackers
We provide a testing webpage, build with GitLab Pages, for you to test functionality of your GazePoint, SMI and EyeLogic eye-tracker. To enable gaze data in a browser environment you have to:

1. Start your eye-tracking controller software (e.g., GazePoint Control)
2. Start develex-bridge
3. Proceed to the testing website with develex-core

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

Everything inside `src/lib` is part of your library, everything inside `src/routes` is used to showcase its functionality.

## Building

To build your library:

```bash
npm run package
```

To create a production version of your showcase app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Publishing
The package is published to the GitLab package registry. To publish the package, you need to set the `CI_JOB_TOKEN` environment variable and run the `npm publish` command.

```bash
set CI_JOB_TOKEN=<your-token>
npm publish
```

## Using the package
To use the package, you need to set the GitLab package registry and pass the token to the npm configuration.

```bash
npm config set -- //gitlab.ics.muni.cz/:_authToken=<your-token>
```

```bash
npm config set @473783:registry=https://gitlab.ics.muni.cz/api/v4/projects/7015/packages/npm/
```

```bash
npm i @473783/develex-core
```