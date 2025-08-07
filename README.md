# Zenith - Premium Task Management

A beautiful, Tesla/Apple-inspired task management application with a monochrome design system.

## Features

- **Premium Design**: Monochrome palette with subtle gradients and smooth animations
- **Smart Task Management**: Priority levels, categories, due dates, and notes
- **Advanced Filtering**: Search, filter by status, priority, and category
- **Dark/Light Theme**: System-aware theme switching
- **Local Storage**: All data saved locally in browser
- **Keyboard Shortcuts**: Productivity-focused shortcuts
- **Responsive Design**: Works on desktop and mobile

## Quick Start

1. Open `index.html` in a modern web browser
2. Start adding tasks!

## Keyboard Shortcuts

- `Cmd/Ctrl + N` - Focus on new task input
- `Cmd/Ctrl + T` - Toggle theme
- `Cmd/Ctrl + B` - Toggle sidebar
- `Cmd/Ctrl + F` - Focus search
- `Escape` - Close modal/clear focus

## Smart Task Parsing

When adding tasks, you can use shortcuts:

- `!high` - Set high priority
- `!low` - Set low priority
- `today` - Set due date to today
- `tomorrow` - Set due date to tomorrow
- `#work` - Set work category
- `#health` - Set health category

## Development

This is currently a single-page application using vanilla JavaScript. Future plans include:

- [ ] Modern framework migration (React/Vue)
- [ ] Cloud sync capabilities
- [ ] Mobile app
- [ ] Advanced features (subtasks, time tracking, etc.)

## Architecture

- `index.html` - Main application structure
- `styles.css` - Complete design system and styling
- `script.js` - Application logic and data management

## Browser Support

- Modern Chrome, Firefox, Safari
- Requires localStorage support
- Best experience with CSS backdrop-filter support