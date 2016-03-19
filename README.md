# DigiTrust

The DigiTrust code base relies on Node.js, Grunt and Browserify among other libraries.

To initialize your local repository for development, clone this repository and run:

    npm install
    grunt --env local (build script)
    grunt watch --env local (build & watch script)
    grunt deploy1 --env dev && grunt deploy2 --env dev (builds & deploys your LOCAL ./dist)
    grunt deploy1 --env prod && grunt deploy2 --env prod

    # to run fileserving with CORS *; may need to sudo
    npm install connect
    npm install serve-static
    node node-server.js

Available environments: local, dev, prod

Before committing, you can run the following to validate your code

    npm run test
    npm run validate

They will be automatically run on push to ensure that only clean code makes it into the repository.
