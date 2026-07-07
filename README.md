# Band & Concert Tracker

A full-stack web app for cataloguing bands and concerts, with role-based
access: admins manage the global catalogue, while users favourite, plan,
attend, rate, and review concerts.

## Tech stack

React · Node.js · Express · MongoDB (Atlas) · JWT · Joi · bcrypt

## Features

- JWT authentication with role-based access control (admin vs. user)
- Admin CRUD for bands and concerts
- Per-user concert entries: favourite / planned / attended states
- 1–5 ratings and written reviews, visible to other users
- Server-side validation (Joi) and password hashing (bcrypt)

## Project structure

- `server/` — Express REST API, Mongoose models, auth middleware
- `client/` — React single-page app

## Running locally

### Server

1. cd server
2. npm install
3. cp .env.example .env # fill in Mongo URI + secrets
4. npm run seed # optional: create the admin user
5. npm start

### Client

1. cd client
2. npm install
3. npm start
