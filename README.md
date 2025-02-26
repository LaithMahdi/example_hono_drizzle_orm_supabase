# Example Hono + Supabase Project

This is a sample project demonstrating how to build a RESTful API using **Hono** (a fast and lightweight web framework) and **Supabase** (a backend-as-a-service platform). The project uses **Drizzle ORM** for database interactions and **Zod** for schema validation.

---

## Features

- **CRUD API**: Create, Read, Update, and Delete operations for a `products` table.
- **Pagination and Filtering**: Supports pagination and filtering for the `GET /products/all` endpoint.
- **Validation**: Uses **Zod** for request validation.
- **Database Migrations**: Uses **Drizzle ORM** for database schema management.
- **Environment Variables**: Uses `dotenv` for managing environment variables.

---

## Technologies Used

- [Hono](https://hono.dev/): A fast and lightweight web framework.
- [Supabase](https://supabase.com/): A backend-as-a-service platform.
- [Drizzle ORM](https://orm.drizzle.team/): A TypeScript ORM for SQL databases.
- [Zod](https://zod.dev/): A TypeScript-first schema validation library.
- [Faker.js](https://fakerjs.dev/): A library for generating fake data (used for seeding).

---

## Prerequisites

Before running the project, ensure you have the following installed:

- [Bun](https://bun.sh/) (latest version)
- [PostgreSQL](https://www.postgresql.org/) (or a Supabase database)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for local Supabase setup)

---

## Setup

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/LaithMahdi/example_hono_drizzle_orm_supabase.git
    cd example_hono_drizzle_orm_supabase
    ```

2.  **Install Dependencies**

    ```bash
    bun install
    ```

3.  **Set Up Environment Variables**

    Create a `.env` file in the root directory and add the following variables:

    ```env
    DATABASE_URL="postgres://user:password@localhost:5432/dbname"
    SUPABASE_URL="https://your-supabase-url.supabase.co"
    SUPABASE_KEY="your-supabase-anon-key"
    ```

    Replace the placeholders with your actual database and Supabase credentials.

4.  **Run Database Migrations**

    Apply the database schema using Drizzle ORM:

    ```bash
    bun run db:push
    ```

    Alternatively, you can generate and run migrations:

    ```bash
    bun run db:generate
    bun run db:migrate
    ```

5.  **Seed the Database (Optional)**

    If you want to seed the database with sample data, run:

    ```bash
    bun run db:seed
    ```

---

## Running the Project

1.  **Start the Development Server**

    ```bash
    bun run dev
    ```

    The server will start at `http://localhost:3000`.

2.  **Access the API**

    You can interact with the API using tools like [Postman](https://www.postman.com/) or `curl`.

---

## API Endpoints

### 1. **Get All Products (Paginated)**

- **Endpoint**: `GET /products/all`
- **Query Parameters**:

  - `page`: Page number (default: `1`).
  - `limit`: Number of items per page (default: `10`).
  - `isActive`: Filter by `isActive` status (optional).

- **Example**:

  ```bash
  curl "http://localhost:3000/api/v1/products/all?page=1&limit=10&isActive=true"
  ```

- **Response**:

  ```json
  {
    "data": [
      {
        "id": 1,
        "name": "Product 1",
        "description": "Description for Product 1",
        "price": 19.99,
        "isActive": true
      }
    ],
    "totalItems": 100,
    "pageInfo": {
      "hasPreviousPage": false,
      "hasNextPage": true
    }
  }
  ```

### 2. **Get a Single Product**

- **Endpoint**: `GET /products/:id`
- **Example**:

  ```bash
  curl "http://localhost:3000/api/v1/products/1"
  ```

- **Response**:

  ```json
  {
    "id": 1,
    "name": "Product 1",
    "description": "Description for Product 1",
    "price": 19.99,
    "isActive": true
  }
  ```

### 3. **Create a Product**

- **Endpoint**: `POST /products`
- **Request Body**:

  ```json
  {
    "name": "New Product",
    "description": "Product description",
    "price": 29.99,
    "isActive": true
  }
  ```

- **Response**:

  ```json
  {
    "id": 2,
    "name": "New Product",
    "description": "Product description",
    "price": 29.99,
    "isActive": true
  }
  ```

### 4. **Update a Product**

- **Endpoint**: `PUT /products/:id`
- **Request Body**:

  ```json
  {
    "name": "Updated Product",
    "price": 39.99
  }
  ```

- **Response**:

  ```json
  {
    "id": 1,
    "name": "Updated Product",
    "description": "Description for Product 1",
    "price": 39.99,
    "isActive": true
  }
  ```

### 5. **Delete a Product**

- **Endpoint**: `DELETE /products/:id`
- **Example**:

  ```bash
  curl -X DELETE "http://localhost:3000/api/v1/products/1"
  ```

- **Response**:

  ```json
  {
    "message": "Product deleted successfully"
  }
  ```

---

## Middleware

- **Authentication Middleware**: Ensures API access is restricted to authenticated users.
- **Error Handling Middleware**: Catches and formats API errors.
- **Request Validation Middleware**: Uses **Zod** to validate request payloads.

---

## Postman Collection

A Postman collection for testing the API is available [here](https://www.postman.com/your-collection-link).

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Acknowledgments

- [Hono](https://hono.dev/) for the lightweight web framework.
- [Supabase](https://supabase.com/) for the backend-as-a-service platform.
- [Drizzle ORM](https://orm.drizzle.team/) for the TypeScript ORM.
- [Zod](https://zod.dev/) for schema validation.

---

Enjoy building with Hono and Supabase! 🚀
