# Upowa Audit Tracker

## Overview

The Upowa Audit Tracker is a Google Apps Script project designed to document and manage non-compliant installations in a Quality Management System (QMS). This system processes incoming audit data from field inspections, tracks non-compliant installations, and manages their resolution workflow.

## Detailed Documentation

### System Architecture

The system consists of several key components:

1. **Data Processing Pipeline**
   - Receives POST requests with audit data
   - Validates and processes incoming JSON data
   - Distributes data to appropriate sheets based on installation type
   - Handles concurrent access using document locks

2. **Sheet Management**
   - Maintains separate sheets for:
     - Non-compliant Panel Installations
     - Non-compliant Electrical Installations
     - Resolved Panel Installations
     - Resolved Electrical Installations
     - Summary data
   - Automatically creates missing sheets when needed

3. **Data Flow**
   ```
   Field Audit → POST Request → doPost() → Process Data → Appropriate Sheet
                                      ↓
                              Debug Email (if enabled)
   ```

### Getting Started

#### Prerequisites

1. **Development Environment Setup**
   - Install Node.js (v14.x or later)
   - Install npm (comes with Node.js)
   - Install Google Clasp globally:
     ```bash
     npm install -g @google/clasp
     ```

2. **Google Account Setup**
   - Enable Google Apps Script API in your Google Account
   - Create a Google Cloud Project
   - Set up OAuth 2.0 credentials

#### Installation Steps

1. **Clone and Configure**
   ```bash
   git clone https://github.com/migratingdragons/upowa-audit-tracker.git
   cd upowa-audit-tracker
   npm install
   ```

2. **Authentication**
   ```bash
   clasp login
   # Follow the browser prompts to authenticate
   ```

3. **Project Setup**
   - Copy `.clasp.json.example` to `.clasp.json`
   - Update the scriptId in `.clasp.json`
   - Push the code:
     ```bash
     npm run push
     ```

### Development Guide

#### Code Structure

1. **Code.js**
   - Main entry point
   - Contains core functionality:
     - `doPost()`: Handles incoming data
     - `processAndAppendData()`: Processes and stores data
     - `moveResolvedRows()`: Manages resolved audits
     - Various utility functions

2. **Menu.js**
   - Defines Google Sheets UI customizations
   - Adds custom menu items
   - Handles menu actions

3. **aa-testData.js**
   - Contains test data structures
   - Used for development and testing

#### Testing

1. **Enable Test Mode**
   - Open `Code.js`
   - Set `TESTING_MODE = true`
   - Set `DEBUG_MODE = true` for additional logging

2. **Run Tests**
   ```bash
   # Push changes first
   npm run push
   
   # Run the test function
   clasp run testDoPost
   ```

3. **Debug Mode**
   - When enabled, sends debug emails with JSON data
   - Configure `DEBUG_EMAIL` in `CONSTANTS`

#### Making Changes

1. **Development Workflow**
   ```bash
   # Start watch mode
   npm run watch
   
   # Make your changes
   # Changes auto-push to Apps Script
   
   # View logs
   npm run logs
   ```

2. **Adding New Features**
   - Follow existing patterns
   - Use CONSTANTS for configuration
   - Add test data to aa-testData.js
   - Document changes in comments

3. **Best Practices**
   - Use document locks for concurrent access
   - Handle errors gracefully
   - Log important operations
   - Keep functions focused and small

### Deployment

1. **Testing Environment**
   ```bash
   npm run push
   npm run version
   ```

2. **Production Deployment**
   ```bash
   npm run deploy
   ```

3. **Rollback if needed**
   ```bash
   npm run undeploy
   ```

### Troubleshooting

Common issues and solutions:

1. **Authentication Issues**
   - Re-run `clasp login`
   - Check OAuth credentials
   - Verify API access

2. **Push Failures**
   - Check .clasp.json configuration
   - Verify file permissions
   - Clear clasp cache if needed

3. **Runtime Errors**
   - Enable DEBUG_MODE
   - Check logs: `npm run logs`
   - Verify sheet names and IDs

### Contributing

1. **Development Process**
   - Fork the repository
   - Create a feature branch
   - Make changes
   - Add tests
   - Submit pull request

2. **Code Standards**
   - Use consistent formatting
   - Add JSDoc comments
   - Follow existing patterns
   - Test thoroughly

3. **Documentation**
   - Update README for major changes
   - Document new features
   - Include example usage

## License

This project is licensed under the All Rights Reserved license. See the [LICENSE](LICENSE) file for details.

## Support

For support:
1. Check existing issues
2. Review documentation
3. Create detailed bug reports
4. Contact maintainers
