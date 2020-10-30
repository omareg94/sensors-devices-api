**sensors-devices-api** - Multi-user sensors management system RESTful API using Node.js and Express.

- [How to run?](#how-to-run-installation-&-usage)
- [Testing](#testing)
- [Side-Notes](#side-notes)

# How to run? (Installation & Usage)

To install, clone/download repository folder.

    cd /path/of/downloaded-app-folder
    npm install

Wait till npm installs all needed dependencies on folder.


Then run app use this code.

    npm start


Server should be running and API ready to receive requests at address:

    localhost:4000/api/…


This is a quick summary on the API usage:

    [POST] localhost:4000/api/signup    // to sign up a new user
    [POST] localhost:4000/api/login     // to login (either email or username and a password).
    	// This returns an accessToken to be used as the Authorization header of type
    	   "Bearer Token".
    // Next require accessToken in Authorization header.
    [GET] localhost:4000/api/logout     // to logout (revokes accessToken that's used in Authorization header)
    [GET] localhost:4000/api/logout/all     // to logout from all sessions (revokes all previously generated accessTokens)     // user can login to up to 5 devices (can be set to more or infinity in code, just it's an added feature)
    [GET] localhost:4000/api/profile    // view your user profile info
    [POST] localhost:4000/api/devices    // add new sensoring device
    [GET] localhost:4000/api/devices     // view your sensoring devices
    [GET] localhost:4000/api/devices/{{device_id}}     // view single sensoring device
    [POST] localhost:4000/api/readings     // add readings to device
    [GET] localhost:4000/api/readings     // view readings of all devices
    [GET] localhost:4000/api/readings/{{device_id}}    // view readings of single device
    [GET] localhost:4000/api/readings?start={{start_time}}&end={{start_time}}    // view readings of all devices filtered by time range (same can be used for single device's readings)


This is a quick summary on the format of JSON data format/schema you can send in POST requests:

    [POST] localhost:4000/api/signup    // to sign up a new user
    {
        "username": "omar1237A3",
        "password": "sadasdaA*1dasd",     
        "email": "omar1243@gmail.com",
        "name": "Omar A"
    }
    
    // username and email should be unique
    // Password: should be at least 8-characters, have at least one capital, number, and special character
    // Email should be a valid email (however there's no actual email verification by sending an email in code, but code checks on both password and email using Regular Expression).
    ———————————————————————————
    [POST] localhost:4000/api/login     // to login (either email or username and a password).
    {
        "username": "omar12373",
        "password": "sadasdaA*1dasd"
    }
    
    or
    
    {
        "email": "omar1243@gmail.com",
        "password": "sadasdaA*1dasd"
    }
    // code accepts entering either username or email as user identifier.
    ———————————————————————————
    [POST] localhost:4000/api/devices    // add new sensoring device
    {
        "name": "Sensoring device 1",
        "type": "Temperature",
        "location": [29.952654, 30.921919],
        "locationNotes": "Lab 1, 6 October",
        "modelName": "Some model name",
        "manufacturer": "Some manufacturer",
        "description": "hey there's description here"
    }
    ———————————————————————————
    [POST] localhost:4000/api/readings     // add readings to device
    {
        "value": 211332,
        "device_id": "5f9b13a8b44fb4087cacd904"
    }
    
    // device_id: is the id of the device you want to record a reading from.

# Testing

To test some code (mocha, sinon):

    npm test

A postman file is included, with environment variables.

Linting (ESLint):

    npm run lint

# Side-Notes

In this code, a basic secure login authentication system was implemented from scratch without using a 3rd party library. I used [JWT](https://jwt.io/) (for encrypting/decrypting JSON web tokens using  [RFC 7519](https://tools.ietf.org/html/rfc7519) standard), [crypto](https://nodejs.org/api/crypto.html) and [bcrypt](https://www.npmjs.com/package/bcrypt) (for hashing and salting passwords) were used to handle encryption part of the authentication and authorization process.

There're some TODOs in the code, but basic operation is to some extent fully operational as described.