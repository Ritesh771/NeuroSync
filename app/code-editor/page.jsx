"use client";
import { useState } from "react";
import { Box, Button, useToast, ChakraProvider } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import UserInput from "@/components/codeplatform/UserInput";
// import VideoRoom from "@/components/codeplatform/VideoRoom";
// import CodeEditor from "@/components/codeplatform/CodeEditor";
import { SuperVizRoomProvider } from "@superviz/react-sdk";
import theme from "@/utils/codeplatform/theme";

const CodeEditor = dynamic(() => import("@/components/codeplatform/CodeEditor"), { ssr: false });
const VideoRoom = dynamic(() => import("@/components/codeplatform/VideoRoom"), { ssr: false });

const DEVELOPER_API_KEY = process.env.NEXT_PUBLIC_SUPERVIZ_DEVELOPER_KEY || process.env.NEXT_PUBLIC_SUPERVIZ_PRODUCTION_KEY;

function CodeEditorPage() {
    const [userID, setUserID] = useState(null);
    const [roomID, setRoomID] = useState(null);
    const toast = useToast();

    return (
        <ChakraProvider theme={theme}>
            <Box minH="100vh" bg="#0f0a19" color="gray.500" px={6} py={0}>
                {!userID && <UserInput setUserID={setUserID} setRoomID={setRoomID} />}
                {userID && roomID && (
                    <SuperVizRoomProvider
                        developerKey={DEVELOPER_API_KEY}
                        group={{ id: roomID, name: "Your Group Name" }}
                        participant={{ id: userID, name: userID }}
                        roomId={roomID}
                    >
                        <CodeEditor roomId={roomID} />
                        <VideoRoom />
                    </SuperVizRoomProvider>
                )}
                {roomID && userID && (
                    <Box
                        style={{ paddingBottom: 24 }}
                        position="relative"
                        borderRadius="full"
                        p={4}
                        boxShadow="lg"
                    >
                        <Button
                            sx={{
                                color: "#ffffff",
                                marginRight: "1.5rem",
                                fontSize: "1rem",
                                borderRadius: "6px",
                                transition: "background-color 0.2s ease-in-out",
                                _hover: {
                                    bg: "rgba(248,248,255, 0.3)",
                                },
                            }}
                            style={{ marginRight: 24 }}
                            onClick={() => {
                                const roomURL = `${window.location.origin}/code-editor?roomId=${roomID}`;
                                navigator.clipboard.writeText(roomURL);
                                toast({
                                    title: "Room ID Copied.",
                                    description: "The room link has been copied to your clipboard.",
                                    status: "success",
                                    duration: 3000,
                                    isClosable: true,
                                });
                            }}
                        >
                            Copy Room ID
                        </Button>
                        <Button
                            sx={{
                                color: "#ffffff",
                                marginRight: "1.5rem",
                                fontSize: "1rem",
                                borderRadius: "6px",
                                transition: "background-color 0.2s ease-in-out",
                                _hover: {
                                    bg: "rgba(248,248,255, 0.3)",
                                },
                            }}
                            onClick={() => {
                                // const reportURL = `${window.location.origin}/interviewReport/index.html?roomId=${roomID}`;
                                // navigator.clipboard.writeText(reportURL);
                                toast({
                                    title: "Report Link Copied.",
                                    description:
                                        "Report link not yet implemented.",
                                    status: "info",
                                    duration: 3000,
                                    isClosable: true,
                                });
                            }}
                        >
                            Get Report Link
                        </Button>
                    </Box>
                )}
            </Box>
        </ChakraProvider>
    );
}

export default CodeEditorPage;
