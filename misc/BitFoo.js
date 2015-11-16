!function (DigiTrust) {
    // set up my vars, state etc within the function closure
    var appName = "BitFoo";
    var disabled = true;

    DigiTrust.addListener(appName, "enable", function (args) {
        console.log(appName, 'listener caught ENABLE', args);
        disabled = false;
    });

    DigiTrust.addListener(appName, "page-view", function (args) {
        console.log(appName, 'listener caught PAGE-VIEW', args);
    });

    DigiTrust.addListener(appName, "disable", function (args) {
        console.log(appName, 'listener caught DISABLE', args);
        disabled = true;
    });

}(window.DigiTrust);