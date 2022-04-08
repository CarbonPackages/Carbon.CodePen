import manifest from '@neos-project/neos-ui-extensibility';

import CodeEditor from './CodeEditor'
import CodeEditorWrap from './CodeEditorWrap'

let config;

manifest('Carbon.CodeEditor', {}, (globalRegistry, { frontendConfiguration }) => {
    const editorsRegistry = globalRegistry.get('inspector').get('editors');
    const secondaryEditorsRegistry = globalRegistry.get('inspector').get('secondaryEditors');

    config = frontendConfiguration['Carbon.CodeEditor']

    editorsRegistry.set('Carbon.CodeEditor/CodeEditor', {
        component: CodeEditor,
        hasOwnLabel: true
    });

    secondaryEditorsRegistry.set('Carbon.CodeEditor/CodeEditorWrap', {
        component: CodeEditorWrap
    });
});

export const getPackageFrontendConfiguration = () => config;
