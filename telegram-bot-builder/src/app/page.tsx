import FlowEditor from '@/components/editor/FlowEditor';

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-between">
      <div className="w-full h-full">
        <FlowEditor />
      </div>
    </main>
  );
}
