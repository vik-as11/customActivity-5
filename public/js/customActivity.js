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
    connection.on('clickedNext', saveAndMakeApiCall);
    connection.on('clickedBack', onClickedBack);

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

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : [];

        // Extract the values from inArguments
        var name = '';
        var phone = '';
        var email = '';

        inArguments.forEach(function(inArgument) {
            if (inArgument.name) {
                name = inArgument.name;
            }
            if (inArgument.phone) {
                phone = inArgument.phone;
            }
            if (inArgument.email) {
                email = inArgument.email;
            }
        });

        // Populate the form fields
        $('#name').val(name);
        $('#phone').val(phone);
        $('#email').val(email);

        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true
        });
    }

    function onGetTokens(receivedTokens) {
        tokens = receivedTokens;
    }

    function onGetEndpoints(receivedEndpoints) {
        endpoints = receivedEndpoints;
    }

    function onClickedBack() {
        connection.trigger('prevStep');
    }

    function generateIdempotencyKey() {
        return 'idempotency-key-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    function saveAndMakeApiCall() {
        var name = $('#name').val();
        var phone = $('#phone').val();
        var email = $('#email').val();

        // Prepare the payload to be sent back to Journey Builder
        payload['arguments'].execute.inArguments = [{
            "name": name,
            "phone": phone,
            "email": email
        }];

        payload['metaData'].isConfigured = true;

        // Making the API Call
        var apiRequestBody = {
            "touchpoint_id": name, // Replace this with the correct field from your DE
            "subject": "This is the subject",
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

        fetch('https://api.talkdeskappca.com/digital-connect/conversations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokens.fuel2token}`, // Using the Fuel2 token as a Bearer token
                'x-idempotency-key': generateIdempotencyKey()
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
