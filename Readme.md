
# Carbon.CodePen

# Feature overview

## Live (Fusion) Preview
- code alongside a live preview rendered by Fusion. You can configure it further fx. use Javascript for preview or inject js and styles via Fusion

## TailwindCss support
- use Tailwind code completion & hover support and more
- use your custom tailwind config with plugins 
- for the live preview the styles are generated from the content

## AFX support
- Based of on html with code completion and hover documentation of configured fusion objects.

## CodePen Features
- Fullscreen (F11), Save (Strg+S) and close (Strg+Q)
- toggle preview top/bottom or left/right
- multiple configurable tabs
  - configure custom completion items for a tab. You can even use ClientEval and dynamically reference other node properties.
  - configure the language

# Faq
*what is the use of Tailwind in this editor? How can i save my generated styles?*
> you cant as of right now unless you use node js on the server too and want to create a complex pipeline.
> It is certainly possible to generate styles on the client as shown in the live preview, but we dont know yet how we can wrap this into a nice API. If you want to help and have ideas about that feel free to get in touch!
