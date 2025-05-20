# PomoManager

A web application that helps you boost productivity by combining the Pomodoro time management method with a simple task manager.

## Features

- Pomodoro timer with customizable intervals
- Task creation, editing, and deletion
- Task completion tracking
- Audio/visual notifications
- Responsive design for mobile and desktop
- User authentication to sync data across devices

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

## Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/Josh1185/Pomodoro-WebApp.git
    cd Pomodoro-WebApp
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Start the application:**
    ```bash
    npm start
    ```

## Usage

- Start the timer and work in focused intervals.
- Create and manage your tasks.
- Click on a task to set it as the current focus
- Mark tasks as complete when finished.

## Configuration

Before running the application, create a .env file in the root directory and add the following environment variables:

```
JWT_SECRET="your_secret_string"        # Secret key for signing JWT tokens
PORT=3000                              # Port the server will run on

PG_HOST=localhost                      # Host for the PostgreSQL database
PG_PORT=5432                           # Port for the database
PG_DATABASE=your_db                    # Database name
PG_USER=your_user                      # Database user
PG_PASSWORD=your_pwd                   # Database password

# (Optional) Google OAuth Configuration:
# NOTE: For Google OAuth to work, you must have a Google Cloud project set up with OAuth credentials configured for your app's redirect URI. Visit: https://developers.google.com/identity/protocols/oauth2 

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License.

## Author

Josh1185  
Email: iehlejosh@gmail.com
