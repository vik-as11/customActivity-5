require.config({
    paths: {
        postmonger: 'https://raw.githubusercontent.com/kevinparkerson/postmonger/master/postmonger.min.js'
    }
});

require([
    'postmonger'
], function (Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var lastStepEnabled = false;
    var steps = [
        { "label": "Step 1", "key": "step1" }
    ];
    var currentStep = steps[0].key;

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);
    connection.on('clickedNext', onClickedNext);
    connection.on('clickedBack', onClickedBack);
    connection.on('gotoStep', onGotoStep);

    function onRender() {
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
    }

    function initialize(data) {
        if (data) {
            payload = data;
        }

        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        $.each(inArguments, function (index, inArgument) {
            $.each(inArgument, function (key, val) {
                if (key === 'activityName') {
                    $('#activity-name').val(val);
                }
                if (key === 'activityDescription') {
                    $('#activity-description').val(val);
                }
            });
        });

        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true
        });
    }

    function onGetTokens(tokens) {
        console.log(tokens);
    }

    function onGetEndpoints(endpoints) {
        console.log(endpoints);
    }

    function onClickedNext() {
        save();
    }

    function onClickedBack() {
        connection.trigger('prevStep');
    }

    function onGotoStep(step) {
        showStep(step);
        connection.trigger('ready');
    }

    function showStep(step) {
        $('.step').hide();
        $('#' + step).show();
    }

    function save() {
        var activityName = $('#activity-name').val();
        var activityDescription = $('#activity-description').val();

        payload['arguments'].execute.inArguments = [{
            "activityName": activityName,
            "activityDescription": activityDescription
        }];

        payload['metaData'].isConfigured = true;

        connection.trigger('updateActivity', payload);
    }
});
