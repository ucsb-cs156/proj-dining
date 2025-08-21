# GitHub Copilot Instructions for proj-dining

## Repository Overview
This is a full-stack web application for UCSB dining hall menus and reviews. It uses React for the frontend and Spring Boot for the backend, following patterns established in the UCSB CS156 course series.

## Technology Stack
- **Frontend**: React 18.3.1, React Bootstrap, React Router v6, React Query
- **Backend**: Spring Boot, Java 21
- **Database**: H2 (development), PostgreSQL (production on Dokku)
- **Testing**: Jest/React Testing Library (frontend), JUnit/Mockito (backend), Playwright (integration)
- **Build Tools**: Maven (backend), npm (frontend)
- **UI Development**: Storybook for component development
- **Deployment**: Dokku

## Project Structure

### Backend (`/src/main/java/edu/ucsb/cs156/dining/`)
- `controllers/` - REST API endpoints
- `entities/` - JPA entities (User, Review, MenuItem)
- `repositories/` - Data access layer
- `services/` - Business logic layer
- `config/` - Spring configuration
- `models/` - Data transfer objects

### Frontend (`/frontend/src/`)
- `main/pages/` - React page components
- `main/components/` - Reusable React components
- `main/layouts/` - Layout components
- `main/utils/` - Utility functions and API clients
- `tests/` - Test files
- `stories/` - Storybook stories
- `fixtures/` - Test data

## Development Patterns

### API Controllers
- Extend `ApiController` base class
- Use standard REST patterns (GET, POST, PUT, DELETE)
- Include proper authorization annotations (`@PreAuthorize`)
- Return `ResponseEntity` with appropriate HTTP status codes
- Include comprehensive JavaDoc documentation

### React Components
- Use functional components with hooks
- Follow naming convention: PascalCase for components
- Include PropTypes for type checking
- Use React Bootstrap for UI components
- Implement proper error handling and loading states

### Testing Conventions
- **Backend**: Test files end with `Test.java` or `Tests.java`
- **Frontend**: Test files end with `.test.js`
- **Integration**: Files start with `IT` (e.g., `HomePageWebIT.java`)
- Use appropriate test annotations (`@Test`, `@WithMockUser`, `@WebMvcTest`)
- Maintain high test coverage (target: 80%+)

### Database Entities
- Use JPA annotations (`@Entity`, `@Table`, `@Id`)
- Include `@Builder` and `@Data` from Lombok
- Follow naming conventions: singular nouns for entity names
- Include proper relationships (`@ManyToOne`, `@OneToMany`)

## Code Style Guidelines

### Java
- Use Lombok annotations (`@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`)
- Follow Google Java Style Guide
- Use meaningful variable and method names
- Include comprehensive JavaDoc for public methods

### JavaScript/React
- Use ES6+ features (arrow functions, destructuring, async/await)
- Prefer functional components over class components
- Use hooks for state management
- Follow ESLint configuration in the project
- Use Prettier for code formatting

## Common Development Tasks

### Adding a New Entity
1. Create entity class in `entities/` package
2. Create repository interface extending `CrudRepository`
3. Create controller with CRUD operations
4. Add corresponding frontend components and API utilities
5. Write comprehensive tests

### Adding New Pages
1. Create page component in `frontend/src/main/pages/`
2. Add route in `App.js`
3. Create corresponding Storybook stories
4. Add navigation links if needed
5. Include proper authentication checks

### API Integration
- Use axios for HTTP requests
- Create API utility functions in `frontend/src/main/utils/`
- Use React Query for data fetching and caching
- Handle loading and error states consistently

## Testing Strategy

### Backend Testing
- Unit tests for controllers, services, repositories
- Use `@MockBean` for dependency injection in tests
- Integration tests with `@SpringBootTest`
- Mutation testing with Pitest

### Frontend Testing
- Component unit tests with React Testing Library
- Integration tests for user workflows
- Storybook for component documentation and testing
- Coverage reporting with Jest

### End-to-End Testing
- Playwright for browser automation
- Test critical user journeys
- Run with `INTEGRATION=true mvn test-compile failsafe:integration-test`

## Security Considerations
- OAuth 2.0 authentication with Google
- Role-based authorization (USER, ADMIN)
- CSRF protection enabled
- Input validation and sanitization
- Secure API endpoints with proper authorization

## Performance Guidelines
- Use React Query for efficient data caching
- Implement pagination for large data sets
- Optimize database queries with proper indexing
- Use lazy loading for React components when appropriate

## Documentation Standards
- README.md with setup instructions
- JavaDoc for all public Java methods
- JSDoc for complex JavaScript functions
- Storybook documentation for UI components
- API documentation via Swagger/OpenAPI

## Common Pitfalls to Avoid
- Don't forget authorization annotations on controller methods
- Always handle async operations properly (loading/error states)
- Don't commit sensitive information (API keys, passwords)
- Ensure proper input validation on both frontend and backend
- Follow established naming conventions consistently

## Helpful Commands
- `mvn spring-boot:run` - Start backend server
- `npm start` - Start frontend development server (in `/frontend/`)
- `npm run storybook` - Start Storybook (in `/frontend/`)
- `mvn test` - Run backend unit tests
- `npm test` - Run frontend unit tests
- `INTEGRATION=true mvn test-compile failsafe:integration-test` - Run integration tests

## External APIs
- UCSB Developer API for dining commons data
- Requires `UCSB_API_KEY` environment variable
- See `docs/oauth.md` for OAuth setup instructions