# Finance analyser server
This is the backend of finance-analyser
 
## Running

Make sure environment variables are set.  
For more information, see the [Environment Variables](#environment-variables) section below.

### Docker compose

Some environment variables are set in `docker-compose.yaml` and `docker-compose.dev.yaml`.

```bash
docker compose up -d
```


## Environment Variables

Make sure to set the following environment variables in a `.env` file or in your environment:
```yaml
MONGO_URI=mongodb://mongo:27017/fin-analy-db # set in docker-compose.yaml
PORT=3000 # set in docker-compose.yaml
API_PREFIX=/api # set in docker-compose.yaml
JWT_SECRET=default_jwt_secret
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

You can use Docker to run the backend with the development configuration.  

This adds mongo-express as a web interface for MongoDB, which is useful for development and debugging.  
Available at `http://localhost:8080`, with default credentials `admin:pass`

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
    - PUT /api/users/:id - Updates a specific user by ID.
    - DELETE /api/users/:id - Deletes a specific user by ID.

3. Transaction Management:
    - GET /api/transactions - Returns a list of all user transactions.
    - GET /api/transactions/:id - Returns a specific transaction by ID.
    - POST /api/transactions - Creates a new transaction.
    - PUT /api/transactions/:id - Updates an existing transaction.
    - DELETE /api/transactions/:id - Deletes a transaction.

4. Budget Management:
    - GET /api/budgets - Returns a list of all user budgets.
    - GET /api/budgets/:id - Returns a specific budget by ID.
    - POST /api/budgets - Creates a new budget.
    - PUT /api/budgets/:id - Updates an existing budget.
    - DELETE /api/budgets/:id - Deletes a budget.

5. Category Management:
    - GET /api/categories - Returns a list of all user categories.
    - POST /api/categories - Creates a new category.
    - PUT /api/categories/:id - Updates an existing category.
    - DELETE /api/categories/:id - Deletes a category.

6. Notifications:
    - GET /api/notifications - Returns a list of all user notifications.
    - POST /api/notifications - Creates a new notification.
    - PUT /api/notifications/:id - Updates an existing notification
    - PUT /api/notifications/:id/read- Marks a notification as read.
    - PUT /api/notifications/:id/unread - Marks a notification as unread.
    - DELETE /api/notifications/:id - Deletes a notification.

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

### Notification

| Field      | Type                 | Description                  |
|------------|----------------------|------------------------------|
| id         | ObjectId             | Unique identifier            |
| user_id    | ObjectId (ref: User) | Reference to the user        |
| message    | String               | Notification message         |
| type       | String               | Notification type            |
| read       | Boolean              | Read status                  |
| created_at | Date                 | Creation timestamp           |
| updated_at | Date                 | Last update timestamp        |

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
