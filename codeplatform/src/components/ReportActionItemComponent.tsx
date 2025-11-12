const ReportActionItemComponent = (props: { text: string; score?: number }) => {
  return (
    <div>
      <h3> - {props.text}</h3>
    </div>
  );
};

export default ReportActionItemComponent;
