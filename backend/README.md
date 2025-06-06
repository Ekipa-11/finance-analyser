# Finance analyser server
This is the backend of finance-analyser

![Logo](../frontend/src/icons/logo_96x96.png)

## Running

Make sure environment variables are set.  
For more information, see the [Environment Variables](#environment-variables) section below.

### Vapid Keys

Before running the server, you need to generate VAPID keys for web push notifications.
You can generate them using the following command:
```bash
npx web-push generate-vapid-keys
```

This will output a public and private key.  
You need to set these keys in your [`.env`](#environment-variables) file.  

[Docker](#docker-compose) already sets them in the `docker-compose.yaml` file, but those are only placeholders for development purposes.  
Make sure to replace them with your own keys in production.

### Docker compose

Some environment variables are set in `docker-compose.yaml` and `docker-compose.dev.yaml`.

```bash
docker compose up -d
```

Check the [recommended way](#development) to run the backend in development mode.

### Node.js
You can also run the backend without Docker. A MongoDB instance is required to be running separately.
1. Install dependencies:
```bash
npm install
```
2. Start the server:
```bash
npm start
```


## Environment Variables

Make sure to set the following environment variables in a `.env` file or in your environment:
```yaml
MONGO_URI=mongodb://mongo:27017/fin-analy-db # set in docker-compose.yaml
PORT=3000 # set in docker-compose.yaml
API_PREFIX=/api # set in docker-compose.yaml
JWT_SECRET=default_jwt_secret # set in docker-compose.yaml but should be replaced with your own secret
VAPID_PUBLIC_KEY=your_public_vapid_key # set in docker-compose.yaml but should be replaced with your own key
VAPID_PRIVATE_KEY=your_private_vapid_key # set in docker-compose.yaml but should be replaced with your own key
```

## Development

### Running docker
 
```bash
docker compose -f docker-compose.dev.yaml up -d --build
```
or my recommended way (a 1 liner):
```bash
docker compose -f docker-compose.dev.yaml down && docker compose -f docker-compose.dev.yaml up --build -d && docker compose logs fin-analy-express -f --no-log-prefix
```


### HTTP Client
You can use the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension for VS Code to test the API endpoints.  
You can find the HTTP requests in the `.dev/httpRoutes` folder.  
Read more about it in the corresponding [README](.dev/httpRoutes/README.md).



## REST
`/api` can be changed with the `API_PREFIX` environment variable.  
Check [Environment Variables](#environment-variables) section above.

1. Authentication:
    - POST /api/login - User login (returns JWT).
    - POST /api/register - Register a new user.

2. User Management:
    - GET /api/users - Returns a list of all users.
    - GET /api/users/:id - Returns a specific user by ID.
    - GET /api/users/:id/all - Returns all data for a specific user by ID. (including transactions, budgets, notifications)
    - GET /api/users/me - Returns the currently authenticated user. (With all data)
    - PUT /api/users/:id - Updates a specific user by ID.
    - DELETE /api/users/:id - Deletes a specific user by ID.

3. Transaction Management:
    - GET /api/transactions - Returns a list of all user transactions.
    - GET /api/transactions/:id - Returns a specific transaction by ID.
    - POST /api/transactions - Creates a new transaction.
        - if no `date` is provided, the current date is used.
        - if no `type` is provided, it defaults to "expense".
    - PUT /api/transactions/:id - Updates an existing transaction.
    - DELETE /api/transactions/:id - Deletes a transaction.
        - if category isn't part of any transaction, it is deleted as well.

4. Budget Management:
    - GET /api/budgets - Returns a list of all user budgets.
        - also returns calculated `actualIncome`, `actualExpenses`, `incomeVariance`, `expensesPerformance` for each budget.
    - GET /api/budgets/:id - Returns a specific budget by ID.
        - also returns calculated `actualIncome`, `actualExpenses`, `incomeVariance`, `expensesPerformance` for each budget.
    - POST /api/budgets - Creates a new budget.
        - if no `month` and `year` are provided, the current month and year are used.
    - PUT /api/budgets/:id - Updates an existing budget.
    - DELETE /api/budgets/:id - Deletes a budget.

5. Category Management:
    - GET /api/categories - Returns a list of all user categories.
    - POST /api/categories - Creates a new category.
    - PUT /api/categories/:id - Updates an existing category.
    - DELETE /api/categories/:id - Deletes a category.

6. Notifications:
    - POST /api/subscribe - Subscribes a user to notifications.

7. Exports:
    - GET /api/export - exports all transactions to a CSV file.
    - GET /api/report - generates a report of the user's finances as a PDF file.


## Data Structures

### Transaction

| Field       | Type                      | Description                        |
|-------------|---------------------------|------------------------------------|
| id          | ObjectId                  | Unique identifier                  |
| user_id     | ObjectId (ref: User)      | Reference to the user              |
| type        | String ("income"/"expense")| Transaction type                   |
| amount      | Number                    | Transaction amount                 |
| date        | Date                      | Date of transaction                |
| category    | String                    | Transaction category               |
| description | String                    | Description of the transaction     |
| created_at  | Date                      | Creation timestamp                 |
| updated_at  | Date                      | Last update timestamp              |

### User

| Field      | Type     | Description            |
|------------|----------|------------------------|
| id         | ObjectId | Unique identifier      |
| username   | String   | Username               |
| password   | String   | Hashed password        |
| email      | String   | User email             |
| created_at | Date     | Creation timestamp     |
| updated_at | Date     | Last update timestamp  |

### Subscription

| Field      | Type     | Description            |
|------------|----------|------------------------|
| id         | ObjectId | Unique identifier      |
| endpoint   | String   | Subscription endpoint  |
| keys       | Object   | Subscription keys      |

- p256dh     | String   | Public key             |
- auth       | String   | Authentication key     |

### Budget

| Field      | Type                 | Description                  |
|------------|----------------------|------------------------------|
| id         | ObjectId             | Unique identifier            |
| user_id    | ObjectId (ref: User) | Reference to the user        |
| month      | Number               | Month of the budget          |
| year       | Number               | Year of the budget           |
| income     | Number               | Total income                 |
| expenses   | Number               | Total expenses               |
| created_at | Date                 | Creation timestamp           |
| updated_at | Date                 | Last update timestamp        |

### Category

| Field      | Type     | Description            |
|------------|----------|------------------------|
| id         | ObjectId | Unique identifier      |
| name       | String   | Category name          |
| created_at | Date     | Creation timestamp     |
| updated_at | Date     | Last update timestamp  |
