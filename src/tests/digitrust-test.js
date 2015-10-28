describe('DigiTrust.initialize', function () {
    // initialize: DigiTrust.initialize,
    // getUser: DigiTrust.getUser,
    // setOptout: DigiTrust.setOptout

    it('getUser without memebr id', function (done) {
        DigiTrust.initialize({
            member: null
        },
        function (identityResponse) {
            expect(identityResponse.success).toBe(false);
            done();
        });
    });
});

describe('DigiTrust.getUser', function () {

    it('getUser without memebr id', function () {
        var getUserResult = DigiTrust.getUser({
            synchronous: true
        });
        expect(getUserResult.success).toBe(false);
    });

});
