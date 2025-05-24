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
- [Testing](#testing)
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
   - For production:
     ```bash
     npm start
     ```
   - For development (with hot reload):
     ```bash
     npm run dev

4. **Running tests:**
    ```bash
    npm test
    ```

## Usage

- Start the timer and work in focused intervals
- Create and manage your tasks
- Click on a task to set it as the current focus
- Mark tasks as complete when finished

## Configuration

Before running the application, copy `.env.example` to create your own environment files:

```bash
cp .env.example .env
cp .env.example .env.test
```

Edit `.env` for development, `.env.test` for testing, and (optionally) create `.env.production` for production.  
**Never commit real secrets to version control.**  
All required environment variables are documented in `.env.example`.

## Testing

To run the test suite (using your test database and `.env.test`):

```bash
npm test
```

Make sure your test database is set up and credentials are correct in `.env.test`.

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
