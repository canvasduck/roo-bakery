# Roo Bakery

A CLI tool for managing YAML documents by selecting objects based on their 'slug' value.

## Overview

Roo Bakery is a command-line tool that helps you manage YAML documents by allowing you to:

- Select objects from a main document and add them to an active document
- Remove objects from the active document
- Clear the active document
- Replace all objects in the active document with a new selection

The tool is designed to work with YAML documents that contain arrays of objects, where each object has a 'slug' property that uniquely identifies it.

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Global Installation

```bash
npm install -g roo-bakery
```

### Local Installation

```bash
npm install roo-bakery
```

## Configuration

Before using the tool, you need to configure the paths to your main and active documents:

```bash
roo-bake config --set-main /path/to/main/document.yaml
roo-bake config --set-active /path/to/active/document.yaml
```

You can view your current configuration with:

```bash
roo-bake config --show
```

Or reset it to defaults with:

```bash
roo-bake config --reset
```

## Usage

### Adding Objects

Add objects from the main document to the active document by specifying their slugs:

```bash
roo-bake add slug1 slug2 slug3
```

You can override the document paths for a single command:

```bash
roo-bake add slug1 slug2 --main /path/to/main.yaml --active /path/to/active.yaml
```

### Removing Objects

Remove objects from the active document by specifying their slugs:

```bash
roo-bake remove slug1 slug2
```

### Removing All Objects

Clear the active document by removing all objects:

```bash
roo-bake remove-all
```

### Removing All and Adding New Objects

Replace all objects in the active document with a new selection:

```bash
roo-bake remove-all-and-add slug1 slug2 slug3
```

## Examples

### Example 1: Setting up configuration

```bash
# Set the main document path
roo-bake config --set-main ~/documents/main.yaml

# Set the active document path
roo-bake config --set-active ~/documents/active.yaml

# Verify configuration
roo-bake config --show
```

### Example 2: Managing objects

```bash
# Add objects to the active document
roo-bake add object1 object2 object3

# Remove an object from the active document
roo-bake remove object2

# Replace all objects with a new selection
roo-bake remove-all-and-add object4 object5
```

## Document Format

The tool expects YAML documents with the following structure:

```yaml
- slug: object1
  name: Object 1
  description: This is object 1
  # ... other properties

- slug: object2
  name: Object 2
  description: This is object 2
  # ... other properties

# ... more objects
```

Each object must have a unique 'slug' property that is used to identify and select it.

## Configuration Storage

Configuration is stored in `~/.roo-bakery/config.json`.

## License

MIT