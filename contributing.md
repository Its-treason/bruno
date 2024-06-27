## Let's make Bruno better, together!!

We are happy that you are looking to improve Bruno. Below are the guidelines to get started bringing up Bruno on your computer.

### Technology Stack

Bruno is built using Next.js and React. We also use electron to ship a desktop version (that supports local collections)

Libraries we use

- Component library: @mantine/\*
- CSS: Tailwind, Styled components (Deprecated), CSSModules
- Code Editors: Monaco, Codemirror (Deprecated)
- State Management: Redux
- Icons: Tabler Icons
- Forms: formik, @mantine/forms
- Schema Validation: Yup, zod
- Request Client: axios (Depricated), node:http (New request method)
- Filesystem Watcher: chokidar

### Dependencies

You would need [Node ^20](https://nodejs.org/en/) and pnpm ^9. We use pnpm workspaces in the project

## Development

For local development you should open Terminal windows. VSCode can create a split terminal.

- `pnpm run dev`: Will build all packages and start the Next.js dev server
- `pnpm run electron`: Will open electron itself. Electron will not restart automaticly when files are changed

Note that you need to wait ~10 seconds before starting electron, to make sure all packages are built.

### Local Development

```bash
# use nodejs version 20
nvm use

# install deps
pnpm  i

# Build packages and start Next.js dev server
pnpm run dev

# Start electron
pnpm run electron
```

### Troubleshooting

You might encounter a `Unsupported platform` error when you run `npm install`. To fix this, you will need to delete `node_modules` and `package-lock.json` and run `npm install`. This should install all the necessary packages needed to run the app.

```shell
# Delete node_modules in sub-directories
find ./ -type d -name "node_modules" -print0 | while read -d $'\0' dir; do
  rm -rf "$dir"
done

# Delete package-lock in sub-directories
find . -type f -name "package-lock.json" -delete
```

### Testing

```bash
# bruno-schema
npm test --workspace=packages/bruno-schema

# bruno-lang
npm test --workspace=packages/bruno-lang
```

### Raising Pull Requests

Please keep the PR's small and focused on one thing. Before making bigger changes, please create an issue / feature
request before and wait for feedback

Please follow the format of creating branches:

- feature/[feature name]: This branch should contain changes for a specific feature
  - Example: feature/dark-mode
- bugfix/[bug name]: This branch should contain only bug fixes for a specific bug
  - Example: bugfix/zyx-modal-text-overflow
