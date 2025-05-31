# Roo Bakery

A CLI tool for managing YAML documents by selecting objects based on their 'name' value.

## Overview

Roo Bakery is a command-line tool that helps you manage YAML documents by allowing you to:

- Select objects from a main document and add them to an active document
- Remove objects from the active document
- Clear the active document
- Replace all objects in the active document with a new selection

The tool is designed to work with YAML documents that contain arrays of objects, where each object has a 'name' property that uniquely identifies it. Objects can be individual modes or groups of modes that can be added or removed together.

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

Add objects from the main document to the active document by specifying their names:

```bash
roo-bake add name1 name2 name3
```

You can also add groups, which will add all modes contained in the group:

```bash
roo-bake add group-name
```

You can override the document paths for a single command:

```bash
roo-bake add name1 name2 --main /path/to/main.yaml --active /path/to/active.yaml
```

### Removing Objects

Remove objects from the active document by specifying their names:

```bash
roo-bake remove name1 name2
```

You can also remove groups, which will remove all modes contained in the group:

```bash
roo-bake remove group-name --main /path/to/main.yaml
```

Note: When removing groups, the `--main` option is required to properly resolve the group's modes.

### Removing All Objects

Clear the active document by removing all objects:

```bash
roo-bake remove-all
```

### Removing All and Adding New Objects

Replace all objects in the active document with a new selection:

```bash
roo-bake remove-all-and-add name1 name2 name3
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

### Example 3: Working with groups

```bash
# Define groups in your main YAML document
# main.yaml:
# - name: basic-group
#   modes: Mode1, Mode2, Mode3
# - name: advanced-group
#   modes: Mode4, Mode5, basic-group

# Add all modes in a group
roo-bake add basic-group

# Add a nested group (will include all modes from basic-group plus Mode4 and Mode5)
roo-bake add advanced-group

# Remove all modes in a group
roo-bake remove basic-group --main ~/documents/main.yaml
```

## Document Format

The tool expects YAML documents with the following structure:

```yaml
- name: object1
  id: obj1
  description: This is object 1
  # ... other properties

- name: object2
  id: obj2
  description: This is object 2
  # ... other properties

# ... more objects
```

Each object must have a unique 'name' property that is used to identify and select it.

## Groups

Groups allow you to manage multiple objects together. A group is defined with a unique name and a list of modes that belong to the group.

### Group Format

Groups are defined in the YAML document with the following structure:

```yaml
- name: group-name
  modes: Mode1, Mode2, Mode3
```

The `modes` property can be a comma-separated string or an array of mode names. Groups can include other groups, allowing for nested grouping.

### Using Groups

When adding or removing objects, you can specify a group name instead of individual mode names. The tool will automatically resolve the group and process all the modes it contains.

```bash
# Add all modes in a group
roo-bake add my-group

# Remove all modes in a group
roo-bake remove my-group --main /path/to/main.yaml
```

Note that when removing groups, the `--main` option is required to properly resolve the group's modes.

### Nested Groups

Groups can include other groups, allowing for hierarchical organization:

```yaml
- name: basic-modes
  modes: Mode1, Mode2

- name: advanced-modes
  modes: Mode3, Mode4

- name: all-modes
  modes: basic-modes, advanced-modes, Mode5
```

When using a nested group, the tool will recursively resolve all included groups and their modes.

## Configuration Storage

Configuration is stored in `~/.roo-bakery/config.json`.

## License

MIT