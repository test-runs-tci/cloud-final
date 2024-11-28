Project Summary:

This project is a tracker application for tracking stock trades. It utilizes
a microservices architecture.  Contained in the project is a frontend and backend
microservice. The project also uses AWS Cognito to handle account creation and authentication.
Also, a Postgres database is used.

The Frontend is a React Application, and the Backend is an API. the Frontend communicates with
AWS Cognito to facilitate account creation, and authenticaion. The Frontend also contains
a data grid for displaying trades, as well as Create, Edit, and Delete functionality.

The Backend is an API that the Frontend interacts with to provide the CRUD functionality, and is
protected by validating a JWT accessToken.

The Backend communicates with a Postgres server. If you are running locally using docker-compose, 
for development, the Postgres server will be spun up locally, the Kubernetes deployment will use
an AWS hosted Postgres server.

The integration tests are in the tests directory. Please refer to the README there for running the tests
after you have the application up and running.

How to run the application:

1. Set up AWS Cognito. The users created in cognito should sign in with email address and password. Access Tokens should be able to be granted.
   Create the settings accordingly.
    1. Create a new User Pool in AWS cognito and save the user pool ID for later
    2. Within that user pool, create an App client and save the app id for later

2. For Kubernetes deployments only, create a Postgres DB within AWS RDS.

3. To deploy locally (mainly for development)
    1. Enter the deployment/docker directory
    2. Copy env.local to .env.
        1. Only replace the values where specified
        2. The Postgres user, password, and DB name will be generated
           for your local environment, so when running locally, you don't
           have to know them ahead of time, you decide what they will be now
    3. In the two yaml files, replace mzucc with your own DockerHub name
    4. Build your containers
       # docker-compose -f docker-compose-build.yaml build
    5. Run your containers
       # docker-compose -f docker-compose.yaml up
    6. Sign into the application locally:
       http://localhost:5173
    7. Create a new user for yourself, and sign in
    8. Test the application by creating, updating, and deleting a stock trade.
    9. Run the integration tests (view the README inside the tests directory)

