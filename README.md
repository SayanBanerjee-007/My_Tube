# My Tube Backend

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D%2014.x-brightgreen.svg)
![Express.js](https://img.shields.io/badge/express-%5E4.18.1-orange.svg)
![MongoDB](https://img.shields.io/badge/mongoDB-%5E4.0.0-yellowgreen.svg)

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)

## Project Overview

My Tube Backend is a RESTful API developed with Node.js and Express.js to support a video-sharing platform similar to YouTube. It manages videos, user accounts, and comments. The application connects to a MongoDB database for data persistence.

## Features

- User authentication and authorization
- CRUD operations for videos
- CRUD operations for comments
- User profile management
- Token-based authentication with JWT
- Middleware for request validation and error handling
- Structured logging for server activities
- Rate limiting to prevent abuse

## Prerequisites

Before running this application, ensure you have the following installed on your machine:

- **Node.js** (version 14.x or higher)
- **npm** (Node Package Manager, which comes with Node.js)
- **MongoDB** (local instance or cloud service like MongoDB Atlas)

## Installation

Follow these steps to set up and run the application locally:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/SayanBanerjee-007/My_Tube_Backend.git
   cd My_Tube_Backend
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Environment Variables**

   Create a `.env` file in the root directory of the project and copy the content of the `.env.sample` file into it. Update the environment variables with your values.:

## Running the Application

Once you have configured your environment, you can start the application using:

```bash
npm start
```

The server will start on the specified port (default: 5000) and connect to the MongoDB database.

## Development Mode

For development mode with live-reloading, use:

```bash
npm run dev
```

This command uses nodemon to automatically restart the server upon code changes.

## Accessing the Application

Once the server is running, you can access the API endpoints via:

```bash
http://localhost:5000/api
```

## API Documentation

<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 20px;">

  <h3 style="color: #555;">Authentication</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <thead>
      <tr>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4; font-weight: bold;">Endpoint</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4; font-weight: bold;">Method</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4; font-weight: bold;">Description</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4; font-weight: bold;">Request Body</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #f9f9f9;">
        <td style="border: 1px solid #ddd; padding: 8px;">/api/auth/register</td>
        <td style="border: 1px solid #ddd; padding: 8px;">POST</td>
        <td style="border: 1px solid #ddd; padding: 8px;">Register User</td>
        <td style="border: 1px solid #ddd; padding: 8px;">
          <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto;">{
  "username": "user",
  "email": "user@example.com",
  "password": "password"
}</pre>
        </td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">/api/auth/login</td>
        <td style="border: 1px solid #ddd; padding: 8px;">POST</td>
        <td style="border: 1px solid #ddd; padding: 8px;">Login User</td>
        <td style="border: 1px solid #ddd; padding: 8px;">
          <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto;">{
  "email": "user@example.com",
  "password": "password"
}</pre>
        </td>
      </tr>
    </tbody>
  </table>

  <h3 style="color: #555;">Users</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <thead>
      <tr>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4; font-weight: bold;">Endpoint</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4; font-weight: bold;">Method</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4; font-weight: bold;">Description</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4; font-weight: bold;">Request Body</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #f9f9f9;">
        <td style="border: 1px solid #ddd; padding: 8px;">/api/users</td>
        <td style="border: 1px solid #ddd; padding: 8px;">GET</td>
        <td style="border: 1px solid #ddd; padding: 8px;">Get All Users</td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">/api/users/:id</td>
        <td style="border: 1px solid #ddd; padding: 8px;">GET</td>
        <td style="border: 1px solid #ddd; padding: 8px;">Get User by ID</td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
      </tr>
      <tr style="background-color: #f9f9f9;">
        <td style="border: 1px solid #ddd; padding: 8px;">/api/users/:id</td>
        <td style="border: 1px solid #ddd; padding: 8px;">PUT</td>
        <td style="border: 1px solid #ddd; padding: 8px;">Update User</td>
        <td style="border: 1px solid #ddd; padding: 8px;">
          <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto;">{
  "username": "newusername",
  "email": "newemail@example.com"
}</pre>
        </td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">/api/users/:id</td>
        <td style="border: 1px solid #ddd; padding: 8px;">DELETE</td>
        <td style="border: 1px solid #ddd; padding: 8px;">Delete User</td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
      </tr>
    </tbody>
  </table>

  <h3 style="color: #555;">Videos</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <thead>
      <tr>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4; font-weight: bold;">Endpoint</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4; font-weight: bold;">Method</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4; font-weight: bold;">Description</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4; font-weight: bold;">Request Body</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #f9f9f9;">
        <td style="border: 1px solid #ddd; padding: 8px;">/api/videos</td>
        <td style="border: 1px solid #ddd; padding: 8px;">GET</td>
        <td style="border: 1px solid #ddd; padding: 8px;">Get All Videos</td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">/api/videos/:id</td>
        <td style="border: 1px solid #ddd; padding: 8px;">GET</td>
        <td style="border: 1px solid #ddd; padding: 8px;">Get Video by ID</td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
      </tr>
      <tr style="background-color: #f9f9f9;">
        <td style="border: 1px solid #ddd; padding: 8px;">/api/videos</td>
        <td style="border: 1px solid #ddd; padding: 8px;">POST</td>
        <td style="border: 1px solid #ddd; padding: 8px;">Create Video</td>
        <td style="border: 1px solid #ddd; padding: 8px;">
          <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto;">{
  "title": "Video Title",
  "description": "Video Description",
  "url": "http://video-url.com"
}</pre>
        </td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">/api/videos/:id</td>
        <td style="border: 1px solid #ddd; padding: 8px;">PUT</td>
        <td style="border: 1px solid #ddd; padding: 8px;">Update Video</td>
        <td style="border: 1px solid #ddd; padding: 8px;">
          <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto;">{
  "title": "Updated Title",
  "description": "Updated Description"
}</pre>
        </td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">/api/videos/:id</td>
        <td style="border: 1px solid #ddd; padding: 8px;">DELETE</td>
        <td style="border: 1px solid #ddd; padding: 8px;">Delete Video</td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
      </tr>
    </tbody>
  </table>

  <h3 style="color: #555;">Comments</h3>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <thead>
      <tr>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4; font-weight: bold;">Endpoint</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4; font-weight: bold;">Method</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4; font-weight: bold;">Description</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f4f4f4; font-weight: bold;">Request Body</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #f9f9f9;">
        <td style="border: 1px solid #ddd; padding: 8px;">/api/videos/:videoId/comments</td>
        <td style="border: 1px solid #ddd; padding: 8px;">GET</td>
        <td style="border: 1px solid #ddd; padding: 8px;">Get All Comments for a Video</td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">/api/videos/:videoId/comments</td>
        <td style="border: 1px solid #ddd; padding: 8px;">POST</td>
        <td style="border: 1px solid #ddd; padding: 8px;">Add Comment to a Video</td>
        <td style="border: 1px solid #ddd; padding: 8px;">
          <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto;">{
  "text": "Nice video!"
}</pre>
        </td>
      </tr>
      <tr style="background-color: #f9f9f9;">
        <td style="border: 1px solid #ddd; padding: 8px;">/api/comments/:commentId</td>
        <td style="border: 1px solid #ddd; padding: 8px;">PUT</td>
        <td style="border: 1px solid #ddd; padding: 8px;">Update Comment</td>
        <td style="border: 1px solid #ddd; padding: 8px;">
          <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto;">{
  "text": "Updated comment text"
}</pre>
        </td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">/api/comments/:commentId</td>
        <td style="border: 1px solid #ddd; padding: 8px;">DELETE</td>
        <td style="border: 1px solid #ddd; padding: 8px;">Delete Comment</td>
        <td style="border: 1px solid #ddd; padding: 8px;"></td>
      </tr>
    </tbody>
  </table>

</body>

There are more routes available in the application. You can explore them by running the application and visiting the `/api` endpoint.
