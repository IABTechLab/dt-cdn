# DigiTrust

The DigiTrust code base relies on Node.js, Grunt and Browserify among other libraries.

### Local Development

To initialize your local repository for development, clone this repository and run:

    #install dependencies
    yarn install
    # build only
    yarn build
    
	# build & watch script for client
    yarn devwatch
	
    # generate new key pair
    grunt generateKey --keyversion N


#### Environment Setup
Use your host file to set this host pointer for two local websites. You will need webserver
on your system for your environment. If you don't have IIS or Apache available, try nginx.
Webserver configuration is beyond scope of this document.

local.digitru.st  127.0.0.1
local.pubsite.ed  127.0.0.1

Point your webserver and both sites to the root of your source repository.
Access your site samples at:

http://local.pubsite.ed/samples/sample01.html

For best results setup SSL certificates on your site. One option is SSL and details
will be specific to your webserver.
https://www.freecodecamp.org/news/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec/
https://aboutssl.org/how-to-create-a-self-signed-certificate-in-iis/


Available environments: *local*, *build*, *prod*. Modify the file `src/config/env.json` to use *local*
for local development.

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
2.  Build with command `yarn build`
3.  Commit and push your changes to master branch
4.  git checkout candidate
5.  git pull
6.  git merge --no-ff master
7.  git tag candidate-1.5.37 (update to your version number as set in step 1)
8.  git push --follow-tags  (and then wait to confirm CircleCI build is successful)
9.  git push --force origin candidate-1.5.37:release (then wait for successful CircleCI build)
10. git checkout master
11. git tag v1.5.37
12. git push origin v1.5.37
13. Go to project site on Github and draft a new release
14. Reflect release notes in the `Release Notes` wiki page at https://github.com/digi-trust/dt-cdn/wiki/Release-Notes


## Development Roadmap Notes
The library is moving to slim down and remove unused code from the iframe. Within the package.json file are two script commands that are part of this, but unused at the moment:
*    "buildFrameScript": "browserify src/digitrust_iframe_embed.js -do dist/digitrust_iframe.js",
*    "packFrameScript": "uglifyjs dist/digitrust_iframe.js -o dist/digitrust_iframe.min.js",


