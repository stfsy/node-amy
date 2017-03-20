# amy

[![Build Status](https://travis-ci.org/stfsy/node-amy.svg)](https://travis-ci.org/stfsy/node-amy)
[![Dependency Status](https://img.shields.io/david/stfsy/node-amy.svg)](https://github.com/stfsy/node-amy/blob/master/package.json)
[![DevDependency Status](https://img.shields.io/david/dev/stfsy/node-amy.svg)](https://github.com/stfsy/node-amy/blob/master/package.json)
[![Npm downloads](https://img.shields.io/npm/dm/node-amy.svg)](https://www.npmjs.com/package/node-amy)
[![Npm Version](https://img.shields.io/npm/v/node-amy.svg)](https://www.npmjs.com/package/node-amy)
[![Git tag](https://img.shields.io/github/tag/stfsy/node-amy.svg)](https://github.com/stfsy/node-amy/releases)
[![Github issues](https://img.shields.io/github/issues/stfsy/node-amy.svg)](https://github.com/stfsy/node-amy/issues)
[![License](https://img.shields.io/npm/l/node-amy.svg)](https://github.com/stfsy/node-amy/blob/master/LICENSE)

A HTML template framework without client-side JavaScript dependencies

* Clean and memorable syntax that does not break HTML
* Import mechanism to glue templates together
* Interpolation mechanism to keep partials free of concrete values

#### index.html
```HTML
<!DOCTYPE html>
<html>

<head>
    <!-- @amy import amy/views/base/meta.html-->
    <!-- @amy import amy/views/base/css.html-->
</head>

<body>
    ...
    <!-- @amy import amy/views/experience/card.html with stfsy-->
    ...
</body>
<!-- @amy import amy/views/base/scripts.html -->
</html>
```

Index.html contains various **import** commands to add
* Meta Tags,
* CSS,
* JavaScript,
* and of course the content of the page.

Commands are executed right after **amy** was started with the
* input directory,
* output directory,
* a pattern to match files in the input directory and
* the path to the JSON context file

The **Context** file will be read and it's contents will be available for interpolation. **Commands** can limit the scope of the context and only expose
a portion of the whole context to **child commands**.

The **import** command is started with some little yelling **@amy** and contains the path to the file that should be inserted. 
The command can be extended by adding the subcommands **as** and/or **with**. 

####  amy/views/experience/card.html
```HTML
<div class="mdl-card stfsy-card mdl-cell mdl-cell--8-col mdl-cell--8-col-tablet mdl-shadow--2dp">
    <div class="mdl-card__title">
        <h2 class="mdl-card__title-text">Experience</h2>
    </div>
    <div class="mdl-card__supporting-text">
       <!-- @amy import amy/views/experience/blocks/list.html with experience as experience-->
    </div>
</div>
```
Before importing **amy/views/experience/card.html**, gets the value (*v1*) of the key _stfsy_ of the current context. All commands inside the **card.html** file will only get access to the value *v1*. Inside the **card.html** file is another **import** 
command, that will get the value (*v2*) of the key _experience_ of the value *v1* and so on..
#### amy/views/experience/blocks/list.html
```HTML
<ul class="mdl-list stfsy-list-no-margin">
    <!-- @amy import amy/views/experience/blocks/listItem.html forEach experience as experience -->
</ul>
```
The **forEach** command will add **amy/views/experience/blocks/listItem.html** for each element in the array that is the value 
of the key _experience_ of the current context. Each import is invoked with a context object that contains a single element
of the array. Each context element will be accessible through the key **experience** as stated by the **as** command.

#### amy/views/experience/blocks/listItem.html
``` HTML
<li class="mdl-list__item">
    <span class="mdl-list__item-primary-content">
    <span class="mdl-chip stfsy-chip mdl-chip--contact">
    <span class="mdl-chip__contact mdl-color--secondary mdl-color-text--primary">{{ experience.label }}</span>
    </span>
    <span>{{ experience.text }}</span>
    </span>
</li>
```
Expecting the current context to contain an object named __experience__ the **import** command will replace 
both placeholders with the actual values.

## Installation

```
npm install node-amy --save
```

## Documentation

[node-amy JSDoc](https://stfsy.github.io/node-amy)

## License

This project is distributed under the MIT license.