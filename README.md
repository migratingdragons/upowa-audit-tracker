# Upowa Audit Tracker

## Overview

The Upowa Audit Tracker is a Google Apps Script project designed to document and manage non-compliant installations in a Quality Management System (QMS). This script processes incoming data, moves resolved audits, and sends debug emails if needed. It is particularly useful for tracking and managing non-compliant panel and electrical installations.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Scripts](#scripts)
  - [Testing](#testing)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14.x or later)
- [Google Clasp](https://github.com/google/clasp) (v2.4.2 or later)
- A Google account with access to Google Apps Script

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/migratingdragons/upowa-audit-tracker.git
   cd upowa-audit-tracker
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Authenticate with Google Clasp:
   ```bash
   clasp login
   ```

4. Push the script to Google Apps Script:
   ```bash
   npm run push
   ```

## Usage

### Scripts

The project includes several npm scripts to help manage the Google Apps Script project:

- **Push Changes**: `npm run push`
- **Pull Changes**: `npm run pull`
- **Watch for Changes**: `npm run watch`
- **Open in Browser**: `npm run open`
- **Deploy**: `npm run deploy`
- **Undeploy**: `npm run undeploy`
- **Create Version**: `npm run version`
- **View Logs**: `npm run logs`

### Testing

To test the `doPost` function, you can use the predefined testing data. Ensure `TESTING_MODE` is set to `true` in `Code.js` and then run:

```bash
npm run test
```

## Project Structure

- **Code.js**: Contains the main logic for processing incoming data, moving resolved audits, and sending debug emails.
- **Menu.js**: Defines the menu items for the Google Sheets UI.
- **aa-testData.js**: Contains predefined testing data for the `doPost` function.
- **appsscript.json**: Configuration file for the Google Apps Script project.
- **.clasp.json**: Configuration file for Google Clasp.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) before getting started.

## License

This project is licensed under the All Rights Reserved license. See the [LICENSE](LICENSE) file for details.
