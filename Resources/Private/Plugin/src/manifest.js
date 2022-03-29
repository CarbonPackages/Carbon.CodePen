import manifest from '@neos-project/neos-ui-extensibility';

import CodeEditor from './CodeEditor'
import CodeEditorWrap from './CodeEditorWrap'

manifest('Carbon.CodeEditor', {}, globalRegistry => {
    const editorsRegistry = globalRegistry.get('inspector').get('editors');
    const secondaryEditorsRegistry = globalRegistry.get('inspector').get('secondaryEditors');

    editorsRegistry.set('Carbon.CodeEditor/CodeEditor', {
        component: CodeEditor,
        hasOwnLabel: true
    });

    secondaryEditorsRegistry.set('Carbon.CodeEditor/CodeEditorWrap', {
        component: CodeEditorWrap
    });
});
