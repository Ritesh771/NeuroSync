import React, { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { useYjsProvider, YjsProvider } from "@superviz/react-sdk";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";

const ydoc = new Y.Doc();

const EditorRoom: React.FC = () => {
  const { provider } = useYjsProvider();
  const [editor, setEditor] = useState<any>(null);

  useEffect(() => {
    if (!provider || editor == null) return;

    const binding = new MonacoBinding(
      ydoc.getText("monaco"),
      editor.getModel()!,
      new Set([editor]),
      provider.awareness
    );

    return () => {
      binding.destroy();
    };
  }, [provider, editor]);

  return (
    <YjsProvider doc={ydoc}>
      <Editor
        defaultValue="// Connect to the room to start collaborating"
        defaultLanguage="typescript"
        onMount={(editor) => setEditor(editor)}
        options={{ padding: { top: 32 } }}
        theme="vs-dark"
      />
    </YjsProvider>
  );
};

export default EditorRoom;
