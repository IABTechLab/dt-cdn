# DigiTrust

The DigiTrust code base relies on Node.js, Grunt and Browserify among other libraries.

### Local Development

To initialize your local repository for development, clone this repository and run:

    #install dependencies
    yarn install
    # build only
    yarn build
    
	# build & watch script for client
    yarn devclient
	
    # deploy to cdn
    yarn deploy
	
    # generate new key pair
    grunt generateKey --keyversion N


#### Environment Setup
Use your host file to set this host pointer to a local webserver.

local.digitru.st  127.0.0.1
	
Available environments: local, dev, prod

Before committing, you can run the following to validate your code

    yarn test

They will be automatically run on push. The Circle CI build will fail if the unit tests fail


### Production Releases

1. Update `digitrustVersion` in `package.json`
2. Update `digitrustHostPath`, `digitrustRedirect`, and `digitrustIframe` in the `prod` section of `src/config/general.json`
3. `grunt --env prod && grunt --env prod deploy`
