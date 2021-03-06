# amy

[![Build Status](https://travis-ci.org/stfsy/node-amy.svg)](https://travis-ci.org/stfsy/node-amy)
[![Dependency Status](https://img.shields.io/david/stfsy/node-amy.svg)](https://github.com/stfsy/node-amy/blob/master/package.json)
[![DevDependency Status](https://img.shields.io/david/dev/stfsy/node-amy.svg)](https://github.com/stfsy/node-amy/blob/master/package.json)
[![Npm downloads](https://img.shields.io/npm/dm/node-amy.svg)](https://www.npmjs.com/package/node-amy)
[![Npm Version](https://img.shields.io/npm/v/node-amy.svg)](https://www.npmjs.com/package/node-amy)
[![Git tag](https://img.shields.io/github/tag/stfsy/node-amy.svg)](https://github.com/stfsy/node-amy/releases)
[![Github issues](https://img.shields.io/github/issues/stfsy/node-amy.svg)](https://github.com/stfsy/node-amy/issues)
[![License](https://img.shields.io/npm/l/node-amy.svg)](https://github.com/stfsy/node-amy/blob/master/LICENSE)

## What is it?

A HTML template framework **without** client-side dependencies. **amy** allows you to split up your web app in small components. **amy** will merge these components at runtime and replace variables. 

## Who is using it?
[blauspecht.io](https://www.blauspecht.io) uses `node-html-light` to render their whole page server-side. [blauspecht.io](https://www.blauspecht.io) enables you to provide rich content to your followers, schedule tweets and threads and will add AI-powered features soon.

## How can I use it?
In the example below you can see, that the file index.html contains various **import** commands. At runtime these commands will add
* Meta Tags,
* CSS,
* JavaScript,
* and of course the content of the page
#### index.html
```html
<!DOCTYPE html>
<html>

<head>
    <!-- @amy import amy/views/base/meta.html-->
    <!-- @amy import amy/views/base/css.html-->
</head>

<body>
    ...
    <!-- @amy import amy/views/body/main.html -->
    ...
</body>
<!-- @amy import amy/views/base/scripts.html -->
</html>
```

### Commands
#### import
```html
<head>
    <!-- @amy import amy/views/base/meta.html-->
</head>
```
- **Description**: Will import a compo  nent into the current html page
- **Syntax**: `<!-- @amy import path/to/file.html [with contextName [as contextAlias]]-->`
- **Requirements**: 
  - path/to/file.html must be a valid relative path to a file
  - contextName is a property in the current rendering context

#### forEach
```html 
<div>
    <div>
        <h2>Work Experience</h2>
    </div>
    <div>
    <!-- @amy import amy/views/experience/blocks/listItem.html forEach experience as experience -->
    </div>
</div>
```
- **Description**: Will import a component multiple times into the current html page
- **Syntax**: `<!-- @amy import path/to/file.html forEach context [as contextAlias]-->`
- **Requirements**: 
  - path/to/file.html must be a valid relative path to a file
  - contextName is a property in the current rendering context
  - the value of context[contextName] must be of type Array

#### add
- **Description**: Will import a component into another component
- **Syntax**: `<!-- @amy import path/to/file.html [with contextName [as contextAlias]] and add path/to/another/file.html [with contextName [as contextAlias]] -->`

#### interpolation
``` HTML
<li>
    <span>{{ experience.label }}</span>
</li>
```
- Description: Will declare variables in a component that will be replaced at runtime
- Syntax: `{{ variableName }}`

## How can I install it?

```bash
npm install node-amy --save
```

## Where can I view the docs?

[node-amy JSDoc](https://stfsy.github.io/node-amy)

## License

This project is distributed under the MIT license.