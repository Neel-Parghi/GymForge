# Project AI Rules

## General Principles

* Follow existing project architecture.
* Do not introduce new libraries without approval.
* Prefer readability over clever code.
* Do not create duplicate functionality.
* Reuse existing services and utilities whenever possible.
* Generate production-ready code only.

## Angular Rules

### Components

* Use standalone components.
* Do not use inline templates.
* Do not use inline styles.
* Always use separate HTML and SCSS files.
* Use OnPush change detection.

### Forms

* Always use Reactive Forms.
* Never use ngModel.
* Use strongly typed FormGroup and FormControl.
* Centralize validation logic.

### Styling

* No inline styles.
* Prefer SCSS.
* Reuse existing utility classes.
* Follow responsive design principles.

### Services

* Keep business logic out of components.
* Use services for API communication.
* Avoid duplicate HTTP calls.

### RxJS

* Prefer async pipe over manual subscriptions.
* Unsubscribe when required.
* Avoid nested subscriptions.

## .NET Rules

### Architecture

* Follow Clean Architecture.
* Controllers should be thin.
* Business logic belongs in Application layer.
* Infrastructure should contain external integrations only.

### APIs

* Use DTOs for requests and responses.
* Never expose entities directly.
* Return consistent API responses.

### Database

* Use repository pattern.
* Avoid raw SQL unless approved.
* Use async methods everywhere.
* Generate and apply EF Core database migrations whenever a new Entity model or configuration change is added.

### Validation

* Use FluentValidation.
* Never place validation logic in controllers.

### Logging

* Log exceptions.
* Do not log sensitive information.

## Security

* Validate all user inputs.
* Apply authorization policies.
* Never hardcode secrets.
* Use secure JWT handling.

## Testing

* Verify build succeeds before completing tasks.
* Fix compilation errors before finishing.

## Before Marking Task Complete

1. Build solution.
2. Check for warnings.
3. Verify code follows project rules.
4. Provide implementation summary.
