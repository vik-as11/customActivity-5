define([
    'postmonger'
], function(Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var lastStepEnabled = false;
    var steps = [ 
        { "label": "Step 1", "key": "step1" }
    ];
    var currentStep = steps[0].key;
    var tokens = {};
    var endpoints = {};

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

        $.each(inArguments, function(index, inArgument) {
            $.each(inArgument, function(key, val) {
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

    function onGetTokens(receivedTokens) {
        tokens = receivedTokens;
        console.log('Tokens received:', tokens);
    }

    function onGetEndpoints(receivedEndpoints) {
        endpoints = receivedEndpoints;
        console.log('Endpoints received:', endpoints);
    }

    function onClickedNext() {
        saveAndMakeApiCall();
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

    function saveAndMakeApiCall() {
        var activityName = $('#activity-name').val();
        var activityDescription = $('#activity-description').val();

        payload['arguments'].execute.inArguments = [{
            "activityName": activityName,
            "activityDescription": activityDescription,
            "tokens": tokens,
            "endpoints": endpoints
        }];
        console.log('payload',payload);
        payload['metaData'].isConfigured = true;

        // Making the API Call
        var apiRequestBody = {
            "touchpoint_id": "+918955445857",
            "subject": "This is the subject I need to talk about",
            "contact_person": {
              "email": "vikas.kumawat@virtuowhiz.com"
            }
          }

        console.log('API Request Body:', apiRequestBody);

        fetch('https://api.talkdeskappca.com/digital-connect/conversations', {  // Replace with your actual API endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(apiRequestBody)
        })
        .then(response => response.json())
        .then(data => {
            console.log('API Response:', data);

            // Update activity with the payload after the API call is successful
            connection.trigger('updateActivity', payload);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});
