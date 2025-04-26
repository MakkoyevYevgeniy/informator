# Informator

A flexible and colorful logging utility for Node.js applications, offering customizable styling, prefixes, and enhanced object inspection.

## Key Concepts

*   **Rich Styling:** Apply foreground/background colors (using a TailwindCSS-like palette), bold, italic, underline, and strikethrough styles to your log messages.
*   **Optional Prefixes:** Automatically prepend log messages with timestamps (via `dateflow`) and/or custom names (e.g., module names, log levels).
*   **Custom Separators:** Define custom separators and styles between prefixes (like date and name) and the main message.
*   **Enhanced Object Formatting:** Use the `formatObject` option to leverage Node.js's `util.inspect` for syntax-highlighted object and array logging in the terminal.
*   **Predefined Log Levels:** Includes convenient methods (`info`, `warn`, `danger`, `verbose`) with default styling and prefixes for common logging scenarios.
*   **Flexible Configuration:** Most styling and prefix options are configured per-call via a trailing `LogOptions` object, allowing for granular control.

## Installation

```bash
npm install Informator
# or
yarn add Informator
```
*Note: `dateflow` is a dependency and will be installed automatically.*

## Usage Examples

```typescript
import { Informator, RGB, LogOptions, DateFlowOptions, SeparatorOptions } from 'Informator'; // Import necessary types

const log = new Informator();

// --- Basic Logging ---
log.log("Hello, Informator!");
log.log("Multiple", "arguments", "are", "joined.");
log.log("Logging numbers and booleans:", 123, true);

// --- Styling --- 
log.log("Red text", { color: RGB.red[500] });
log.log("Bold green text on yellow background", {
    color: RGB.green[700],
    backgroundColor: RGB.yellow[300],
    bold: true
});
log.log("Italic and underlined", { italic: true, underline: true });

// --- Prefixes & Separators ---

// Name prefix
log.log("API request received", { name: "API" });
log.log("Database query", { 
    name: { 
        name: "DB", 
        color: RGB.blue[600], 
        bold: true 
    } 
});

// Date prefix (requires dateflow)
log.log("User action logged", { dateFlowOptions: true }); // Default format
log.log("Specific date format", {
    dateFlowOptions: {
        format: "HH:mm:ss",
        color: RGB.cyan[500]
    }
});

// Combined prefixes with separator
log.log("System startup sequence initiated", {
    name: "SYSTEM",
    dateFlowOptions: true,
    separatorOptions: { 
        separator: "::", 
        color: RGB.gray[500] 
    }
});

// --- Object Formatting ---
const myObject = { id: 1, name: "Example", nested: { active: true } };
log.log("Standard object log:", myObject);
log.log("Formatted object log:", myObject, { formatObject: true });
log.log("Formatted object with other styles:", myObject, {
    formatObject: true,
    name: "DATA",
    color: RGB.purple[500] // Styles apply to non-object parts
});

// --- Log Level Methods ---
log.info("Application successfully initialized.");
log.warn("Configuration value is missing, using default.");
log.danger("Critical error connecting to external service!", { details: "Timeout" });
log.verbose("Detailed trace information:", { step: 1, value: 'abc' }); // formatObject is true by default

// Override default level styles
log.warn("Approaching rate limit", { color: RGB.orange[400], italic: true });
log.info("User logged in", { userId: 123 }, { name: "AUTH" }); // Override name

// Logging only options (useful for styled prefixes without messages)
log.log({ name: "STATUS", color: RGB.lime[500], dateFlowOptions: true });

```

## API Reference

### `Informator` Class

#### Constructor

`new Informator()`

Initializes a new logger instance. Currently takes no arguments.

#### Logging Methods

These methods handle the formatting and outputting of log messages to the console.

*   `log(...args: any[]): void`:
    The core logging method. Accepts any number of arguments. The last argument *can* be a `LogOptions` object to configure the output for that specific call. All other arguments are treated as message parts and joined with spaces.

*   `info(...args: any[]): void`:
    Logs messages with a default `[INFO]` prefix (styled blue) and blue text color. Accepts message parts and an optional final `LogOptions` object which merges with/overrides the defaults.

*   `warn(...args: any[]): void`:
    Logs messages with a default `[WARN]` prefix (styled yellow/orange) and yellow/orange text color. Accepts message parts and an optional final `LogOptions` object.

*   `danger(...args: any[]): void`:
    Logs messages with a default `[DANGER]` prefix (styled red) and red text color. Accepts message parts and an optional final `LogOptions` object.

*   `verbose(...args: any[]): void`:
    Logs messages with a default `[VERBOSE]` prefix (styled gray) and gray text color. Sets `formatObject: true` by default. Accepts message parts and an optional final `LogOptions` object.

### `LogOptions` Type

