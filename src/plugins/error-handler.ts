import type { App } from 'vue';

export interface ErrorHandlerOptions {
  showErrorInDevelopment?: boolean;
  logErrors?: boolean;
  onError?: (error: Error, instance: any, info: string) => void;
}

export function createErrorHandler(options: ErrorHandlerOptions = {}) {
  const { showErrorInDevelopment = true, logErrors = true, onError } = options;

  return {
    install(app: App) {
      // Global error handler
      app.config.errorHandler = (
        error: unknown,
        instance: any,
        info: string,
      ) => {
        const err = error instanceof Error ? error : new Error(String(error));

        if (logErrors) {
          console.error('Global error:', err);
          console.error('Component instance:', instance);
          console.error('Error info:', info);
        }

        if (import.meta.env.DEV && showErrorInDevelopment) {
          // In development, show error in console
          console.error('Vue Error:', {
            error: err,
            instance,
            info,
            stack: err.stack,
          });
        }

        // Custom error handler
        if (onError) {
          onError(err, instance, info);
        }

        // In production, you might want to send errors to a logging service
        if (import.meta.env.PROD) {
          // Example: Send to error tracking service
          // ErrorTrackingService.captureException(err, { instance, info })
        }
      };

      // Global warning handler (development only)
      if (import.meta.env.DEV) {
        app.config.warnHandler = (
          msg: string,
          instance: any,
          trace: string,
        ) => {
          console.warn('Vue Warning:', {
            message: msg,
            instance,
            trace,
          });
        };
      }

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);

        if (logErrors) {
          console.error('Promise rejection details:', {
            reason: event.reason,
            promise: event.promise,
          });
        }

        // You can choose to prevent the default browser behavior
        // event.preventDefault()
      });

      // Handle general JavaScript errors
      window.addEventListener('error', (event) => {
        console.error('Global JavaScript error:', event.error);

        if (logErrors) {
          console.error('Error details:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error,
          });
        }
      });
    },
  };
}
