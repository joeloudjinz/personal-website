---
title: 'RESTful API Interview Revision Cheatsheet'
slug: 'rest-api-interview-prep-cheatsheet'
description: 'Master your backend interview with this RESTful API cheatsheet. It covers the 6 constraints, Idempotency, HTTP status codes, and critical differences like PUT vs PATCH.'
tags: [ "REST API", "Backend Development", "Interview Prep", "HTTP", "Cheatsheet" ]
pubDate: 'Oct 20 2025'
---

# RESTful API Interview Revision Cheatsheet

Going into a system design or backend interview? You likely know what an API is, but can you articulate the difference
between `PUT` and `PATCH` without stumbling? Can you explain Idempotency like a Senior Engineer?

I wrote this guide to be the quick-reference I wish I had before my technical screens. It covers the definitions, the "
Gotchas," and the unspoken rules of REST.

## 1. Fundamental Definitions

* **API (Application Programming Interface):** The communication bridge between two software components. It defines the
  contract (rules) for how they exchange data.
* **REST (REpresentational State Transfer):** It is **not** a protocol (like HTTP) but an **architectural style**. It
  defines a specific set of constraints for distributed systems.
* **RESTful API:** An API that strictly adheres to the 6 constraints of REST.

---

## 2. The 6 Constraints (The Rules)

*Interviewer Question: "What makes an API RESTful?"*

1. **Client-Server:** **Separation of Concerns.** The backend (Server) focuses on data and logic; the frontend (Client)
   focuses on the UI. They can evolve totally independently.
2. **Stateless:** **The Golden Rule.** The server stores **no session context**. Every request must contain all
   necessary info (including the auth token).
    * *Why?* It allows the server to scale horizontally easily. Any server node can handle any request because no one
      node holds "state."
3. **Cacheability:** Responses must define if they are cacheable. This prevents the client from reusing stale data or
   overloading the server with redundant requests.
4. **Uniform Interface:** The system must be consistent.
    * **Resources** are identified by URLs.
    * **Representations** (like JSON) are used to manipulate data.
    * **HATEOAS** (Hypermedia as the Engine of Application State).
   > **⚠️ Real World Note:** HATEOAS means the API returns links to valid next actions (like a "next page" link). While
   this is a strict REST rule, **most modern APIs skip this** to reduce payload size. Mentioning this nuance shows
   experience.
5. **Layered System:** The client shouldn't know (or care) if it's talking to the app server, a load balancer, or a CDN.
6. **Code on Demand (Optional):** The server *can* send executable code (like JS) to the client. This is rarely used in
   modern REST APIs.

---

## 3. Anatomy of a Request

Don't just list headers; visualize the raw text that travels over the wire.

### The Request (What you send)

```http
POST /v1/users HTTP/1.1
Host: api.mysite.com
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json

{
  "username": "jdoe",
  "email": "john@example.com"
}
```

### The Response (What you get)

```http
HTTP/1.1 201 Created
Date: Mon, 01 Jan 2024 12:00:00 GMT
Content-Type: application/json

{
  "id": "550e8400-e29b",
  "status": "active",
  "link": "/v1/users/550e8400-e29b"
}
```

---

## 4. HTTP Methods & The "Idempotency" Trap

This is the most common failure point in interviews.

**Idempotency Definition:** An operation is *idempotent* if making the same request multiple times produces the **same
result** (state) on the server as making it once. It’s crucial for network reliability (is it safe to retry?).

| Method     | Action  | Idempotent? | Why?                                                                                                                                                     |
|:-----------|:--------|:------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------|
| **GET**    | Read    | ✅ Yes       | Reading data doesn't change it.                                                                                                                          |
| **POST**   | Create  | ❌ **NO**    | If you `POST /orders` 5 times, you create 5 distinct orders.                                                                                             |
| **PUT**    | Replace | ✅ Yes       | `PUT /users/1` always sets User 1's state to exactly what you sent. Doing it 5 times changes nothing after the first time.                               |
| **PATCH**  | Modify  | ❌ **NO**    | **Technically No.** If `PATCH` sends an instruction like `{ "balance": +10 }`, sending it 5 times adds 50. It *can* be idempotent, but isn't guaranteed. |
| **DELETE** | Remove  | ✅ Yes       | Deleting a record once removes it. Deleting it again returns a 404, but the server state (record is gone) remains the same.                              |

### The "PUT vs PATCH" Difference

* **PUT** is for **Replacement**. You send the *entire* object. If a field is missing in your payload, the server
  typically sets it to null or default.
* **PATCH** is for **Partial Updates**. You only send the fields that changed.

---

## 5. Status Codes (The Big 4 Categories)

Memorize the logic, not the list.

### 2xx: Success

* `200 OK`: Standard success.
* `201 Created`: The resource was successfully created (standard response for POST).
* `204 No Content`: The action worked, but there is no data to return (standard response for DELETE).

### 3xx: Redirection

* `301 Moved Permanently`: The URI has changed forever.
* `304 Not Modified`: Crucial for caching. "Your cached version is still good, don't download it again."

### 4xx: Client Errors (You messed up)

* `400 Bad Request`: Generic syntax error.
* **The Auth Confusion:**
    * `401 Unauthorized`: **"Who are you?"** (Authentication missing or invalid). *Note: The spec names this "
      Unauthorized", but it actually means "Unauthenticated".*
    * `403 Forbidden`: **"I know who you are, but you can't do this."** (Authorization/Permissions denied).
* `404 Not Found`: Resource doesn't exist.

### 5xx: Server Errors (We messed up)

* `500 Internal Server Error`: Generic explosion.
* `503 Service Unavailable`: Server is down or overloaded.

---

## 6. API Design Best Practices

* **Nouns over Verbs:** Use `/articles`, never `/getArticles`.
* **Plural Nouns:** Keep it consistent. `/users/123` is better than `/user/123`.
* **Versioning:** Always version the API (`/v1/orders`) to prevent breaking changes for mobile apps that users haven't
  updated.
* **Filtering:** Use Query Parameters for sorting/filtering (`/users?role=admin`), not new paths (`/adminUsers`).

---

## 7. Security: AuthN vs. AuthZ

* **Authentication (AuthN):** Verifying **Identity**.
    * *Analogy:* The receptionist checking your ID badge.
* **Authorization (AuthZ):** Verifying **Permissions**.
    * *Analogy:* The keycard reader checking if your badge opens the server room door.

**Common Standards:**

* **Basic Auth:** Base64 encoded credentials (unsafe without HTTPS).
* **Bearer Token (JWT):** The standard for REST. Stateless tokens containing user claims.
* **OAuth 2.0:** Delegation protocol (e.g., "Log in with Google").

---

## 8. Tricky Interview Questions (The "Gotchas")

**Q: What is the difference between URI and URL?**
A: All URLs are URIs, but not all URIs are URLs.

* **URI (Identifier):** Like a person's name. It identifies who they are.
* **URL (Locator):** Like a person's address. It tells you *where* they are and *how* to reach them.

**Q: When should you use Path Params vs. Query Params?**

* **Path Param** (`/users/101`): Use when identifying a specific resource. It acts as the "ID".
* **Query Param** (`/users?role=admin`): Use when sorting, filtering, or paginating a list of resources.

**Q: Is REST always the best choice?**
A: No.

* Use **GraphQL** if you need to fetch complex, nested data and avoid over-fetching.
* Use **gRPC** for internal microservices requiring high performance and low latency.
* Use **WebSockets** for real-time, bi-directional data (chat apps).
