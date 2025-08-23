# UCSB CS156 Dining Review Application

UCSB Dining Review Application is a Spring Boot backend + React frontend web application for dining hall menu management and reviews.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap, Build, and Test the Repository

- **CRITICAL**: Install Java 21:
  - `sudo apt update && sudo apt install -y openjdk-21-jdk`
  - `sudo update-alternatives --config java` (select Java 21)
  - `export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64`
- Set up environment:
  - `cp .env.SAMPLE .env`
- Backend compilation: `mvn compile` -- takes 47 seconds. NEVER CANCEL. Set timeout to 90+ seconds.
- Backend unit tests: `mvn test` -- takes 40 seconds, runs 78 tests. NEVER CANCEL. Set timeout to 90+ seconds.
- Backend mutation testing: `mvn pitest:mutationCoverage` -- takes 2 minutes 34 seconds. NEVER CANCEL. Set timeout to 300+ seconds.
- Frontend setup: `cd frontend && npm install` -- takes 4 seconds (if dependencies already exist).
- Frontend build: `cd frontend && npm run build` -- takes 12 seconds. NEVER CANCEL. Set timeout to 30+ seconds.
- Frontend tests: `cd frontend && npm test -- --watchAll=false` -- takes 8 seconds, runs 120 tests (1 known failing test related to date formatting). NEVER CANCEL. Set timeout to 30+ seconds.
- Frontend coverage: `cd frontend && npm run coverage` -- takes 8 seconds. NEVER CANCEL. Set timeout to 30+ seconds.

### Integration Tests

- **CRITICAL**: Integration tests require Playwright browsers to be installed.
- Integration tests: `INTEGRATION=true mvn test-compile failsafe:integration-test` -- takes 3+ minutes but may fail without Playwright browsers.
- To see integration tests run visually: `INTEGRATION=true HEADLESS=false mvn test-compile failsafe:integration-test`
- Run specific integration test: `INTEGRATION=true mvn test-compile failsafe:integration-test -Dit.test=HomePageWebIT`
- **Note**: Playwright browser installation may fail due to network restrictions in CI environments.

### Run the Application

- **ALWAYS run the bootstrapping steps first.**
- Backend: `mvn spring-boot:run` -- starts in ~6 seconds on port 8080
- Frontend: `cd frontend && npm start` -- starts development server on port 3000
- **CRITICAL**: You MUST run both backend and frontend servers for the application to work properly.
- Access the full application at: http://localhost:8080 (backend serves the React app in production mode)
- Access frontend development server at: http://localhost:3000 (for development)
- Access API documentation at: http://localhost:8080/swagger-ui/index.html
- Access H2 database console at: http://localhost:8080/h2-console

## Validation

### Manual Validation Steps
- ALWAYS manually validate any new code by running the complete application locally.
- Test basic functionality:
  1. Start both backend and frontend servers
  2. Verify http://localhost:8080 loads the React application
  3. Verify http://localhost:8080/api/systemInfo returns JSON response
  4. Verify http://localhost:8080/swagger-ui/index.html loads Swagger documentation
- You can build and run the application successfully, but OAuth login requires Google OAuth setup (see docs/oauth.md).
- ALWAYS run `mvn test` and `cd frontend && npm test -- --watchAll=false` before committing changes.

### CI/CD Validation Requirements
- Always run formatting checks before committing:
  - Backend: Code is auto-formatted by git-code-format-maven-plugin
  - Frontend: `cd frontend && npm run check-format` and `npm run format`
- Always run linting: `cd frontend && npx eslint src/`
- The CI pipeline (.github/workflows/) includes extensive testing:
  - Backend: unit tests, integration tests, mutation testing (pitest), jacoco coverage
  - Frontend: unit tests, coverage, mutation testing (stryker), linting, formatting
  - Documentation: javadoc, storybook/chromatic

## Common Tasks

### Testing Commands
- Run all backend unit tests: `mvn test`
- Run specific backend test: `mvn test -Dtest=FooTests`
- Run backend integration tests: `INTEGRATION=true mvn test-compile failsafe:integration-test`
- Run mutation testing on specific class: `mvn pitest:mutationCoverage -DtargetClasses=edu.ucsb.cs156.dining.controllers.RestaurantsController`
- Run mutation testing on package: `mvn pitest:mutationCoverage -DtargetClasses=edu.ucsb.cs156.dining.controllers.\*`
- Run all frontend tests: `cd frontend && npm test -- --watchAll=false`
- Run frontend coverage: `cd frontend && npm run coverage`

### Development Tools
- Storybook: `cd frontend && npm run storybook` -- starts on http://localhost:6006
- Database console: http://localhost:8080/h2-console (when backend is running)
- API documentation: http://localhost:8080/swagger-ui/index.html

## Key Project Structure

### Backend (Spring Boot)
```
src/main/java/edu/ucsb/cs156/dining/
├── ExampleApplication.java          # Main application class
├── controllers/                     # REST API controllers
├── entities/                       # JPA entities
├── repositories/                   # Data repositories
├── services/                       # Business logic services
├── config/                         # Spring configuration
└── errors/                         # Error handling
```

### Frontend (React)
```
frontend/src/
├── main/
│   ├── components/                 # Reusable React components
│   ├── pages/                      # Main application pages
│   └── utils/                      # Utility functions
├── stories/                        # Storybook stories
└── tests/                          # Test files
```

### Important Files
- `.env.SAMPLE` → `.env`: Environment variables (copy and configure)
- `pom.xml`: Maven build configuration
- `frontend/package.json`: Frontend dependencies and scripts
- `docs/oauth.md`: OAuth setup instructions
- `docs/dokku.md`: Deployment instructions

## Timing Expectations

**NEVER CANCEL builds or long-running commands. Build may take several minutes:**

| Command | Time | Timeout Recommendation |
|---------|------|----------------------|
| `mvn compile` | 47 seconds | 90+ seconds |
| `mvn test` | 40 seconds | 90+ seconds |
| `mvn pitest:mutationCoverage` | 2 minutes 34 seconds | 300+ seconds |
| `INTEGRATION=true mvn test-compile failsafe:integration-test` | 3+ minutes | 600+ seconds |
| `cd frontend && npm run build` | 12 seconds | 30+ seconds |
| `cd frontend && npm test -- --watchAll=false` | 8 seconds | 30+ seconds |
| `cd frontend && npm run coverage` | 8 seconds | 30+ seconds |
| Backend startup (`mvn spring-boot:run`) | 6 seconds | 30+ seconds |
| Frontend startup (`npm start`) | 10+ seconds | 30+ seconds |

## Known Issues

- Integration tests require Playwright browser installation which may fail in restricted environments
- Node.js version warning (requires exactly v20.17.0, but v20.19.4 works)
- Some frontend dependencies have security vulnerabilities (run `npm audit` for details)

## Environment Requirements

- **Java**: 21 (REQUIRED - project will not build with other versions)
- **Node.js**: v20.17.0 (specified in frontend/package.json)
- **Maven**: 3.9+ (for backend builds)
- **npm**: 10+ (for frontend builds)

The application uses:
- H2 database for local development
- PostgreSQL for production (Dokku)
- Google OAuth for authentication
- UCSB Developer API for external data

## Documentation

- Main README: `README.md`
- OAuth setup: `docs/oauth.md`
- Deployment: `docs/dokku.md`
- Environment variables: `docs/environment-variables.md`
- Version management: `docs/versions.md`

Always refer to the documentation in the `docs/` directory for detailed setup and deployment instructions.