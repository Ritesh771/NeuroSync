import { useRef, useState, useEffect } from "react";
import { Box, HStack, Button, useToast } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";
import { YjsProvider, useYjsProvider } from "@superviz/react-sdk";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import * as monaco from "monaco-editor";
import { firestore } from "../main";
import { doc, setDoc } from "firebase/firestore";

let savedCodeCode = 0;
const ydoc = new Y.Doc();

const CodeEditor = (props: { roomId: string }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [value, setValue] = useState<string>("//Code goes here");
  const [language, setLanguage] = useState("javascript");
  const { provider } = useYjsProvider();
  const toast = useToast();

  const onMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language: any) => {
    setLanguage(language);
  };

  useEffect(() => {
    if (!provider || !editorRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    const binding = new MonacoBinding(
      ydoc.getText("monaco"),
      model,
      new Set([editorRef.current]),
      provider.awareness
    );

    return () => {
      binding.destroy();
    };
  }, [provider]);

  async function saveCode() {
    const docReference = doc(
      firestore,
      `codes/${props.roomId}/versions/${savedCodeCode++}`
    );
    const docData = { code: value };

    try {
      await setDoc(docReference, docData);
      toast({
        title: "Code saved.",
        description: "Your code has been saved successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error saving code.",
        description: "There was an error while saving your code.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Error saving code:", error);
    }
  }

  return (
    <YjsProvider doc={ydoc}>
      <Box>
        <HStack spacing={4} align="flex-start">
          <Box w="50%">
            <HStack justify="space-between" mb={4}>
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                w="100%"
                justifyContent="space-between"
              >
                <LanguageSelector language={language} onSelect={onSelect} />
                <Button
                  sx={{
                    color: "#ffffff",
                    marginTop: "1.6rem",
                    marginRight: "1.5rem",
                    fontSize: "1rem",
                    borderRadius: "6px",
                    transition: "background-color 0.2s ease-in-out",
                    _hover: {
                      bg: "rgba(248,248,255, 0.3)",
                    },
                  }}
                  onClick={saveCode}
                >
                  Save Code
                </Button>
              </Box>
            </HStack>
            <Editor
              options={{ minimap: { enabled: false } }}
              height="70vh"
              theme="vs-dark"
              language={language}
              defaultValue={CODE_SNIPPETS[language]}
              onMount={onMount}
              value={value}
              onChange={(newValue: any) => setValue(newValue)}
            />
          </Box>
          <Output editorRef={editorRef} language={language} />
        </HStack>
      </Box>
    </YjsProvider>
  );
};

export default CodeEditor;
