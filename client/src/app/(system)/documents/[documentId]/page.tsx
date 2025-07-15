import ContentPage from "./ContentPage";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  return (
    <>
      <ContentPage documentId={documentId} />
    </>
  );
}
