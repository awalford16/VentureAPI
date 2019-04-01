# Venture API

## Description
Venture is a web app designed to promote events happening in the local area. 

Venture API provides the standard CRUD calls for to allow authenticated users to create and edit events and uses mongodb to store all data.

The API is validated against the [OWASP dependency check]("https://www.owasp.org/index.php/OWASP_Dependency_Check") and uses various security tools such as helmet HTTP header encryption and [express rate limit]("https://www.npmjs.com/package/express-rate-limit") to protect against DoS. 

## Running the Tests
Integration tests are included, implemented using Jest and super test. However, express rate limiter may need to be disabled to get the tests to pass. Execute the following command within the top directory to run all the tests and view the code coverage:

```
npm test
```