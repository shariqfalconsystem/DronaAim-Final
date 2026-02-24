# DronaAim Application Documentation

## Setup Instructions

### 1. Prerequisites

Ensure you have Node.js version **v20.15.0** installed.

### 2. Create `.env` File

Create a `.env` file in the root folder and add the following content:

```
VITE_GOOGLE_MAPS_API_KEY=SAMPLEAPIKEY
VITE_MODE=dev
VITE_SECRET_KEY=sample_key
```

### 3. Install Dependencies

Run the following command to install the required dependencies:

```
npm install
```

### 4. Run the Application

Use the following command to start the application in development mode:

```
npm run dev
```

---

## Frontend Coding Standards

### 1. File Naming Conventions

- File names should be in **small case**, hyphen-separated.
- Utility files should have a `.ts` extension.
- Components should have a `.tsx` extension.

### 2. Component Structure

Components should follow this order:

1. Declare **constants**
2. Declare **useSelector** hooks
3. Declare **useState** hooks
4. UseEffect without dependencies (**constructor-like behavior**)
5. UseEffect with dependencies (**watch variables**)
6. Define functions
7. Return statement (**JSX code**)

### 3. Code Quality Guidelines

- Remove **unused variables** and **import statements**.
- Follow **DRY** (Don't Repeat Yourself) and **SOLID** principles.
- Convert **HTML content** into reusable components where necessary.
- Avoid **null exceptions** (use optional chaining `?.` when accessing objects).
- Files should be **module-specific**.
- Use **helper functions** where necessary.
- **Do not use async/await inside `useEffect`**.
- Every API request and response must have an **interface**.
- **Child component props should be destructured**.
- Fetch validation errors from **constants**.
- Avoid **for, while, and do-while loops**; use **filter, find, map, findIndex** instead.
- Use **forEach loops** only when necessary.
- Ensure **no warnings or errors** in the project.

### 4. Recommended VS Code Extensions

1. **Git**
2. **Indent Rainbow**
3. **NPM IntelliSense**
4. **ESLint**
5. **SonarLint (SonarQube)**
6. **Spell Check**
7. **Auto Import**

### 5. Async & Error Handling

- Avoid using **callback functions**, `.then`, and `.catch`.
- Every **async/await function must have a try-catch block**.
- Every function **must have a return type**.

### 6. Git Branch Naming Convention

Branch names should follow this format:

```
Jira TK#<TASK_NUMBER>_<TASK_NAME>
```

Example:

```
Jira TK#1234_add-login-page
```
