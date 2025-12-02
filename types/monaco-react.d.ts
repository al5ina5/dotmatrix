declare module '@monaco-editor/react' {
    import * as React from 'react';

    interface MonacoEditorProps {
        height?: string | number;
        value?: string;
        defaultValue?: string;
        language?: string;
        defaultLanguage?: string;
        theme?: string;
        onChange?: (value: string | undefined) => void;
        options?: any;
        className?: string;
    }

    const MonacoEditor: React.FC<MonacoEditorProps>;
    export default MonacoEditor;
}


