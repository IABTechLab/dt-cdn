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

In general we are using "[three-flow](http://www.nomachetejuggling.com/2017/04/09/a-different-branching-strategy/)" to manage mostly automated releases. 
Releases are branched off of master into `candidate` and then into a `release` branch.
In order to get automated Releases in github we tag releases in master as well.

To verify the current release version, consult this URL https://cdn.digitru.st/prod/1/digitrust.min.js or load the 
test page Prebid.js/integrationExamples/gpt/digitrust_Full.html and type `DigiTrust.version` in the debug console.

1.  Update `version` in `package.json`
2.  Update `digitrustHostPath`, `digitrustRedirect`, and `digitrustIframe` in the `prod` section of `src/config/general.json`
3.  Update `digitrustHostPath`, `digitrustRedirect`, and `digitrustIframe` to the most recent prior
    release version in the `build` section of `src/config/general.json`
4.  Build with command `yarn build`
5.  Commit and push your changes to master branch
6.  git checkout candidate
7.  git pull
8.  git merge --no-ff master
9.  git tag candidate-1.5.35
10. git push --follow-tags
11. git push --force origin candidate-1.5.35:release
12. git checkout master
13. git tag v1.5.35
14. Go to project site on Github and draft a new release
15. Reflect release notes in the `Release Notes` wiki page at https://github.com/digi-trust/dt-cdn/wiki/Release-Notes
