describe('DT Client', function () {
    // initialize: DigiTrust.initialize,
    // getUser: DigiTrust.getUser,
    // setOptout: DigiTrust.setOptout

    it('getUser without memebr id', function (done) {
        var initializeResult;
        DigiTrust.initialize({
            member: null
        },
        function (identityResponse) {
            var initializeResult = identityResponse;
            expect(initializeResult.success).toBe(false);
            done();
        });
    });

    it('getUser without memebr id', function () {
        var getUserResult = DigiTrust.getUser({
            synchronous: true
        });
        expect(getUserResult.success).toBe(false);
    });
});
