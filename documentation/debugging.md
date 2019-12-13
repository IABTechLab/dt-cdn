# Debugging DigiTrust

A live system may investigated and debugged be interrogating the logs and config settings. 
DigiTrust maintains an internal log buffer for these purposes that may be dumped.

## Viewing log statements

After a page load you may instruct DigiTrust to output the log as an array to the developer console. 
This array may also be programmatically accessed via the same method. Only the publisher-side logs are
returned from this method. The console output will contain both publisher side (host page) and
DigiTrust IFrame (*.digitru.st domain) log statements.

~~~~

DigiTrust.debugControl.dumpLogs();

~~~~

## Viewing configuration settings

The `dumpConfig()` method will output the current configuration settings of the DigiTrust library.
~~~~

DigiTrust.debugControl.dumpConfig();

~~~~

## Enabling heightened debug mode

DigiTrust can be instructed to enable debug logging. This also causes both publisher side and digitru.st side code
to output basic library information, such as version number, browser, and execution domain. The logs are more often
useful as the initialization information will be included in the log statements.