An object passed as the *last* argument to a logging method to customize its appearance and behavior. You may need to import `LogOptions`, `DateFlowOptions`, `SeparatorOptions`, `StyleOptions`, and `TailwindRgbColorValue` from `Informator` if using them explicitly in your code.

```typescript
import { 
    TailwindRgbColorValue, 
    StyleOptions, 
    DateFlowOptions, 
    SeparatorOptions, 
    LogOptions 
} from 'Informator'; // Import the types from the package

// The LogOptions type structure (as defined within Informator):
type LogOptions = {
    // Main message styling (applied to non-object parts)
    color?: TailwindRgbColorValue;
    backgroundColor?: TailwindRgbColorValue;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;

    // Object formatting
    formatObject?: boolean; // Default: false (except for verbose). Uses util.inspect.

    // Date prefix configuration (Uses dateflow)
    // Set to `true` for defaults, or provide a DateFlowOptions object.
    dateFlowOptions?: DateFlowOptions | true;

    // Separator configuration (between date/name and message)
    separatorOptions?: SeparatorOptions;

    // Name prefix configuration
    // Can be a simple string or an object with styling.
    name?: string | (StyleOptions & { name: string });
};

// --- Supporting Type Definitions (Also exported from Informator) ---

// Represents an RGB color value { r: number; g: number; b: number }
// Typically sourced from the exported RGB object (e.g., RGB.red[500])
type TailwindRgbColorValue = { r: number; g: number; b: number };

// Basic style properties used in various options
type StyleOptions = {
    color?: TailwindRgbColorValue;
    backgroundColor?: TailwindRgbColorValue;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
};

// Options for the date prefix, leveraging the dateflow library.
// See dateflow documentation for details on `format`, `date`, etc.
type DateFlowOptions = {
    format?: string; // e.g., 'YYYY-MM-DD HH:mm:ss'
    date?: Date;     // Specific date to use
    // Inherits StyleOptions for specific date styling
} & StyleOptions;

// Options for the separator string and its styling.
type SeparatorOptions = {
    separator?: string; // The character(s) used as a separator (e.g., ':', '|')
    // Inherits StyleOptions for specific separator styling
} & StyleOptions;

```

*   **Main Styling:** `color`, `backgroundColor`, `bold`, `italic`, `underline`, `strikethrough` apply to the main message parts (unless `formatObject` is true for an object/array part).
*   **`formatObject`:** If `true`, objects/arrays are formatted using Node.js's `util.inspect` with colors, overriding main styles for that specific part.
*   **`dateFlowOptions`:** Controls the date/time prefix. Set to `true` for default format/style, or provide a `DateFlowOptions` object for customization (refer to `dateflow` documentation for format options). Styles within this object apply specifically to the date.
*   **`separatorOptions`:** Defines the string (e.g., `" :: "`) and styles for the separator placed after the date (if present) and before the message. Styles apply specifically to the separator.
*   **`name`:** Adds a name prefix (e.g., `"[API]"`). Can be a simple string or an object `{ name: "API", color: RGB.blue[700], bold: true }` for specific styling.
*   **Inheritance:** If only options are provided (`log({ name: 'X', color: RGB.red[500] })`), or if prefix elements (`name`, `dateFlowOptions`, `separatorOptions`) don't have their own specific styles defined within their objects, they inherit the main styles (`color`, `bold`, etc.) from the top-level `LogOptions`.

## Extending

One way to customize or add functionality is by extending the `Informator` class:

```typescript
import { Informator, LogOptions, RGB } from 'Informator';

class MyCustomLogger extends Informator {
    // Add a new log level with specific defaults
    success(...args: any[]) {
        const defaultOptions: LogOptions = {
            color: RGB.green[500],
            name: { name: "SUCCESS", color: RGB.green[700], bold: true }
        };

        // Merge the default options with any user-provided options
        const { messages, options } = this.mergeOptions(defaultOptions, args);

        // Pass the original arguments and the default options to the parent log method.
        // The parent log method (or its internal helpers) will handle merging
        // user-provided options (if any) with these defaults.
        super.log(...messages, options);
    }

    // You could also override existing methods like log, info, etc.
}

const myLogger = new MyCustomLogger();
myLogger.success("Operation completed successfully!");
// Example with user options overriding defaults:
myLogger.success("Another success", { color: RGB.lime[400] }); // Message will be lime, prefix remains green
```

You can also contribute to the project directly or suggest features like plugin systems for future versions.

## Limitations

*   **Node.js Specific:** Relies on Node.js's `util.inspect` for the `formatObject` feature. Behavior in non-Node.js environments might differ.
*   **`isLogOptions` Heuristic:** Detecting whether the last argument is an options object or message data involves heuristics. While generally reliable, edge cases with data resembling `LogOptions` might exist.
*   **Color Palette:** Uses a fixed color palette based on Tailwind CSS v3. Custom palettes are not supported out-of-the-box.

## License

This project is licensed under the MIT License. See the LICENSE.md file for details.
