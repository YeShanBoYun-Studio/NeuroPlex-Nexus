# Contributing to NeuraCollab

First off, thank you for considering contributing to NeuraCollab! It's people like you that make NeuraCollab such a great tool.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots or screen recordings if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* A clear and descriptive title
* A detailed description of the proposed functionality
* Explain why this enhancement would be useful
* List any specific requirements
* Include mockups or examples if applicable

### Pull Requests

* Fill in the required template
* Follow the coding style
* Include appropriate test cases
* Update documentation accordingly

## Development Process

1. Fork the repo and create your branch from `main`
2. Create virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -e ".[all]"
   ```
3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
4. Write your code
5. Run the test suite:
   ```bash
   pytest tests/
   cd frontend && npm test
   ```
6. Ensure your code follows our style guidelines
7. Submit the pull request

## Coding Style

### Python

* Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/)
* Use type hints where possible
* Write docstrings for all public modules, functions, classes, and methods
* Keep functions focused and single-purpose
* Comment complex algorithms and business logic

### TypeScript/React

* Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
* Use functional components with hooks
* Keep components small and focused
* Use TypeScript interfaces for prop types
* Write meaningful test cases

### Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Reference issues and pull requests liberally
* Consider starting the commit message with an applicable emoji:
  * 🎨 `:art:` when improving the format/structure of the code
  * 🐎 `:racehorse:` when improving performance
  * 🚱 `:non-potable_water:` when plugging memory leaks
  * 📝 `:memo:` when writing docs
  * 🐛 `:bug:` when fixing a bug
  * ✨ `:sparkles:` when adding a new feature

## Testing

### Backend Testing
```bash
# Run all tests
pytest tests/

# Run specific test file
pytest tests/test_cache_pool.py

# Run with coverage
pytest --cov=neuracollab tests/
```

### Frontend Testing
```bash
# Run all tests
cd frontend
npm test

# Run with coverage
npm test -- --coverage
```

## Documentation

### API Documentation
* Use OpenAPI/Swagger annotations in FastAPI routes
* Keep the API documentation up-to-date with changes
* Include example requests and responses

### Component Documentation
* Document React components with TypeScript interfaces
* Include usage examples in component stories
* Document complex state management logic

## Review Process

1. The PR will be reviewed by at least one core team member
2. Automated tests must pass
3. Code coverage should be maintained or improved
4. Documentation must be updated if needed
5. Changes should follow coding style guidelines

## Questions?

Feel free to ask questions by:
* Opening an issue
* Commenting on relevant issues/PRs
* Joining our [Discord community](https://discord.gg/neuracollab)

Thank you for contributing to NeuraCollab! 🎉
