# Habit Insight API

Backend REST API for a habit analytics app built with **Node.js**, **Express**, **MongoDB**, **Mongoose** and **JWT authentication**.

The project supports user authentication, habit CRUD, daily habit completion, progress history, streak tracking and analytical statistics.

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- dotenv
- cors
- helmet
- morgan
- express-rate-limit

---

## Repository

```txt
habit-insight-api
```

Frontend repository planned:

```txt
habit-insight-client
```

---

## API Base URL

```txt
http://localhost:3333
```

---

## Postman

API requests and testing flow are available here:

[Open Postman Collection](https://www.postman.com/rusrus-0110-7576566/workspace/habit-insight-api/request/54594403-ba535c56-85ba-473d-ac38-7b9986e2152b?action=share&creator=54594403&active-environment=54594403-244833f0-dd2b-4b4f-b30f-45dc814f4a54)

Recommended Postman environment variables:

| Variable  | Value                   |
| --------- | ----------------------- |
| `baseUrl` | `http://localhost:3333` |
| `token`   | JWT token after login   |
| `userId`  | Current user id         |
| `habitId` | Created habit id        |

---

## Installation

```bash
git clone https://github.com/rusrus0110-star/habit-insight-api.git
cd habit-insight-api
npm install
```
