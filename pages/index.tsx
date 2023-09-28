import dynamic from "next/dynamic";

const Canvas = dynamic(() => import("../components/InteractiveCanvas"), {
  ssr: false,
});

export default function Home() {
  return <Canvas />;
}
