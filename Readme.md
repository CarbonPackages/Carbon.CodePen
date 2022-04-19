
# Carbon.CodeEditor

**Carbon.CodeEditor is an inspector editor for the [Neos CMS]. Its based on the [monaco] editor (core of [vscode]) and has built in support for [emmet] and [tailwindcss]**

## Getting started

### Simple NodeType:
```yaml
'Neos.Demo:Content.CodeEditor':
  superTypes:
    'Neos.Neos:Content': true
  ui:
    label: 'Code Editor Html'
    icon: 'icon-code'
    inspector:
      groups:
        html:
          label: i18n
          icon: 'icon-code'
  properties:
    source:
      type: string
      defaultValue: '<p>Enter HTML here</p>'
      ui:
        label: i18n
        reloadIfChanged: true
        inspector:
          group: 'html'
          editor: 'Carbon.CodeEditor/CodeEditor'
          editorOptions:
            # @see "Supported languages"
            language: html
```

### Supported languages:
- yaml
- json
- html
- css
- scss
- less
- ini
- js
- typescript
- xml
- markdown


### Tailwind Css Support:

configure the following settings as subkeys of:
```yaml
Neos:
  Neos:
    Ui:
      frontendConfiguration:
        'Carbon.CodeEditor':
          tailwindcss:
            # ...options
```

**Activate**

Simple Tailwind support is enabled by default.

```yaml
#
# Enable Tailwind css support for the monaco editor.
#
# @var boolean
#
enabled: true
```

**TailwindConfig**

You can also pass your custom Tailwind config for better intellisense to the editor. 

There are two main approaches:

1. **Pass simple options like 'theme' via json**
```yaml
#
# To be used with the *default worker* implementation.
# A simple way to provide config as json.
# Plugins (eg functions) of the tailwind config cannot not be preserved.
#
# @var string?
#
clientConfig: "${File.readFile('resource://Neos.Demo/Public/clientTailwindConfig.json')}"
```
you can generate the `clientTailwindConfig.json` automatically based on your `tailwind.config.js` see [buildJsonTailwindConfig](Documentation/buildJsonTailwindConfig.js)

2. **Build an extended tailwind worker with embedded TailwindConfig**
```yaml
#
# Uri for the worker to be used.
# Its possible to configure this to a custom worker with embedded Tailwind config.
# This way plugins from the tailwind config are preserved.
#
# @var string
#
workerUri: "${StaticResource.uri('Neos.Demo', 'Public/embeddedconfigtailwind.worker.js')}"
```
the `embeddedconfigtailwind.worker.js` can be build based on your `tailwind.config.js` via a script like [buildTailwindWorkerWithEmbeddedConfig](Documentation/buildTailwindWorkerWithEmbeddedConfig.js)


## Created with 💙 by Carbon
Author [Marc Henry Schultz](https://github.com/mhsdesign)
