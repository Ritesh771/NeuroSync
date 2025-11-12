import { useEffect, useState } from "react";
import getRecordings from "../services/getRecording";
import requestGenerateTranscript from "../services/requestGenerateTranscript";
import getTranscript from "../services/getTranscript";
import getQuestions from "../services/reportGetQuestions";
import getActionItems from "../services/reportGetActionItens";
import getFollowUps from "../services/reportGetFollowUps";
import getTopics from "../services/reportGetTopics";
import getSummary from "../services/reportGetSummary";
import CollapsibleText from "../components/CollapsibleText";
import ReportActionItemComponent from "../components/ReportActionItemComponent";
import styles from "../styles/reportHeader.module.css";
import { firestore } from "../main";
import { collection, getDocs } from "firebase/firestore";

const InterviewReportComponent = () => {
  const [recordId, setRecordId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  // Data of the interviews
  const [interviewsDataList, setInterviewsDataList] = useState<any | null>(
    null
  );
  const [selectedInterviewData, setSelectedInterviewData] = useState<
    any | null
  >(null);

  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [codes, setCodes] = useState<any | null>(null);
  const [meetingTranscript, setMeetingTranscript] = useState<string>(
    "Waiting for transcription...(if it's the first time here, it could take up to 20 minutes). Try again later, reload the page or check the debug section."
  );
  const [actionItens, setActionItens] = useState([{ text: "Loading..." }]);
  const [followUps, setFollowUps] = useState([{ text: "Loading..." }]);
  const [questionsReport, setQuestionsReport] = useState([
    { text: "Loading..." },
  ]);
  const [topics, setTopics] = useState([{ text: "Loading..." }]);
  const [summary, setSummary] = useState([{ text: "Loading..." }]);

  // Estados de carregamento
  const [videoStatus, setVideoStatus] = useState<string>("loading");
  const [codesStatus, setCodesStatus] = useState<string>("loading");
  const [transcriptStatus, setTranscriptStatus] = useState<string>("running");
  const [actionItemsStatus, setActionItemsStatus] = useState<string>("running");
  const [followUpsStatus, setFollowUpsStatus] = useState<string>("running");
  const [questionsStatus, setQuestionsStatus] = useState<string>("running");
  const [topicsStatus, setTopicsStatus] = useState<string>("running");
  const [summaryStatus, setSummaryStatus] = useState<string>("running");

  // Execute on first render
  useEffect(() => {
    // Get the URL params
    const params = new URLSearchParams(window.location.search);
    setRoomId(params.get("roomId"));
  }, []);

  // Execute when the roomId changes
  useEffect(() => {
    if (!roomId) {
      console.log("Room ID invalid");
      return;
    }
    async function getInterviewsDataList(room_id: string | null) {
      console.log("Requesting interviews data list...");
      try {
        const request = await getRecordings();
        const filteredData = request.data.filter(
          (recording: any) => recording.roomId == room_id
        );
        setInterviewsDataList(filteredData);
        setVideoStatus("sucess");
      } catch (error) {
        setVideoStatus("failed");
        console.error("Error getting interviews data list: ", error);
      }
    }
    getInterviewsDataList(roomId);

    async function getCodes(room_id: string) {
      console.log("Requesting codes...");
      try {
        const collectionReference = collection(
          firestore,
          `codes/${room_id}/versions`
        );
        const querySnapshot = await getDocs(collectionReference);
        const codesData = querySnapshot.docs.map((doc) => doc.data());
        setCodes(codesData);
        setCodesStatus("success");
        console.log("Codes data:", codesData);
      } catch (error) {
        setCodesStatus("failed");
        console.error("Error getting codes: ", error);
      }
    }
    getCodes(roomId);
  }, [roomId]);

  //Exectue when the interviewsDataList changes
  useEffect(() => {
    if (!interviewsDataList) {
      console.log("Interviews data list not available");
      return;
    }
    // Set the selectedInterviewData to the first interview
    setSelectedInterviewData(interviewsDataList[0]);
  }, [interviewsDataList]);

  // Execute when the interviewData changes
  useEffect(() => {
    if (!selectedInterviewData) {
      console.log("Interview data not available");
      return;
    }

    // Set the recordId and Video URL to the selectedInterviewData
    setRecordId(selectedInterviewData.uuid);
    setVideoURL(selectedInterviewData.url);
  }, [selectedInterviewData]);

  // Execute when the recordId changes
  useEffect(() => {
    if (!recordId) {
      console.warn("RecordId not available");
      return;
    }
    console.log("recordId changed to: ", recordId);

    function transformTranscriptIntoHumanFormat(transcriptBrute: any) {
      let transcript = "";
      transcriptBrute.forEach((element: any) => {
        transcript +=
          new Date(element.startTime).toUTCString() +
          " - " +
          element.username +
          ": " +
          element.content +
          "\n";
      });
      return transcript;
    }

    // First it tries to get the transcript for all the interviews, if it fails, it requests all the transcripts
    interviewsDataList.forEach((interview: any) => {
      getTranscript(interview.uuid)
        .then((transcript) => {
          console.warn("Transcript for interview ", interview.uuid, ": VALID!");

          // but shows only the selected interview transcript
          if (interview.uuid == recordId) {
            setMeetingTranscript(
              transformTranscriptIntoHumanFormat(transcript)
            );
            setTranscriptStatus("success");
            //TODO: missing the function
          }
        })
        .catch((error) => {
          setTranscriptStatus("failed");
          console.error(
            "Error getting transcript for interview ",
            interview.uuid,
            ": ",
            error
          );
          console.log("Requesting transcript for interview ", interview.uuid);
          requestGenerateTranscript(interview.uuid)
            .then(() =>
              console.warn(
                "TRANSCRIPT REQUESTED FOR SUPERVIZ, U HAVE TO WAIT. UUID: ",
                interview.uuid
              )
            )
            .catch((error) => {
              if (error.response.status == 409) {
                console.warn(
                  "Transcript already requested for SUPERVIZ. JUST wait, it could take up to 20 minutes! Interview ID",
                  interview.uuid
                );
              }
              console.error(
                "Error requesting generating transcript from SUPERVIZ, it should be done manually or reloading the page. UUID: ",
                interview.uuid,
                ": ",
                error
              );
            });
        });
    });

    // Get the action itens
    getActionItems(recordId)
      .then((actionItens) => {
        setActionItemsStatus("success");
        console.log("Action itens for interview", recordId, ": VALID!");
        setActionItens(actionItens);
      })
      .catch((error) => {
        setActionItemsStatus("failed");
        console.error(
          "Error getting action itens for interview ",
          recordId,
          ": ",
          error
        );
      });

    // Get the follow-ups
    getFollowUps(recordId)
      .then((followUps) => {
        setFollowUpsStatus("success");
        console.log("Follow-ups for interview", recordId, ": VALID!");
        setFollowUps(followUps);
      })
      .catch((error) => {
        setFollowUpsStatus("failed");
        console.error(
          "Error getting follow-ups for interview ",
          recordId,
          ": ",
          error
        );
      });

    // Get the questions
    getQuestions(recordId)
      .then((questions) => {
        setQuestionsStatus("success");
        console.log("Questions for interview", recordId, ": VALID!");
        setQuestionsReport(questions);
      })
      .catch((error) => {
        setQuestionsStatus("failed");
        console.error(
          "Error getting questions for interview ",
          recordId,
          ": ",
          error
        );
      });

    // Get the topics
    getTopics(recordId)
      .then((topics) => {
        setTopicsStatus("success");
        console.log("Topics for interview", recordId, ": VALID!");
        setTopics(topics);
      })
      .catch((error) => {
        setTopicsStatus("failed");
        console.error(
          "Error getting topics for interview ",
          recordId,
          ": ",
          error
        );
      });

    // Get the summary
    getSummary(recordId)
      .then((summary) => {
        setSummaryStatus("success");
        console.log("Summary for interview", recordId, ": VALID!");
        setSummary(summary);
      })
      .catch((error) => {
        setSummaryStatus("failed");
        console.error(
          "Error getting summary for interview ",
          recordId,
          ": ",
          error
        );
      });
  }, [recordId]);

  return (
    <div className={styles.container}>
      <div className={styles.reportHeader}>
        <div className={styles.reportHeaderContent}>
          <h3>Room ID - </h3>
          <input
            type="text"
            value={roomId || ""}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
          />
        </div>
        {interviewsDataList && (
          <>
            Record Id:
            <select
              className={styles.select}
              onChange={(e) => {
                console.log("selectedInterviewData", e.target.value);
                setSelectedInterviewData(
                  interviewsDataList.find(
                    (interview: any) => interview.uuid === e.target.value
                  )
                );
              }}
              value={recordId || ""}
            >
              <option value="" disabled>
                Select an interview
              </option>
              {interviewsDataList.map((interview: any) => (
                <option key={interview.uuid} value={interview.uuid}>
                  {new Date(interview.createdAt).toUTCString()} -{" "}
                  {interview.uuid}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Interview Video */}
      <CollapsibleText title="Interview Video" status={videoStatus}>
        {videoURL ? (
          <video controls width="1000">
            <source src={videoURL} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <p>Video not available</p>
        )}
      </CollapsibleText>

      {/* Codes */}
      <CollapsibleText title="Codes" status={codesStatus}>
        {/* map the codes here on text areas */}
        {codes ? (
          Object.keys(codes).map((key) => (
            <textarea
              key={key}
              value={codes[key].code}
              readOnly={true}
              style={{
                width: "100%",
                borderRadius: "8px",
                padding: "12px",
                height: 200,
              }}
            />
          ))
        ) : (
          <p>Codes not available</p>
        )}
      </CollapsibleText>

      <CollapsibleText title="Summary" status={summaryStatus}>
        {summary.map((summaryItem: any) => (
          <p key={summaryItem.text}>{summaryItem.text}</p>
        ))}
      </CollapsibleText>

      <CollapsibleText title="Meeting transcript" status={transcriptStatus}>
        <textarea
          value={meetingTranscript}
          readOnly={true}
          style={{ width: "100%", height: 200, color: "#fff" }}
        />      
      </CollapsibleText>

      <CollapsibleText title="Follow-ups" status={followUpsStatus}>
        {followUps.map((followUp: any) => (
          <p key={followUp.text}>{followUp.text}</p>
        ))}
      </CollapsibleText>
      <CollapsibleText title="Questions" status={questionsStatus}>
        {questionsReport.map((question: any) => (
          <p key={question.text}>{question.text}</p>
        ))}
      </CollapsibleText>
      <CollapsibleText title="Topics" status={topicsStatus}>
        {topics.map((topic: any) => (
          <p key={topic.text}>{topic.text}</p>
        ))}
      </CollapsibleText>

      <CollapsibleText title="Action itens" status={actionItemsStatus}>
        {actionItens.map((actionItem: any) => (
          <ReportActionItemComponent key={actionItem.text} text={actionItem.text} />
        ))}
      </CollapsibleText>
    </div>
  );
};

export default InterviewReportComponent;
