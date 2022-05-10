
# Carbon.CodePen

# Feature overview

## Live (Fusion) Preview
- Code alongside a live preview rendered by Fusion. You can configure it further to use Javascript to preview or inject JS and styles via Fusion

## Tailwind CSS support
- Use Tailwind code completion & hover support and more
- Use your custom Tailwind config with plugins
- For the live preview, the styles are generated from the content

## AFX support
- Based on HTML with code completion and hover documentation of configured Fusion objects.

## CodePen Features
- Fullscreen (F11), Save (Strg+S) and close (Strg+Q)
- Toggle preview top/bottom or left/right
- Multiple configurable tabs
  - Configure custom completion items for a tab. You can even use ClientEval and dynamically reference other node properties.
  - Configure the language

# FAQ
*What is the use of Tailwind in this editor? How can I save my generated styles?*
> You can't as of right now unless you use node js on the server too and want to create a complex pipeline.
> It is certainly possible to generate styles on the client as shown in the live preview, but we don#t know yet how we can wrap this into a nice API. If you want to help and have ideas about that, feel free to get in touch!
