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

cd server
npm install
cp .env.example .env # fill in Mongo URI + secrets
npm run seed # optional: create the admin user
npm start

### Client

cd client
npm install
npm start
