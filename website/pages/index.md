# Reef

A minimalist SSG framework with simple reactivity "islands".

## Quick Start

Install: `npm i @vktrz/reef` (not published yet, actually)

Add scripts to `package.json`:

```json
"scripts": {
    "dev": "reef",
    "build": "reef build"
}
```

## Requirements

TODO: needs update

At the root of the project, add `content/` folder with `.md` files, and a `template.html` with `{{title}}` and `{{content}}` placeholders.

## Example

https://github.com/ViktorZhurbin/reef/tree/main/packages/website
# Reef

A minimalist SSG framework with simple reactivity "islands".

## Quick Start

Install: `npm i @vktrz/reef` (not published yet, actually)

Add scripts to `package.json`:

```json
"scripts": {
    "dev": "reef",
    "build": "reef build"
}
```

## Requirements

TODO: needs update

At the root of the project, add `content/` folder with `.md` files, and a `template.html` with `{{title}}` and `{{content}}` placeholders.

## Example

https://github.com/ViktorZhurbin/reef/tree/main/packages/website


A minimal markdown-based static site generator with optional interactive islands.

## Islands

<counter-solid initial="8"></counter-solid>
<counter-preact data-initial="2"></counter-preact>

Add interactivity only where you need it:

- [islands-preact](/islands-preact.html)
- [islands-solid](/islands-solid.html)
