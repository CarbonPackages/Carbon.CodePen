import{a as P}from"./chunk-WC6PU33B.js";import{Jk as T}from"./chunk-HPONT37I.js";import"./chunk-2TFAEYZI.js";var R=Object.defineProperty,K=Object.getOwnPropertyDescriptor,E=Object.getOwnPropertyNames,H=Object.prototype.hasOwnProperty,L=(e,t,o,s)=>{if(t&&typeof t=="object"||typeof t=="function")for(let c of E(t))!H.call(e,c)&&c!==o&&R(e,c,{get:()=>t[c],enumerable:!(s=K(t,c))||s.enumerable});return e},V=(e,t,o)=>(L(e,t,"default"),o&&L(o,t,"default")),n={};V(n,T);var W=class{constructor(e,t){this._modeId=e,this._defaults=t,this._worker=null,this._client=null,this._configChangeListener=this._defaults.onDidChange(()=>this._stopWorker()),this._updateExtraLibsToken=0,this._extraLibsChangeListener=this._defaults.onDidExtraLibsChange(()=>this._updateExtraLibs())}dispose(){this._configChangeListener.dispose(),this._extraLibsChangeListener.dispose(),this._stopWorker()}_stopWorker(){this._worker&&(this._worker.dispose(),this._worker=null),this._client=null}async _updateExtraLibs(){if(!this._worker)return;let e=++this._updateExtraLibsToken,t=await this._worker.getProxy();this._updateExtraLibsToken===e&&t.updateExtraLibs(this._defaults.getExtraLibs())}_getClient(){return this._client||(this._client=(async()=>(this._worker=n.editor.createWebWorker({moduleId:"vs/language/typescript/tsWorker",label:this._modeId,keepIdleModels:!0,createData:{compilerOptions:this._defaults.getCompilerOptions(),extraLibs:this._defaults.getExtraLibs(),customWorkerPath:this._defaults.workerOptions.customWorkerPath,inlayHintsOptions:this._defaults.inlayHintsOptions}}),this._defaults.getEagerModelSync()?await this._worker.withSyncedResources(n.editor.getModels().filter(e=>e.getLanguageId()===this._modeId).map(e=>e.uri)):await this._worker.getProxy()))()),this._client}async getLanguageServiceWorker(...e){let t=await this._getClient();return this._worker&&await this._worker.withSyncedResources(e),t}},r={};r["lib.d.ts"]=!0;r["lib.decorators.d.ts"]=!0;r["lib.decorators.legacy.d.ts"]=!0;r["lib.dom.d.ts"]=!0;r["lib.dom.iterable.d.ts"]=!0;r["lib.es2015.collection.d.ts"]=!0;r["lib.es2015.core.d.ts"]=!0;r["lib.es2015.d.ts"]=!0;r["lib.es2015.generator.d.ts"]=!0;r["lib.es2015.iterable.d.ts"]=!0;r["lib.es2015.promise.d.ts"]=!0;r["lib.es2015.proxy.d.ts"]=!0;r["lib.es2015.reflect.d.ts"]=!0;r["lib.es2015.symbol.d.ts"]=!0;r["lib.es2015.symbol.wellknown.d.ts"]=!0;r["lib.es2016.array.include.d.ts"]=!0;r["lib.es2016.d.ts"]=!0;r["lib.es2016.full.d.ts"]=!0;r["lib.es2017.d.ts"]=!0;r["lib.es2017.full.d.ts"]=!0;r["lib.es2017.intl.d.ts"]=!0;r["lib.es2017.object.d.ts"]=!0;r["lib.es2017.sharedmemory.d.ts"]=!0;r["lib.es2017.string.d.ts"]=!0;r["lib.es2017.typedarrays.d.ts"]=!0;r["lib.es2018.asyncgenerator.d.ts"]=!0;r["lib.es2018.asynciterable.d.ts"]=!0;r["lib.es2018.d.ts"]=!0;r["lib.es2018.full.d.ts"]=!0;r["lib.es2018.intl.d.ts"]=!0;r["lib.es2018.promise.d.ts"]=!0;r["lib.es2018.regexp.d.ts"]=!0;r["lib.es2019.array.d.ts"]=!0;r["lib.es2019.d.ts"]=!0;r["lib.es2019.full.d.ts"]=!0;r["lib.es2019.intl.d.ts"]=!0;r["lib.es2019.object.d.ts"]=!0;r["lib.es2019.string.d.ts"]=!0;r["lib.es2019.symbol.d.ts"]=!0;r["lib.es2020.bigint.d.ts"]=!0;r["lib.es2020.d.ts"]=!0;r["lib.es2020.date.d.ts"]=!0;r["lib.es2020.full.d.ts"]=!0;r["lib.es2020.intl.d.ts"]=!0;r["lib.es2020.number.d.ts"]=!0;r["lib.es2020.promise.d.ts"]=!0;r["lib.es2020.sharedmemory.d.ts"]=!0;r["lib.es2020.string.d.ts"]=!0;r["lib.es2020.symbol.wellknown.d.ts"]=!0;r["lib.es2021.d.ts"]=!0;r["lib.es2021.full.d.ts"]=!0;r["lib.es2021.intl.d.ts"]=!0;r["lib.es2021.promise.d.ts"]=!0;r["lib.es2021.string.d.ts"]=!0;r["lib.es2021.weakref.d.ts"]=!0;r["lib.es2022.array.d.ts"]=!0;r["lib.es2022.d.ts"]=!0;r["lib.es2022.error.d.ts"]=!0;r["lib.es2022.full.d.ts"]=!0;r["lib.es2022.intl.d.ts"]=!0;r["lib.es2022.object.d.ts"]=!0;r["lib.es2022.regexp.d.ts"]=!0;r["lib.es2022.sharedmemory.d.ts"]=!0;r["lib.es2022.string.d.ts"]=!0;r["lib.es2023.array.d.ts"]=!0;r["lib.es2023.d.ts"]=!0;r["lib.es2023.full.d.ts"]=!0;r["lib.es5.d.ts"]=!0;r["lib.es6.d.ts"]=!0;r["lib.esnext.d.ts"]=!0;r["lib.esnext.full.d.ts"]=!0;r["lib.esnext.intl.d.ts"]=!0;r["lib.scripthost.d.ts"]=!0;r["lib.webworker.d.ts"]=!0;r["lib.webworker.importscripts.d.ts"]=!0;r["lib.webworker.iterable.d.ts"]=!0;function D(e,t,o=0){if(typeof e=="string")return e;if(e===void 0)return"";let s="";if(o){s+=t;for(let c=0;c<o;c++)s+="  "}if(s+=e.messageText,o++,e.next)for(let c of e.next)s+=D(c,t,o);return s}function w(e){return e?e.map(t=>t.text).join(""):""}var _=class{constructor(e){this._worker=e}_textSpanToRange(e,t){let o=e.getPositionAt(t.start),s=e.getPositionAt(t.start+t.length),{lineNumber:c,column:l}=o,{lineNumber:u,column:a}=s;return{startLineNumber:c,startColumn:l,endLineNumber:u,endColumn:a}}},j=class{constructor(e){this._worker=e,this._libFiles={},this._hasFetchedLibFiles=!1,this._fetchLibFilesPromise=null}isLibFile(e){return e&&e.path.indexOf("/lib.")===0?!!r[e.path.slice(1)]:!1}getOrCreateModel(e){let t=n.Uri.parse(e),o=n.editor.getModel(t);if(o)return o;if(this.isLibFile(t)&&this._hasFetchedLibFiles)return n.editor.createModel(this._libFiles[t.path.slice(1)],"typescript",t);let s=P.getExtraLibs()[e];return s?n.editor.createModel(s.content,"typescript",t):null}_containsLibFile(e){for(let t of e)if(this.isLibFile(t))return!0;return!1}async fetchLibFilesIfNecessary(e){this._containsLibFile(e)&&await this._fetchLibFiles()}_fetchLibFiles(){return this._fetchLibFilesPromise||(this._fetchLibFilesPromise=this._worker().then(e=>e.getLibFiles()).then(e=>{this._hasFetchedLibFiles=!0,this._libFiles=e})),this._fetchLibFilesPromise}},B=class extends _{constructor(e,t,o,s){super(s),this._libFiles=e,this._defaults=t,this._selector=o,this._disposables=[],this._listener=Object.create(null);let c=a=>{if(a.getLanguageId()!==o)return;let i=()=>{let{onlyVisible:h}=this._defaults.getDiagnosticsOptions();h?a.isAttachedToEditor()&&this._doValidate(a):this._doValidate(a)},g,d=a.onDidChangeContent(()=>{clearTimeout(g),g=window.setTimeout(i,500)}),b=a.onDidChangeAttached(()=>{let{onlyVisible:h}=this._defaults.getDiagnosticsOptions();h&&(a.isAttachedToEditor()?i():n.editor.setModelMarkers(a,this._selector,[]))});this._listener[a.uri.toString()]={dispose(){d.dispose(),b.dispose(),clearTimeout(g)}},i()},l=a=>{n.editor.setModelMarkers(a,this._selector,[]);let i=a.uri.toString();this._listener[i]&&(this._listener[i].dispose(),delete this._listener[i])};this._disposables.push(n.editor.onDidCreateModel(a=>c(a))),this._disposables.push(n.editor.onWillDisposeModel(l)),this._disposables.push(n.editor.onDidChangeModelLanguage(a=>{l(a.model),c(a.model)})),this._disposables.push({dispose(){for(let a of n.editor.getModels())l(a)}});let u=()=>{for(let a of n.editor.getModels())l(a),c(a)};this._disposables.push(this._defaults.onDidChange(u)),this._disposables.push(this._defaults.onDidExtraLibsChange(u)),n.editor.getModels().forEach(a=>c(a))}dispose(){this._disposables.forEach(e=>e&&e.dispose()),this._disposables=[]}async _doValidate(e){let t=await this._worker(e.uri);if(e.isDisposed())return;let o=[],{noSyntaxValidation:s,noSemanticValidation:c,noSuggestionDiagnostics:l}=this._defaults.getDiagnosticsOptions();s||o.push(t.getSyntacticDiagnostics(e.uri.toString())),c||o.push(t.getSemanticDiagnostics(e.uri.toString())),l||o.push(t.getSuggestionDiagnostics(e.uri.toString()));let u=await Promise.all(o);if(!u||e.isDisposed())return;let a=u.reduce((g,d)=>d.concat(g),[]).filter(g=>(this._defaults.getDiagnosticsOptions().diagnosticCodesToIgnore||[]).indexOf(g.code)===-1),i=a.map(g=>g.relatedInformation||[]).reduce((g,d)=>d.concat(g),[]).map(g=>g.file?n.Uri.parse(g.file.fileName):null);await this._libFiles.fetchLibFilesIfNecessary(i),!e.isDisposed()&&n.editor.setModelMarkers(e,this._selector,a.map(g=>this._convertDiagnostics(e,g)))}_convertDiagnostics(e,t){let o=t.start||0,s=t.length||1,{lineNumber:c,column:l}=e.getPositionAt(o),{lineNumber:u,column:a}=e.getPositionAt(o+s),i=[];return t.reportsUnnecessary&&i.push(n.MarkerTag.Unnecessary),t.reportsDeprecated&&i.push(n.MarkerTag.Deprecated),{severity:this._tsDiagnosticCategoryToMarkerSeverity(t.category),startLineNumber:c,startColumn:l,endLineNumber:u,endColumn:a,message:D(t.messageText,`
`),code:t.code.toString(),tags:i,relatedInformation:this._convertRelatedInformation(e,t.relatedInformation)}}_convertRelatedInformation(e,t){if(!t)return[];let o=[];return t.forEach(s=>{let c=e;if(s.file&&(c=this._libFiles.getOrCreateModel(s.file.fileName)),!c)return;let l=s.start||0,u=s.length||1,{lineNumber:a,column:i}=c.getPositionAt(l),{lineNumber:g,column:d}=c.getPositionAt(l+u);o.push({resource:c.uri,startLineNumber:a,startColumn:i,endLineNumber:g,endColumn:d,message:D(s.messageText,`
`)})}),o}_tsDiagnosticCategoryToMarkerSeverity(e){switch(e){case 1:return n.MarkerSeverity.Error;case 3:return n.MarkerSeverity.Info;case 0:return n.MarkerSeverity.Warning;case 2:return n.MarkerSeverity.Hint}return n.MarkerSeverity.Info}},U=class C extends _{get triggerCharacters(){return["."]}async provideCompletionItems(t,o,s,c){let l=t.getWordUntilPosition(o),u=new n.Range(o.lineNumber,l.startColumn,o.lineNumber,l.endColumn),a=t.uri,i=t.getOffsetAt(o),g=await this._worker(a);if(t.isDisposed())return;let d=await g.getCompletionsAtPosition(a.toString(),i);return!d||t.isDisposed()?void 0:{suggestions:d.entries.map(h=>{let y=u;if(h.replacementSpan){let S=t.getPositionAt(h.replacementSpan.start),x=t.getPositionAt(h.replacementSpan.start+h.replacementSpan.length);y=new n.Range(S.lineNumber,S.column,x.lineNumber,x.column)}let v=[];return h.kindModifiers!==void 0&&h.kindModifiers.indexOf("deprecated")!==-1&&v.push(n.languages.CompletionItemTag.Deprecated),{uri:a,position:o,offset:i,range:y,label:h.name,insertText:h.name,sortText:h.sortText,kind:C.convertKind(h.kind),tags:v}})}}async resolveCompletionItem(t,o){let s=t,c=s.uri,l=s.position,u=s.offset,i=await(await this._worker(c)).getCompletionEntryDetails(c.toString(),u,s.label);return i?{uri:c,position:l,label:i.name,kind:C.convertKind(i.kind),detail:w(i.displayParts),documentation:{value:C.createDocumentationString(i)}}:s}static convertKind(t){switch(t){case f.primitiveType:case f.keyword:return n.languages.CompletionItemKind.Keyword;case f.variable:case f.localVariable:return n.languages.CompletionItemKind.Variable;case f.memberVariable:case f.memberGetAccessor:case f.memberSetAccessor:return n.languages.CompletionItemKind.Field;case f.function:case f.memberFunction:case f.constructSignature:case f.callSignature:case f.indexSignature:return n.languages.CompletionItemKind.Function;case f.enum:return n.languages.CompletionItemKind.Enum;case f.module:return n.languages.CompletionItemKind.Module;case f.class:return n.languages.CompletionItemKind.Class;case f.interface:return n.languages.CompletionItemKind.Interface;case f.warning:return n.languages.CompletionItemKind.File}return n.languages.CompletionItemKind.Property}static createDocumentationString(t){let o=w(t.documentation);if(t.tags)for(let s of t.tags)o+=`

${O(s)}`;return o}};function O(e){let t=`*@${e.name}*`;if(e.name==="param"&&e.text){let[o,...s]=e.text;t+=`\`${o.text}\``,s.length>0&&(t+=` \u2014 ${s.map(c=>c.text).join(" ")}`)}else Array.isArray(e.text)?t+=` \u2014 ${e.text.map(o=>o.text).join(" ")}`:e.text&&(t+=` \u2014 ${e.text}`);return t}var $=class I extends _{constructor(){super(...arguments),this.signatureHelpTriggerCharacters=["(",","]}static _toSignatureHelpTriggerReason(t){switch(t.triggerKind){case n.languages.SignatureHelpTriggerKind.TriggerCharacter:return t.triggerCharacter?t.isRetrigger?{kind:"retrigger",triggerCharacter:t.triggerCharacter}:{kind:"characterTyped",triggerCharacter:t.triggerCharacter}:{kind:"invoked"};case n.languages.SignatureHelpTriggerKind.ContentChange:return t.isRetrigger?{kind:"retrigger"}:{kind:"invoked"};case n.languages.SignatureHelpTriggerKind.Invoke:default:return{kind:"invoked"}}}async provideSignatureHelp(t,o,s,c){let l=t.uri,u=t.getOffsetAt(o),a=await this._worker(l);if(t.isDisposed())return;let i=await a.getSignatureHelpItems(l.toString(),u,{triggerReason:I._toSignatureHelpTriggerReason(c)});if(!i||t.isDisposed())return;let g={activeSignature:i.selectedItemIndex,activeParameter:i.argumentIndex,signatures:[]};return i.items.forEach(d=>{let b={label:"",parameters:[]};b.documentation={value:w(d.documentation)},b.label+=w(d.prefixDisplayParts),d.parameters.forEach((h,y,v)=>{let S=w(h.displayParts),x={label:S,documentation:{value:w(h.documentation)}};b.label+=S,b.parameters.push(x),y<v.length-1&&(b.label+=w(d.separatorDisplayParts))}),b.label+=w(d.suffixDisplayParts),g.signatures.push(b)}),{value:g,dispose(){}}}},z=class extends _{async provideHover(e,t,o){let s=e.uri,c=e.getOffsetAt(t),l=await this._worker(s);if(e.isDisposed())return;let u=await l.getQuickInfoAtPosition(s.toString(),c);if(!u||e.isDisposed())return;let a=w(u.documentation),i=u.tags?u.tags.map(d=>O(d)).join(`  

`):"",g=w(u.displayParts);return{range:this._textSpanToRange(e,u.textSpan),contents:[{value:"```typescript\n"+g+"\n```\n"},{value:a+(i?`

`+i:"")}]}}},G=class extends _{async provideDocumentHighlights(e,t,o){let s=e.uri,c=e.getOffsetAt(t),l=await this._worker(s);if(e.isDisposed())return;let u=await l.getDocumentHighlights(s.toString(),c,[s.toString()]);if(!(!u||e.isDisposed()))return u.flatMap(a=>a.highlightSpans.map(i=>({range:this._textSpanToRange(e,i.textSpan),kind:i.kind==="writtenReference"?n.languages.DocumentHighlightKind.Write:n.languages.DocumentHighlightKind.Text})))}},J=class extends _{constructor(e,t){super(t),this._libFiles=e}async provideDefinition(e,t,o){let s=e.uri,c=e.getOffsetAt(t),l=await this._worker(s);if(e.isDisposed())return;let u=await l.getDefinitionAtPosition(s.toString(),c);if(!u||e.isDisposed()||(await this._libFiles.fetchLibFilesIfNecessary(u.map(i=>n.Uri.parse(i.fileName))),e.isDisposed()))return;let a=[];for(let i of u){let g=this._libFiles.getOrCreateModel(i.fileName);g&&a.push({uri:g.uri,range:this._textSpanToRange(g,i.textSpan)})}return a}},Q=class extends _{constructor(e,t){super(t),this._libFiles=e}async provideReferences(e,t,o,s){let c=e.uri,l=e.getOffsetAt(t),u=await this._worker(c);if(e.isDisposed())return;let a=await u.getReferencesAtPosition(c.toString(),l);if(!a||e.isDisposed()||(await this._libFiles.fetchLibFilesIfNecessary(a.map(g=>n.Uri.parse(g.fileName))),e.isDisposed()))return;let i=[];for(let g of a){let d=this._libFiles.getOrCreateModel(g.fileName);d&&i.push({uri:d.uri,range:this._textSpanToRange(d,g.textSpan)})}return i}},q=class extends _{async provideDocumentSymbols(e,t){let o=e.uri,s=await this._worker(o);if(e.isDisposed())return;let c=await s.getNavigationTree(o.toString());if(!c||e.isDisposed())return;let l=(a,i)=>({name:a.text,detail:"",kind:m[a.kind]||n.languages.SymbolKind.Variable,range:this._textSpanToRange(e,a.spans[0]),selectionRange:this._textSpanToRange(e,a.spans[0]),tags:[],children:a.childItems?.map(d=>l(d,a.text)),containerName:i});return c.childItems?c.childItems.map(a=>l(a)):[]}},p,f=(p=class{},(()=>{p.unknown=""})(),(()=>{p.keyword="keyword"})(),(()=>{p.script="script"})(),(()=>{p.module="module"})(),(()=>{p.class="class"})(),(()=>{p.interface="interface"})(),(()=>{p.type="type"})(),(()=>{p.enum="enum"})(),(()=>{p.variable="var"})(),(()=>{p.localVariable="local var"})(),(()=>{p.function="function"})(),(()=>{p.localFunction="local function"})(),(()=>{p.memberFunction="method"})(),(()=>{p.memberGetAccessor="getter"})(),(()=>{p.memberSetAccessor="setter"})(),(()=>{p.memberVariable="property"})(),(()=>{p.constructorImplementation="constructor"})(),(()=>{p.callSignature="call"})(),(()=>{p.indexSignature="index"})(),(()=>{p.constructSignature="construct"})(),(()=>{p.parameter="parameter"})(),(()=>{p.typeParameter="type parameter"})(),(()=>{p.primitiveType="primitive type"})(),(()=>{p.label="label"})(),(()=>{p.alias="alias"})(),(()=>{p.const="const"})(),(()=>{p.let="let"})(),(()=>{p.warning="warning"})(),p),m=Object.create(null);m[f.module]=n.languages.SymbolKind.Module;m[f.class]=n.languages.SymbolKind.Class;m[f.enum]=n.languages.SymbolKind.Enum;m[f.interface]=n.languages.SymbolKind.Interface;m[f.memberFunction]=n.languages.SymbolKind.Method;m[f.memberVariable]=n.languages.SymbolKind.Property;m[f.memberGetAccessor]=n.languages.SymbolKind.Property;m[f.memberSetAccessor]=n.languages.SymbolKind.Property;m[f.variable]=n.languages.SymbolKind.Variable;m[f.const]=n.languages.SymbolKind.Variable;m[f.localVariable]=n.languages.SymbolKind.Variable;m[f.variable]=n.languages.SymbolKind.Variable;m[f.function]=n.languages.SymbolKind.Function;m[f.localFunction]=n.languages.SymbolKind.Function;var k=class extends _{static _convertOptions(e){return{ConvertTabsToSpaces:e.insertSpaces,TabSize:e.tabSize,IndentSize:e.tabSize,IndentStyle:2,NewLineCharacter:`
`,InsertSpaceAfterCommaDelimiter:!0,InsertSpaceAfterSemicolonInForStatements:!0,InsertSpaceBeforeAndAfterBinaryOperators:!0,InsertSpaceAfterKeywordsInControlFlowStatements:!0,InsertSpaceAfterFunctionKeywordForAnonymousFunctions:!0,InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis:!1,InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets:!1,InsertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces:!1,PlaceOpenBraceOnNewLineForControlBlocks:!1,PlaceOpenBraceOnNewLineForFunctions:!1}}_convertTextChanges(e,t){return{text:t.newText,range:this._textSpanToRange(e,t.span)}}},X=class extends k{constructor(){super(...arguments),this.canFormatMultipleRanges=!1}async provideDocumentRangeFormattingEdits(e,t,o,s){let c=e.uri,l=e.getOffsetAt({lineNumber:t.startLineNumber,column:t.startColumn}),u=e.getOffsetAt({lineNumber:t.endLineNumber,column:t.endColumn}),a=await this._worker(c);if(e.isDisposed())return;let i=await a.getFormattingEditsForRange(c.toString(),l,u,k._convertOptions(o));if(!(!i||e.isDisposed()))return i.map(g=>this._convertTextChanges(e,g))}},Y=class extends k{get autoFormatTriggerCharacters(){return[";","}",`
`]}async provideOnTypeFormattingEdits(e,t,o,s,c){let l=e.uri,u=e.getOffsetAt(t),a=await this._worker(l);if(e.isDisposed())return;let i=await a.getFormattingEditsAfterKeystroke(l.toString(),u,o,k._convertOptions(s));if(!(!i||e.isDisposed()))return i.map(g=>this._convertTextChanges(e,g))}},Z=class extends k{async provideCodeActions(e,t,o,s){let c=e.uri,l=e.getOffsetAt({lineNumber:t.startLineNumber,column:t.startColumn}),u=e.getOffsetAt({lineNumber:t.endLineNumber,column:t.endColumn}),a=k._convertOptions(e.getOptions()),i=o.markers.filter(h=>h.code).map(h=>h.code).map(Number),g=await this._worker(c);if(e.isDisposed())return;let d=await g.getCodeFixesAtPosition(c.toString(),l,u,i,a);return!d||e.isDisposed()?{actions:[],dispose:()=>{}}:{actions:d.filter(h=>h.changes.filter(y=>y.isNewFile).length===0).map(h=>this._tsCodeFixActionToMonacoCodeAction(e,o,h)),dispose:()=>{}}}_tsCodeFixActionToMonacoCodeAction(e,t,o){let s=[];for(let l of o.changes)for(let u of l.textChanges)s.push({resource:e.uri,versionId:void 0,textEdit:{range:this._textSpanToRange(e,u.span),text:u.newText}});return{title:o.description,edit:{edits:s},diagnostics:t.markers,kind:"quickfix"}}},ee=class extends _{constructor(e,t){super(t),this._libFiles=e}async provideRenameEdits(e,t,o,s){let c=e.uri,l=c.toString(),u=e.getOffsetAt(t),a=await this._worker(c);if(e.isDisposed())return;let i=await a.getRenameInfo(l,u,{allowRenameOfImportPath:!1});if(i.canRename===!1)return{edits:[],rejectReason:i.localizedErrorMessage};if(i.fileToRename!==void 0)throw new Error("Renaming files is not supported.");let g=await a.findRenameLocations(l,u,!1,!1,!1);if(!g||e.isDisposed())return;let d=[];for(let b of g){let h=this._libFiles.getOrCreateModel(b.fileName);if(h)d.push({resource:h.uri,versionId:void 0,textEdit:{range:this._textSpanToRange(h,b.textSpan),text:o}});else throw new Error(`Unknown file ${b.fileName}.`)}return{edits:d}}},te=class extends _{async provideInlayHints(e,t,o){let s=e.uri,c=s.toString(),l=e.getOffsetAt({lineNumber:t.startLineNumber,column:t.startColumn}),u=e.getOffsetAt({lineNumber:t.endLineNumber,column:t.endColumn}),a=await this._worker(s);return e.isDisposed()?null:{hints:(await a.provideInlayHints(c,l,u)).map(d=>({...d,label:d.text,position:e.getPositionAt(d.position),kind:this._convertHintKind(d.kind)})),dispose:()=>{}}}_convertHintKind(e){switch(e){case"Parameter":return n.languages.InlayHintKind.Parameter;case"Type":return n.languages.InlayHintKind.Type;default:return n.languages.InlayHintKind.Type}}},A,F;function ie(e){F=N(e,"typescript")}function ne(e){A=N(e,"javascript")}function ae(){return new Promise((e,t)=>{if(!A)return t("JavaScript not registered!");e(A)})}function oe(){return new Promise((e,t)=>{if(!F)return t("TypeScript not registered!");e(F)})}function N(e,t){let o=[],s=[],c=new W(t,e);o.push(c);let l=(...i)=>c.getLanguageServiceWorker(...i),u=new j(l);function a(){let{modeConfiguration:i}=e;M(s),i.completionItems&&s.push(n.languages.registerCompletionItemProvider(t,new U(l))),i.signatureHelp&&s.push(n.languages.registerSignatureHelpProvider(t,new $(l))),i.hovers&&s.push(n.languages.registerHoverProvider(t,new z(l))),i.documentHighlights&&s.push(n.languages.registerDocumentHighlightProvider(t,new G(l))),i.definitions&&s.push(n.languages.registerDefinitionProvider(t,new J(u,l))),i.references&&s.push(n.languages.registerReferenceProvider(t,new Q(u,l))),i.documentSymbols&&s.push(n.languages.registerDocumentSymbolProvider(t,new q(l))),i.rename&&s.push(n.languages.registerRenameProvider(t,new ee(u,l))),i.documentRangeFormattingEdits&&s.push(n.languages.registerDocumentRangeFormattingEditProvider(t,new X(l))),i.onTypeFormattingEdits&&s.push(n.languages.registerOnTypeFormattingEditProvider(t,new Y(l))),i.codeActions&&s.push(n.languages.registerCodeActionProvider(t,new Z(l))),i.inlayHints&&s.push(n.languages.registerInlayHintsProvider(t,new te(l))),i.diagnostics&&s.push(new B(u,e,t,l))}return a(),o.push(se(s)),l}function se(e){return{dispose:()=>M(e)}}function M(e){for(;e.length;)e.pop().dispose()}export{_ as Adapter,Z as CodeActionAdaptor,J as DefinitionAdapter,B as DiagnosticsAdapter,G as DocumentHighlightAdapter,X as FormatAdapter,k as FormatHelper,Y as FormatOnTypeAdapter,te as InlayHintsAdapter,f as Kind,j as LibFiles,q as OutlineAdapter,z as QuickInfoAdapter,Q as ReferenceAdapter,ee as RenameAdapter,$ as SignatureHelpAdapter,U as SuggestAdapter,W as WorkerManager,D as flattenDiagnosticMessageText,ae as getJavaScriptWorker,oe as getTypeScriptWorker,ne as setupJavaScript,ie as setupTypeScript};
/*! Bundled license information:

monaco-editor/esm/vs/language/typescript/tsMode.js:
  (*!-----------------------------------------------------------------------------
   * Copyright (c) Microsoft Corporation. All rights reserved.
   * Version: 0.47.0(69991d66135e4a1fc1cf0b1ac4ad25d429866a0d)
   * Released under the MIT license
   * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
   *-----------------------------------------------------------------------------*)
*/
//# sourceMappingURL=tsMode-E4ER45GL.js.map