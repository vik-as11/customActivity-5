require(['postmonger'], function(Postmonger) {
    if (typeof Postmonger !== 'undefined') {
        console.log('Postmonger loaded successfully');
        var connection = new Postmonger.Session();
        // Rest of your code
    } else {
        console.error('Postmonger failed to load');
    }
});
