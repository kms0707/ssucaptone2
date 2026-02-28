**Add your own guidelines here**
<!--
# Team Coding Style Guidelines (Mandatory)

All generated or refactored code MUST strictly follow these rules.
If existing code violates these rules, refactor it without changing functionality.

## General
- Follow PEP8 for Python and Google Java Style Guide for Java.
- Prioritize readability, maintainability, and clarity.
- One function or method must have a single responsibility and be under 50 lines.
- Avoid global variables whenever possible.

## Imports
- Do NOT use wildcard imports.
- Remove unused imports.
- Explicitly import only required modules or classes.

## Naming Conventions
- Python functions and variables: snake_case
- Python classes: PascalCase
- Java methods: camelCase
- Java classes: PascalCase
- Use meaningful English names. Avoid abbreviations.
- Constants must be UPPER_CASE_WITH_UNDERSCORES.

## Exception Handling
- Never ignore exceptions.
- Do NOT use empty catch blocks or `except Exception: pass`.
- Handle specific exception types and log errors properly.
- Re-raise exceptions when necessary.

## Logging
- Do NOT use print() or System.out.println().
- Use logging libraries:
  - Python: logging module
  - Java: Logger
- Log levels must be used correctly (DEBUG, INFO, WARNING, ERROR).
- Do NOT log sensitive information such as IP addresses or credentials.

## Comments
- Functions and methods must include comments describing:
  - Purpose
  - Parameters
  - Return values
- Use block comments for multi-step logic.
- Inline comments should explain intent, not obvious code.

## Formatting
- Use spaces for indentation (4 spaces).
- Do not use tabs.
- Limit line length to 100 characters.
- Add blank lines between logical code blocks.

## Project Structure
- preprocess/: flow normalization and feature extraction
- models/: training and inference logic
- api/ or server/: service endpoints
- utils/: helper functions
- scripts/: experimental scripts
- tests/: unit tests

## TODO
- Mark incomplete or refactoring-needed code with TODO comments.
-->
