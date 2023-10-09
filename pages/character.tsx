// import { Button } from "../@/components/ui/button";
// import { Input } from "../@/components/ui/input";

// pages/character.tsx
const Home: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* <Input placeholder="Type in your characters description to begin generating" />
      <Button>Generate</Button> */}
    </div>
  );
};

export const ImageGenerateWrapperStyle = {
  width: "50%",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  justifyContent: "center",
  alignItems: "flex-start",

  "@media (max-width: 768px)": {
    width: "100%",
  },
};

export default Home;
