# CineVault

CineVault is a cinematic movie discovery web application with OMDb API integration, custom collection management, and a responsive dark interface.

## 🚀 Project Overview

CineVault allows users to search movies and series, save favorites, and organize titles into custom collections. The app is built with a frontend powered by vanilla JavaScript and a lightweight Node.js + Express server for static hosting.

## ✨ Features

- Responsive dark-themed UI for desktop and mobile
- Search movies and series using the OMDb API
- Toggle between grid view and list view
- Save favorites and organize movies into folders
- Persistent user data with LocalStorage
- Detailed movie information with IMDb rating, plot, and cast

## 🧩 Technologies

- HTML5
- CSS3
- JavaScript
- Node.js
- Express
- OMDb API
- LocalStorage

## 📁 Project Structure

```
omdb-project/
├── assets/          # Static media assets (images, icons, textures)
├── node_modules/    # Dependencies installed by npm
├── app.js           # Frontend logic and API management
├── index.html       # Main UI markup
├── server.js        # Node.js + Express server
├── style.css        # App styling and responsive design
├── package.json     # Project metadata and dependencies
└── README.md        # Project documentation
```

## ⚙️ Installation

1. Clone the repository

```bash
git clone https://github.com/nidanursigirta/cinevault.git
cd omdb-project
```

2. Install dependencies

```bash
npm install
```

3. Start the server

```bash
node server.js
```

4. Open the app

Navigate to `http://localhost:3000`

## 📝 Notes

- Make sure you have Node.js installed.
- The app fetches movie data from the OMDb API, so an active internet connection is required.

## 👤 Author

Nidanur Sigirta

## 📜 License

This project is licensed under ISC.
