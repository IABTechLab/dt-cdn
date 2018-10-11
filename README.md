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

In general we are using "[three-flow](http://www.nomachetejuggling.com/2017/04/09/a-different-branching-strategy/)" to manage mostly automated releases. Releases are branched off of master into `candidate` and then into a `release` branch.

1. Update `digitrustVersion` in `package.json`
2. Update `digitrustHostPath`, `digitrustRedirect`, and `digitrustIframe` in the `prod` section of `src/config/general.json`
3. git checkout candidate
4. git pull
5. git merge --no-ff master
6. git tag candidate-1.5.13
7. git push --follow-tags
8. git push --force origin candidate-1.5.13:release
