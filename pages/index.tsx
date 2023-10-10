import dynamic from "next/dynamic";

const Canvas = dynamic(() => import("../components/InteractiveCanvas"), {
  ssr: false,
});

export default function Home() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
      }}
    >
      <div
        style={{
          width: "100%",
          height: 40,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          flexDirection: "row",
          marginBottom: "20px",
        }}
      >
        <a href="https://pixiboo.ai">
          <p>Pre-order your artwork now!</p>
        </a>

        <button
          // onClick={handlePrint}
          style={{
            marginRight: "10px",
          }}
        >
          Print
        </button>
      </div>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          flexDirection: "column",
          marginBottom: "20px",
          marginRight: "50px",
        }}
      >
        <Canvas />
        <div style={{ width: 20 }} />
      </div>
    </div>
  );
}
