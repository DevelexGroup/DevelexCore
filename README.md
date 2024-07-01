# develex-core

Everything you need to build a Svelte library, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

Read more about creating a library [in the docs](https://kit.svelte.dev/docs/packaging).


## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

Everything inside `src/lib` is part of your library, everything inside `src/routes` can be used as a showcase or preview app.

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

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

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