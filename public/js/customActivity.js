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
    function generateIdempotencyKey() {
        return 'idempotency-key-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
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
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJraWQiOiJhNTQyMmRmZTMyN2M1YzE4YTYxYzEzZGU3ZGU1MTk1NCIsImFsZyI6IkVTMjU2In0.eyJpc3MiOiJodHRwczovL3d3dy50YWxrZGVza2lkY2EuY29tIiwiYXVkIjoiaHR0cHM6Ly9hcGkudGFsa2Rlc2thcHBjYS5jb20iLCJleHAiOjE3MjQxNDE1MDQsIm5iZiI6MTcyNDE0MDkwNCwiaWF0IjoxNzI0MTQwOTA0LCJqdGkiOiI4MDk3MjFjNWFhMzM0NTg1YmNjZjkzM2FjMGI4MTk1ZSIsImNpZCI6IjM3MWVhMTJjYzkwMTRmOWI4OGM3ODE0YjA5ZDIwMDMwIiwiZ3R5IjoiY2xpZW50X2NyZWRlbnRpYWxzIiwic2NwIjpbImFjY291bnQ6cmVhZCIsImFwcHM6d3JpdGUiLCJjb250YWN0czpyZWFkIiwiZGlnaXRhbC1jb25uZWN0OndyaXRlIiwib3BlbmlkIiwicmVjb3JkLWxpc3RzOm1hbmFnZSJdLCJybG0iOiJNQUlOIiwiYWlkIjoiNjJiZTNlY2YxM2M3NTY0Zjc4NjBjMmIwIiwiYWNjIjoibnVvdm8iLCJwc24iOiJDVVNUT01FUiIsInJlZyI6ImNhLWNlbnRyYWwtMSIsInN1YiI6IjM3MWVhMTJjYzkwMTRmOWI4OGM3ODE0YjA5ZDIwMDMwIn0.eddIRLgH2zIWFry6qQDDB2ffimIFTwoLa19Q1INpHEkipLot6VXsmRMUjOxwTDXuF3oLVM4gFMO972s3vfHamw`, // Using the Fuel2 token as a Bearer token
                'Idempotency-Key': generateIdempotencyKey() // Generating and adding the Idempotency Key
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
