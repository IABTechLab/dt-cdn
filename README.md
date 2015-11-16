# DigiTrust

The DigiTrust code base relies on Node.js, Grunt and Browserify among other libraries.

To initialize your local repository for development, clone this repository and run:

    npm install
    grunt --env local (build script)
    grunt watch --env local (build & watch script)
    grunt deploy --env dev (builds & deploys your LOCAL ./dist)
    grunt deploy --env prod
    node node-server.js (to run fileserving with CORS *; may need to sudo)

Available environments: local, dev, prod

Before committing, you can run the following to validate your code

    npm run test
    npm run validate

They will be automatically run on push to ensure that only clean code makes it into the repository.
