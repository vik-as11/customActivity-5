define([
    'postmonger'
], function(Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
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
                    $('#name').val(val);
                }
                if (key === 'activityDescription') {
                    $('#description').val(val);
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
        var name = $('#name').val();
        var phone = $('#phone').val();
        var email = $('#email').val();
        var comment = $('#comment').val();

        if (!name || !phone || !email || !comment) {
            console.error('Error: Missing form values');
            return;
        }

        payload['arguments'].execute.inArguments = [{
            "name": name,
            "phone": phone,
            "email": email,
            "comment": comment
        }];

        payload['metaData'].isConfigured = true;

        var apiRequestBody = {
            "touchpoint_id": name,
            "subject": "This is the subject I need to talk about",
            "contact_person": {
                "email": email
            },
            "context_parameters": {
                "contact_name": name,
                "contact_phone": phone,
                "contact_reason": "consulting products",
                "website_location": "http://location.com"
            }
        };

        console.log('API Request Body:', apiRequestBody);

        fetch('https://api.talkdeskappca.com/digital-connect/conversations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokens.fuel2token}`, // Ensure this token is correctly received
                'x-idempotency-key': generateIdempotencyKey()
            },
            body: JSON.stringify(apiRequestBody)
        })
        .then(response => response.json())
        .then(data => {
            console.log('API Response:', data);
            connection.trigger('updateActivity', payload);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});
